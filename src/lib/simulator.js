import { useEffect } from 'react'
import { uid, nowIso, pick } from './format'
import { TICKET_STATUS, AUTHOR, MSG_KIND } from './constants'
import { CUSTOMER_LINES, FIRST_CONTACT_LINES } from './replies'
import { activeOptions, greetingText } from './bot'
import { INBOUND_POOL } from '../data/seed'

const TICK_MS = 4500

/**
 * Motor de "tempo real". Substitua por um socket (Socket.IO / Pusher / SSE)
 * apontando para os webhooks do back-end — os eventos despachados são os mesmos.
 */
export function useSimulator({ enabled, stateRef, dispatch }) {
  useEffect(() => {
    if (!enabled) return
    const timers = new Set()
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); fn() }, ms)
      timers.add(id)
      return id
    }

    const interval = setInterval(() => tick(stateRef.current, dispatch, later), TICK_MS)

    return () => {
      clearInterval(interval)
      timers.forEach(clearTimeout)
    }
  }, [enabled, stateRef, dispatch])
}

function tick(state, dispatch, later) {
  if (!state) return
  const roll = Math.random()

  // 1) Contatos parados no bot respondem o menu
  const inBot = state.tickets.filter(
    (t) => t.status === TICKET_STATUS.BOT && Date.now() - new Date(t.lastActivityAt) > 6000,
  )
  if (inBot.length && roll < 0.55) {
    const t = pick(inBot)
    dispatch({ type: 'SET_TYPING', ticketId: t.id, typing: true })
    later(() => {
      dispatch({ type: 'SET_TYPING', ticketId: t.id, typing: false })
      const opts = activeOptions(state.botConfig)
      const answer = Math.random() < 0.15 || !opts.length ? 'oi?' : pick(opts).key
      dispatch({ type: 'BOT_CHOICE', ticketId: t.id, text: answer })
    }, 1400)
    return
  }

  // 2) Novo contato chegando por um canal aleatório
  if (roll < 0.22) {
    createInboundTicket(state, dispatch, later)
    return
  }

  // 3) Mensagem nova em conversa já aberta
  const openTickets = state.tickets.filter((t) => t.status === TICKET_STATUS.OPEN)
  if (openTickets.length && roll < 0.62) {
    const t = pick(openTickets)
    const pool = CUSTOMER_LINES[t.departmentId] || CUSTOMER_LINES.default
    dispatch({ type: 'SET_TYPING', ticketId: t.id, typing: true })
    later(() => dispatch({ type: 'INBOUND_MESSAGE', ticketId: t.id, body: pick(pool) }), 1800)
    return
  }

  // 4) Outro atendente puxa um chamado da fila (mostra a fila andando)
  const waiting = state.tickets.filter(
    (t) => t.status === TICKET_STATUS.WAITING && t.departmentId,
  )
  if (waiting.length && roll < 0.78) {
    const t = pick(waiting)
    const candidates = state.users.filter(
      (u) => u.role === 'AGENT' && u.id !== state.currentUserId &&
        u.status === 'ONLINE' && u.departmentIds.includes(t.departmentId),
    )
    if (candidates.length) {
      dispatch({ type: 'ASSIGN', ticketId: t.id, agentId: pick(candidates).id })
    }
  }
}

function createInboundTicket(state, dispatch, later) {
  const person = pick(INBOUND_POOL)
  const channel = pick(state.channels.filter((c) => c.active))
  const contactId = uid('c')
  const ticketId = uid('tk')

  const contact = {
    id: contactId,
    name: person.name,
    phone: person.phone,
    email: `${person.name.toLowerCase().split(' ')[0]}@email.com`,
    company: person.company,
    city: person.city,
    avatarColor: person.avatarColor,
    tags: ['Novo contato'],
    createdAt: nowIso(),
  }

  const msg = (authorType, authorId, body) => ({
    id: uid('msg'), ticketId, authorType, authorId, kind: MSG_KIND.TEXT,
    body, attachment: null, status: 'RECEIVED', createdAt: nowIso(),
  })

  const ticket = {
    id: ticketId,
    protocol: `#${Math.floor(2000 + Math.random() * 8000)}`,
    contactId,
    channelId: channel.id,
    departmentId: null,
    assigneeId: null,
    status: TICKET_STATUS.BOT,
    priority: 'NORMAL',
    subject: 'Novo contato',
    createdAt: nowIso(),
    queuedAt: null,
    assignedAt: null,
    firstResponseAt: null,
    closedAt: null,
    lastActivityAt: nowIso(),
    unread: 1,
    rating: null,
    typing: false,
    tags: [],
    awaitingBotChoice: true,
    messages: [msg(AUTHOR.CONTACT, contactId, pick(FIRST_CONTACT_LINES))],
    notes: [],
  }

  dispatch({ type: 'NEW_TICKET', contact, ticket })

  // o bot responde a saudação + menu logo em seguida
  later(() => {
    dispatch({
      type: 'BOT_GREET',
      ticketId,
      body: greetingText(state.botConfig, person.name),
    })
  }, 900)
}
