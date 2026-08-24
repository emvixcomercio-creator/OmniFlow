import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { sendToChannel } from '../lib/outbound.js'
import {
  saveOutboundMessage, transferTicket, resolveTicket, logEvent,
} from '../lib/ticketService.js'
import { emit } from '../lib/realtime.js'

export const api = Router()

const TICKET_INCLUDE = {
  contact: true,
  channel: true,
  department: true,
  assignee: { select: { id: true, name: true, avatarUrl: true, status: true } },
  messages: { orderBy: { createdAt: 'asc' } },
  internal: { orderBy: { createdAt: 'asc' }, include: { author: { select: { id: true, name: true } } } },
}

/* ------------------------------- listagem --------------------------------- */
api.get('/tickets', async (req, res) => {
  const { status, departmentId, assigneeId, channelId, q } = req.query
  const tickets = await prisma.ticket.findMany({
    where: {
      status: status || undefined,
      departmentId: departmentId || undefined,
      assigneeId: assigneeId === 'UNASSIGNED' ? null : assigneeId || undefined,
      channelId: channelId || undefined,
      ...(q
        ? {
            OR: [
              { protocol: { contains: q, mode: 'insensitive' } },
              { subject: { contains: q, mode: 'insensitive' } },
              { contact: { name: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    include: TICKET_INCLUDE,
    orderBy: { lastActivityAt: 'desc' },
    take: 200,
  })
  res.json(tickets)
})

api.get('/tickets/:id', async (req, res) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: req.params.id },
    include: TICKET_INCLUDE,
  })
  if (!ticket) return res.sendStatus(404)
  res.json(ticket)
})

/* -------------------------- resposta do atendente ------------------------- */
api.post('/tickets/:id/messages', async (req, res) => {
  const { body, agentId, kind = 'TEXT' } = req.body
  const ticket = await prisma.ticket.findUniqueOrThrow({
    where: { id: req.params.id },
    include: { channel: true, contact: true },
  })

  const externalId = await sendToChannel({ channel: ticket.channel, contact: ticket.contact, body })
  const message = await saveOutboundMessage({ ticketId: ticket.id, body, kind, agentId, externalId })

  if (!ticket.firstResponseAt) {
    await prisma.ticket.update({ where: { id: ticket.id }, data: { firstResponseAt: new Date() } })
  }
  res.status(201).json(message)
})

/* ------------------------------ nota interna ------------------------------ */
api.post('/tickets/:id/notes', async (req, res) => {
  const { body, authorId, pinned = false } = req.body
  const note = await prisma.note.create({
    data: { ticketId: req.params.id, authorId, body, pinned },
    include: { author: { select: { id: true, name: true } } },
  })
  emit('note.created', { ticketId: req.params.id, note })
  res.status(201).json(note)
})

/* ------------------------- fila / transferência --------------------------- */
api.post('/tickets/:id/assign', async (req, res) => {
  const { agentId } = req.body
  const ticket = await prisma.ticket.update({
    where: { id: req.params.id },
    data: { assigneeId: agentId, status: 'OPEN', assignedAt: new Date() },
  })
  const user = await prisma.user.findUnique({ where: { id: agentId } })
  await logEvent(ticket.id, `${user?.name} assumiu o atendimento.`)
  emit('ticket.assigned', ticket)
  res.json(ticket)
})

api.post('/tickets/:id/transfer', async (req, res) => {
  const { toDepartmentId, toUserId, byUserId, reason } = req.body
  res.json(await transferTicket({ ticketId: req.params.id, toDepartmentId, toUserId, byUserId, reason }))
})

api.post('/tickets/:id/resolve', async (req, res) => {
  const { byUserId, rating } = req.body
  res.json(await resolveTicket({ ticketId: req.params.id, byUserId, rating }))
})

/* --------------------------------- apoio ---------------------------------- */
api.get('/departments', async (_req, res) => {
  res.json(await prisma.department.findMany({ orderBy: { name: 'asc' } }))
})

api.get('/channels', async (_req, res) => {
  res.json(await prisma.channel.findMany({ where: { active: true } }))
})

api.get('/users', async (_req, res) => {
  res.json(
    await prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, email: true, role: true, status: true, maxConcurrent: true },
    }),
  )
})

/* -------------------------------- métricas -------------------------------- */
api.get('/metrics', async (req, res) => {
  const since = req.query.since ? new Date(req.query.since) : new Date(Date.now() - 86400000)
  const tickets = await prisma.ticket.findMany({
    where: { createdAt: { gte: since } },
    select: {
      id: true, status: true, channelId: true, departmentId: true, assigneeId: true,
      createdAt: true, queuedAt: true, assignedAt: true, firstResponseAt: true,
      closedAt: true, rating: true,
    },
  })

  const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0)
  const waits = tickets
    .filter((t) => t.assignedAt)
    .map((t) => t.assignedAt - (t.queuedAt || t.createdAt))
  const handling = tickets
    .filter((t) => t.closedAt)
    .map((t) => t.closedAt - (t.assignedAt || t.createdAt))

  res.json({
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'OPEN').length,
    waiting: tickets.filter((t) => t.status === 'WAITING').length,
    bot: tickets.filter((t) => t.status === 'BOT').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
    avgWaitMs: avg(waits),
    avgHandlingMs: avg(handling),
    csat: avg(tickets.filter((t) => t.rating).map((t) => t.rating)),
  })
})
