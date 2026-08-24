import { uid, nowIso } from '../lib/format'
import { TICKET_STATUS, AUTHOR, MSG_KIND } from '../lib/constants'
import { invalidText, transferText, resolveChoice, fallbackOption } from '../lib/bot'

export const DEFAULT_FILTERS = {
  search: '',
  channel: 'ALL',
  department: 'ALL',
  agent: 'ALL',
  status: 'ALL',
}

/* ------------------------------- utilitários ------------------------------ */
const mapTicket = (state, id, fn) => ({
  ...state,
  tickets: state.tickets.map((t) => (t.id === id ? fn(t) : t)),
})

const push = (ticket, entry) => ({
  ...ticket,
  messages: [...ticket.messages, entry],
  lastActivityAt: entry.createdAt,
})

const event = (ticketId, body) => ({
  id: uid('msg'), ticketId, authorType: AUTHOR.SYSTEM, authorId: null,
  kind: MSG_KIND.EVENT, body, attachment: null, status: 'RECEIVED', createdAt: nowIso(),
})

const deptName = (state, id) => state.departments.find((d) => d.id === id)?.name || '—'
const userName = (state, id) => state.users.find((u) => u.id === id)?.name || 'Sistema'

/* --------------------------------- reducer -------------------------------- */
export function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, authed: true, currentUserId: action.userId, view: 'inbox' }

    case 'LOGOUT':
      return { ...state, authed: false, spyTicketId: null }

    case 'UPDATE_BOT_CONFIG':
      return { ...state, botConfig: { ...state.botConfig, ...action.config } }

    case 'SET_VIEW':
      return { ...state, view: action.view }

    case 'SET_CURRENT_USER': {
      const user = state.users.find((u) => u.id === action.userId)
      const view = user && user.role === 'AGENT' ? 'inbox' : state.view
      return { ...state, currentUserId: action.userId, view }
    }

    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, [action.key]: action.value } }

    case 'RESET_FILTERS':
      return { ...state, filters: { ...DEFAULT_FILTERS } }

    case 'SELECT_TICKET':
      return mapTicket({ ...state, selectedTicketId: action.ticketId }, action.ticketId, (t) => ({
        ...t, unread: 0,
      }))

    case 'SET_SPY':
      return { ...state, spyTicketId: action.ticketId }

    case 'TOGGLE_SIMULATION':
      return { ...state, simulation: !state.simulation }

    /* Liga/desliga a simulação por valor — usado pelo tour guiado, que
       precisa de uma ação idempotente (efeitos podem rodar duas vezes). */
    case 'SET_SIMULATION':
      return { ...state, simulation: action.value }

    /* ------------------------- mensagens do atendente ------------------------ */
    case 'SEND_MESSAGE': {
      const msg = {
        id: uid('msg'),
        ticketId: action.ticketId,
        authorType: AUTHOR.AGENT,
        authorId: action.authorId,
        kind: action.kind || MSG_KIND.TEXT,
        body: action.body,
        attachment: action.attachment || null,
        status: 'SENT',
        createdAt: nowIso(),
      }
      return mapTicket(state, action.ticketId, (t) => ({
        ...push(t, msg),
        firstResponseAt: t.firstResponseAt || msg.createdAt,
      }))
    }

    case 'UPDATE_MESSAGE_STATUS':
      return mapTicket(state, action.ticketId, (t) => ({
        ...t,
        messages: t.messages.map((mm) =>
          mm.id === action.messageId ? { ...mm, status: action.status } : mm,
        ),
      }))

    /* Recibo de entrega/leitura da última mensagem enviada pelo atendente. */
    case 'ACK_LAST':
      return mapTicket(state, action.ticketId, (t) => {
        const lastOut = [...t.messages].reverse().find((mm) => mm.authorType === AUTHOR.AGENT)
        if (!lastOut) return t
        return {
          ...t,
          messages: t.messages.map((mm) =>
            mm.id === lastOut.id ? { ...mm, status: action.status } : mm,
          ),
        }
      })

    /* ------------------------------ nota interna ----------------------------- */
    case 'ADD_NOTE': {
      const note = {
        id: uid('note'),
        ticketId: action.ticketId,
        authorId: action.authorId,
        body: action.body,
        kind: MSG_KIND.NOTE,
        createdAt: nowIso(),
      }
      return mapTicket(state, action.ticketId, (t) => ({ ...t, notes: [...t.notes, note] }))
    }

    /* --------------------------- mensagem recebida --------------------------- */
    case 'INBOUND_MESSAGE': {
      const t0 = state.tickets.find((t) => t.id === action.ticketId)
      if (!t0) return state
      const msg = {
        id: uid('msg'),
        ticketId: action.ticketId,
        authorType: AUTHOR.CONTACT,
        authorId: t0.contactId,
        kind: action.kind || MSG_KIND.TEXT,
        body: action.body,
        attachment: action.attachment || null,
        status: 'RECEIVED',
        createdAt: nowIso(),
      }
      const isOpen = state.selectedTicketId === action.ticketId && state.view === 'inbox'
      return mapTicket(state, action.ticketId, (t) => ({
        ...push(t, msg),
        typing: false,
        unread: isOpen ? 0 : t.unread + 1,
      }))
    }

    case 'SET_TYPING':
      return mapTicket(state, action.ticketId, (t) => ({ ...t, typing: action.typing }))

    /* ------------------------- novo ticket (webhook) ------------------------- */
    case 'NEW_TICKET': {
      const { contact, ticket } = action
      return {
        ...state,
        contacts: state.contacts.some((c) => c.id === contact.id)
          ? state.contacts
          : [...state.contacts, contact],
        tickets: [...state.tickets, ticket],
      }
    }

    /* --------------------- bot: saudação + menu de triagem ------------------- */
    case 'BOT_GREET': {
      const greet = {
        id: uid('msg'), ticketId: action.ticketId, authorType: AUTHOR.BOT, authorId: null,
        kind: MSG_KIND.TEXT, body: action.body, attachment: null,
        status: 'RECEIVED', createdAt: nowIso(),
      }
      return mapTicket(state, action.ticketId, (t) => push(t, greet))
    }

    /* -------------------------- bot: escolha do menu ------------------------- */
    case 'BOT_CHOICE': {
      const t0 = state.tickets.find((t) => t.id === action.ticketId)
      if (!t0) return state
      const config = state.botConfig
      const attempts = (t0.botAttempts || 0) + 1
      const choice = resolveChoice(config, action.text)

      // 1) eco da resposta do contato
      const reply = {
        id: uid('msg'), ticketId: t0.id, authorType: AUTHOR.CONTACT, authorId: t0.contactId,
        kind: MSG_KIND.TEXT, body: action.text, attachment: null, status: 'RECEIVED',
        createdAt: nowIso(),
      }

      // errou vezes demais: em vez de prender o cliente, vai para a fila padrão
      const giveUp = !choice && attempts >= (config.maxAttempts || 3)
      if (!choice && !giveUp) {
        const retry = {
          id: uid('msg'), ticketId: t0.id, authorType: AUTHOR.BOT, authorId: null,
          kind: MSG_KIND.TEXT, body: invalidText(config),
          attachment: null, status: 'RECEIVED', createdAt: nowIso(),
        }
        return mapTicket(state, t0.id, (t) => ({
          ...push(push(t, reply), retry),
          botAttempts: attempts,
        }))
      }

      const picked = choice || fallbackOption(config)
      const dept = state.departments.find((d) => d.id === picked.departmentId)
      const confirm = {
        id: uid('msg'), ticketId: t0.id, authorType: AUTHOR.BOT, authorId: null,
        kind: MSG_KIND.TEXT, body: transferText(config, dept?.name || '—'),
        attachment: null, status: 'RECEIVED', createdAt: nowIso(),
      }
      const ev = event(t0.id, `Triagem concluída — ticket direcionado à fila *${dept?.name}*.`)

      return mapTicket(state, t0.id, (t) => ({
        ...push(push(push(t, reply), confirm), ev),
        status: TICKET_STATUS.WAITING,
        departmentId: picked.departmentId,
        subject: picked.subject,
        queuedAt: nowIso(),
        awaitingBotChoice: false,
        botAttempts: 0,
      }))
    }

    /* --------------------------- fila / atribuição --------------------------- */
    case 'ASSIGN': {
      const name = userName(state, action.agentId)
      const ev = event(action.ticketId, `${name} assumiu o atendimento.`)
      return mapTicket(state, action.ticketId, (t) => ({
        ...push(t, ev),
        assigneeId: action.agentId,
        status: TICKET_STATUS.OPEN,
        assignedAt: t.assignedAt || nowIso(),
      }))
    }

    case 'RETURN_TO_QUEUE': {
      const ev = event(action.ticketId, 'Atendimento devolvido para a fila do departamento.')
      return mapTicket(state, action.ticketId, (t) => ({
        ...push(t, ev),
        assigneeId: null,
        status: TICKET_STATUS.WAITING,
        queuedAt: nowIso(),
      }))
    }

    /* ------------------------------ transferência ---------------------------- */
    case 'TRANSFER': {
      const to = deptName(state, action.departmentId)
      const agent = action.agentId ? userName(state, action.agentId) : null
      const by = userName(state, action.byId)
      const body =
        `Transferido por ${by} para *${to}*` +
        (agent ? ` → ${agent}` : ' (fila do setor)') +
        (action.reason ? `\nMotivo: ${action.reason}` : '')
      const ev = event(action.ticketId, body)
      return mapTicket(state, action.ticketId, (t) => ({
        ...push(t, ev),
        departmentId: action.departmentId,
        assigneeId: action.agentId || null,
        status: action.agentId ? TICKET_STATUS.OPEN : TICKET_STATUS.WAITING,
        assignedAt: action.agentId ? nowIso() : null,
        queuedAt: action.agentId ? t.queuedAt : nowIso(),
        priority: action.priority || t.priority,
      }))
    }

    case 'SET_PRIORITY':
      return mapTicket(state, action.ticketId, (t) => ({ ...t, priority: action.priority }))

    case 'ADD_TAG':
      return mapTicket(state, action.ticketId, (t) =>
        t.tags.includes(action.tag) ? t : { ...t, tags: [...t.tags, action.tag] },
      )

    /* ------------------------------ encerramento ----------------------------- */
    case 'RESOLVE': {
      const by = userName(state, action.byId)
      const ev = event(action.ticketId, `Atendimento finalizado por ${by}.`)
      return mapTicket(state, action.ticketId, (t) => ({
        ...push(t, ev),
        status: TICKET_STATUS.RESOLVED,
        closedAt: nowIso(),
        unread: 0,
        typing: false,
      }))
    }

    case 'REOPEN': {
      const ev = event(action.ticketId, 'Atendimento reaberto.')
      return mapTicket(state, action.ticketId, (t) => ({
        ...push(t, ev),
        status: t.assigneeId ? TICKET_STATUS.OPEN : TICKET_STATUS.WAITING,
        closedAt: null,
      }))
    }

    default:
      return state
  }
}
