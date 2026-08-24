import { prisma } from './prisma.js'
import { emit } from './realtime.js'
import * as bot from './bot.js'
import { sendToChannel } from './outbound.js'

/**
 * Núcleo do atendimento. Todo webhook (WhatsApp, Instagram, Webchat)
 * converge para `handleInbound` — a lógica de fila e bot fica em um lugar só.
 */

/* ------------------------------- contatos --------------------------------- */
export async function findOrCreateContact({ channel, externalId, name, phone, handle }) {
  const link = await prisma.contactChannel.findUnique({
    where: { channelId_externalId: { channelId: channel.id, externalId } },
    include: { contact: true },
  })
  if (link) return link.contact

  const contact = await prisma.contact.create({
    data: {
      name: name || phone || handle || 'Novo contato',
      phone: phone || null,
      tags: ['Novo contato'],
      channels: { create: { channelId: channel.id, externalId, handle: handle || null } },
    },
  })
  emit('contact.created', contact)
  return contact
}

/* -------------------------------- protocolo ------------------------------- */
async function nextProtocol() {
  const count = await prisma.ticket.count()
  return `#${1000 + count + 1}`
}

/* --------------------------- ticket aberto/novo --------------------------- */
export async function findOrCreateOpenTicket({ contact, channel }) {
  const existing = await prisma.ticket.findFirst({
    where: { contactId: contact.id, channelId: channel.id, status: { not: 'RESOLVED' } },
    orderBy: { createdAt: 'desc' },
  })
  if (existing) return { ticket: existing, isNew: false }

  const ticket = await prisma.ticket.create({
    data: {
      protocol: await nextProtocol(),
      contactId: contact.id,
      channelId: channel.id,
      status: 'BOT',
      subject: 'Novo contato',
      botSession: { create: { step: 'MENU_ROOT' } },
    },
  })
  emit('ticket.created', ticket)
  return { ticket, isNew: true }
}

/* ------------------------------- mensagens -------------------------------- */
export async function saveInboundMessage({ ticket, contact, payload }) {
  // idempotência: o mesmo webhook pode chegar duas vezes
  if (payload.externalId) {
    const dup = await prisma.message.findUnique({ where: { externalId: payload.externalId } })
    if (dup) return dup
  }

  const message = await prisma.message.create({
    data: {
      ticketId: ticket.id,
      authorType: 'CONTACT',
      direction: 'INBOUND',
      kind: payload.kind || 'TEXT',
      body: payload.body || '',
      mediaUrl: payload.mediaUrl || null,
      mediaName: payload.mediaName || null,
      mediaMime: payload.mediaMime || null,
      mediaSize: payload.mediaSize || null,
      externalId: payload.externalId || null,
      status: 'RECEIVED',
      raw: payload.raw || undefined,
    },
  })

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { lastActivityAt: new Date() },
  })

  emit('message.created', { ticketId: ticket.id, message })
  return message
}

export async function saveOutboundMessage({ ticketId, body, kind = 'TEXT', authorType = 'AGENT', agentId = null, externalId = null }) {
  const message = await prisma.message.create({
    data: {
      ticketId, authorType, agentId, direction: 'OUTBOUND',
      kind, body, externalId, status: 'SENT',
    },
  })
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { lastActivityAt: new Date() },
  })
  emit('message.created', { ticketId, message })
  return message
}

export async function logEvent(ticketId, body) {
  const message = await prisma.message.create({
    data: { ticketId, authorType: 'SYSTEM', direction: 'OUTBOUND', kind: 'EVENT', body, status: 'SENT' },
  })
  emit('message.created', { ticketId, message })
  return message
}

/* ------------------------------ bot de triagem ---------------------------- */
async function runBot({ ticket, contact, channel, text }) {
  const session = await prisma.botSession.upsert({
    where: { ticketId: ticket.id },
    update: {},
    create: { ticketId: ticket.id },
  })

  // Primeira interação: apenas saúda e apresenta o menu.
  if (session.step === 'MENU_ROOT' && !session.finished && session.attempts === 0 && !text) {
    const body = bot.greeting(contact.name)
    await sendToChannel({ channel, contact, body })
    await saveOutboundMessage({ ticketId: ticket.id, body, authorType: 'BOT' })
    await prisma.botSession.update({ where: { id: session.id }, data: { attempts: 1 } })
    return ticket
  }

  const choice = bot.resolveChoice(text)

  if (!choice) {
    // 3 tentativas inválidas → manda para a fila padrão para não travar o cliente
    if (session.attempts >= 3) return assignToQueue({ ticket, slug: 'comercial', subject: 'Atendimento geral' })
    const body = bot.invalid()
    await sendToChannel({ channel, contact, body })
    await saveOutboundMessage({ ticketId: ticket.id, body, authorType: 'BOT' })
    await prisma.botSession.update({ where: { id: session.id }, data: { attempts: session.attempts + 1 } })
    return ticket
  }

  await prisma.botSession.update({
    where: { id: session.id },
    data: { finished: true, step: 'DONE', answers: { choice: choice.key } },
  })
  return assignToQueue({ ticket, slug: choice.slug, subject: choice.subject, channel, contact })
}

/** Entrega o ticket para a fila do departamento (e faz o auto-assign se habilitado). */
export async function assignToQueue({ ticket, slug, subject, channel, contact }) {
  const department = await prisma.department.findUnique({ where: { slug } })
  if (!department) throw new Error(`Departamento "${slug}" não encontrado`)

  if (channel && contact) {
    const body = bot.transferText(department.name)
    await sendToChannel({ channel, contact, body })
    await saveOutboundMessage({ ticketId: ticket.id, body, authorType: 'BOT' })
  }

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      departmentId: department.id,
      status: 'WAITING',
      subject: subject || ticket.subject,
      queuedAt: new Date(),
      lastActivityAt: new Date(),
    },
  })
  await logEvent(ticket.id, `Triagem concluída — ticket direcionado à fila *${department.name}*.`)
  emit('ticket.queued', updated)

  if (department.autoAssign) await autoAssign(updated, department)
  return updated
}

/** Distribuição por menor carga entre os atendentes online do setor. */
export async function autoAssign(ticket, department) {
  const members = await prisma.departmentMember.findMany({
    where: { departmentId: department.id, user: { status: 'ONLINE', active: true } },
    include: { user: { include: { tickets: { where: { status: 'OPEN' } } } } },
  })
  if (!members.length) return null

  const free = members
    .map((m) => ({ user: m.user, load: m.user.tickets.length }))
    .filter((m) => m.load < m.user.maxConcurrent)
    .sort((a, b) => a.load - b.load)[0]
  if (!free) return null

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: { assigneeId: free.user.id, status: 'OPEN', assignedAt: new Date() },
  })
  await logEvent(ticket.id, `${free.user.name} assumiu o atendimento.`)
  emit('ticket.assigned', updated)
  return updated
}

/* ------------------------------ transferência ----------------------------- */
export async function transferTicket({ ticketId, toDepartmentId, toUserId, byUserId, reason }) {
  const current = await prisma.ticket.findUniqueOrThrow({ where: { id: ticketId } })

  const [ticket] = await prisma.$transaction([
    prisma.ticket.update({
      where: { id: ticketId },
      data: {
        departmentId: toDepartmentId,
        assigneeId: toUserId || null,
        status: toUserId ? 'OPEN' : 'WAITING',
        assignedAt: toUserId ? new Date() : null,
        queuedAt: toUserId ? current.queuedAt : new Date(),
        lastActivityAt: new Date(),
      },
    }),
    prisma.ticketTransfer.create({
      data: {
        ticketId,
        fromDepartmentId: current.departmentId,
        toDepartmentId,
        fromUserId: current.assigneeId,
        toUserId: toUserId || null,
        byUserId,
        reason: reason || null,
      },
    }),
  ])

  const dep = await prisma.department.findUnique({ where: { id: toDepartmentId } })
  await logEvent(ticketId, `Chamado transferido para *${dep?.name}*${reason ? `\nMotivo: ${reason}` : ''}`)
  emit('ticket.transferred', ticket)

  if (!toUserId && dep?.autoAssign) await autoAssign(ticket, dep)
  return ticket
}

export async function resolveTicket({ ticketId, byUserId, rating }) {
  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'RESOLVED', closedAt: new Date(), rating: rating ?? undefined },
  })
  await logEvent(ticketId, 'Atendimento finalizado.')
  emit('ticket.resolved', ticket)
  return ticket
}

/* ---------------------- ponto de entrada dos webhooks --------------------- */
/**
 * Normaliza o evento de qualquer provedor e toca o fluxo:
 * contato → ticket → mensagem → bot/fila.
 */
export async function handleInbound({ channel, externalId, name, phone, handle, message }) {
  const contact = await findOrCreateContact({ channel, externalId, name, phone, handle })
  const { ticket, isNew } = await findOrCreateOpenTicket({ contact, channel })

  await saveInboundMessage({ ticket, contact, payload: message })

  if (isNew) {
    // saudação + menu
    await runBot({ ticket, contact, channel, text: null })
    return ticket
  }

  if (ticket.status === 'BOT') {
    return runBot({ ticket, contact, channel, text: message.body })
  }

  // ticket já humano: apenas notifica o atendente (a mensagem já foi salva)
  emit('ticket.updated', ticket)
  return ticket
}
