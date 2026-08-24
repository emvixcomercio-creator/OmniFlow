import { TICKET_STATUS } from './constants'

const ms = (a, b) => new Date(a).getTime() - new Date(b).getTime()
const avg = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0)

/**
 * Agrega os KPIs do painel de supervisão a partir da lista de tickets
 * (mesma forma que o back-end retornaria em GET /api/metrics).
 */
export function computeMetrics(tickets, users, channels, departments) {
  const now = Date.now()

  const open = tickets.filter((t) => t.status === TICKET_STATUS.OPEN)
  const waiting = tickets.filter((t) => t.status === TICKET_STATUS.WAITING)
  const bot = tickets.filter((t) => t.status === TICKET_STATUS.BOT)
  const resolved = tickets.filter((t) => t.status === TICKET_STATUS.RESOLVED)

  /* Tempo médio de espera: fila -> atribuição (tickets já atendidos) */
  const waitSamples = tickets
    .filter((t) => t.assignedAt && (t.queuedAt || t.createdAt))
    .map((t) => ms(t.assignedAt, t.queuedAt || t.createdAt))
  const avgWait = avg(waitSamples)

  /* Espera atual do que ainda está na fila */
  const liveWaits = waiting.map((t) => now - new Date(t.queuedAt || t.createdAt).getTime())
  const maxWait = liveWaits.length ? Math.max(...liveWaits) : 0

  /* Tempo médio de primeira resposta humana */
  const frtSamples = tickets
    .filter((t) => t.firstResponseAt && t.assignedAt)
    .map((t) => ms(t.firstResponseAt, t.assignedAt))
  const avgFirstResponse = avg(frtSamples)

  /* Tempo médio de atendimento (abertura -> encerramento) */
  const ahtSamples = resolved
    .filter((t) => t.closedAt)
    .map((t) => ms(t.closedAt, t.assignedAt || t.createdAt))
  const avgHandling = avg(ahtSamples)

  /* SLA: entrou em atendimento dentro do prazo do departamento */
  const slaTotal = tickets.filter((t) => t.assignedAt && t.departmentId)
  const slaOk = slaTotal.filter((t) => {
    const dep = departments.find((d) => d.id === t.departmentId)
    const limit = (dep?.slaMinutes ?? 10) * 60_000
    return ms(t.assignedAt, t.queuedAt || t.createdAt) <= limit
  })
  const slaRate = slaTotal.length ? (slaOk.length / slaTotal.length) * 100 : 100

  const ratings = resolved.filter((t) => t.rating).map((t) => t.rating)
  const csat = avg(ratings)

  /* Volume por canal */
  const byChannel = channels.map((c) => {
    const list = tickets.filter((t) => t.channelId === c.id)
    return {
      channel: c,
      total: list.length,
      open: list.filter((t) => t.status === TICKET_STATUS.OPEN).length,
      waiting: list.filter((t) => t.status === TICKET_STATUS.WAITING).length,
    }
  })

  /* Filas por departamento */
  const byDepartment = departments.map((d) => {
    const list = tickets.filter((t) => t.departmentId === d.id)
    const q = list.filter((t) => t.status === TICKET_STATUS.WAITING)
    const oldest = q.length
      ? Math.max(...q.map((t) => now - new Date(t.queuedAt || t.createdAt).getTime()))
      : 0
    return {
      department: d,
      total: list.length,
      open: list.filter((t) => t.status === TICKET_STATUS.OPEN).length,
      waiting: q.length,
      oldestWait: oldest,
      breached: oldest > d.slaMinutes * 60_000,
    }
  })

  /* Produtividade por atendente */
  const byAgent = users
    .filter((u) => u.role === 'AGENT' || u.role === 'SUPERVISOR')
    .map((u) => {
      const mine = tickets.filter((t) => t.assigneeId === u.id)
      const active = mine.filter((t) => t.status === TICKET_STATUS.OPEN)
      const done = mine.filter((t) => t.status === TICKET_STATUS.RESOLVED)
      const frt = mine
        .filter((t) => t.firstResponseAt && t.assignedAt)
        .map((t) => ms(t.firstResponseAt, t.assignedAt))
      const rates = done.filter((t) => t.rating).map((t) => t.rating)
      return {
        user: u,
        active: active.length,
        resolved: done.length,
        load: u.maxConcurrent ? Math.round((active.length / u.maxConcurrent) * 100) : 0,
        avgFirstResponse: avg(frt),
        csat: avg(rates),
      }
    })
    .sort((a, b) => b.active - a.active)

  return {
    counters: {
      open: open.length,
      waiting: waiting.length,
      bot: bot.length,
      resolved: resolved.length,
      total: tickets.length,
    },
    avgWait, maxWait, avgFirstResponse, avgHandling, slaRate, csat,
    byChannel, byDepartment, byAgent,
  }
}

/** Aplica os filtros do supervisor / inbox. */
export function filterTickets(tickets, filters, helpers) {
  const q = (filters.search || '').trim().toLowerCase()
  return tickets.filter((t) => {
    if (filters.channel !== 'ALL' && t.channelId !== filters.channel) return false
    if (filters.department !== 'ALL' && t.departmentId !== filters.department) return false
    if (filters.agent !== 'ALL') {
      if (filters.agent === 'UNASSIGNED' ? t.assigneeId : t.assigneeId !== filters.agent) return false
    }
    if (filters.status !== 'ALL' && t.status !== filters.status) return false
    if (!q) return true
    const contact = helpers.getContact(t.contactId)
    const haystack = [
      contact?.name, contact?.company, contact?.phone, t.subject, t.protocol,
      ...t.messages.slice(-6).map((m) => m.body),
    ].join(' ').toLowerCase()
    return haystack.includes(q)
  })
}
