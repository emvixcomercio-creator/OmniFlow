import React, { createContext, useContext, useMemo, useReducer, useRef, useEffect } from 'react'
import { reducer, DEFAULT_FILTERS } from './reducer'
import * as seed from '../data/seed'
import { DEFAULT_BOT_CONFIG } from '../lib/bot'
import { useSimulator } from '../lib/simulator'

const AppContext = createContext(null)

/** Sessão simples guardada no navegador — a demo volta onde parou. */
const savedSession = (() => {
  try { return JSON.parse(localStorage.getItem('omniflow.session') || 'null') } catch { return null }
})()

const initialState = {
  authed: Boolean(savedSession),
  users: seed.users,
  departments: seed.departments,
  channels: seed.channels,
  contacts: seed.contacts,
  tickets: seed.tickets,
  currentUserId: savedSession?.userId || seed.CURRENT_AGENT_ID,
  view: 'inbox',
  selectedTicketId: 'tk-1',
  spyTicketId: null,
  filters: { ...DEFAULT_FILTERS },
  botConfig: DEFAULT_BOT_CONFIG,
  simulation: false,   // nada se move sozinho até alguém ligar
  entryMode: null,     // 'apresentacao' | 'sistema'
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // ref sempre atualizada — o simulador lê o estado mais recente sem re-registrar timers
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  useSimulator({ enabled: state.simulation && state.authed, stateRef, dispatch })

  // mantém a sessão entre recarregamentos
  useEffect(() => {
    try {
      if (state.authed) localStorage.setItem('omniflow.session', JSON.stringify({ userId: state.currentUserId }))
      else localStorage.removeItem('omniflow.session')
    } catch { /* navegador em modo privado */ }
  }, [state.authed, state.currentUserId])

  const value = useMemo(() => ({ state, dispatch, ...selectors(state) }), [state])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>')
  return ctx
}

/* -------------------------------- selectors ------------------------------- */
function selectors(state) {
  const byId = (list, id) => list.find((x) => x.id === id) || null

  const currentUser = byId(state.users, state.currentUserId)
  const isSupervisor = currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'ADMIN'

  const getContact = (id) => byId(state.contacts, id)
  const getChannel = (id) => byId(state.channels, id)
  const getDepartment = (id) => byId(state.departments, id)
  const getUser = (id) => byId(state.users, id)
  const getTicket = (id) => byId(state.tickets, id)

  /** Timeline = mensagens + notas internas, ordenadas por horário. */
  const timeline = (ticket) =>
    ticket
      ? [...ticket.messages, ...ticket.notes].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        )
      : []

  const lastMessage = (ticket) => {
    const visible = ticket.messages.filter((m) => m.kind !== 'EVENT')
    return visible[visible.length - 1] || ticket.messages[ticket.messages.length - 1] || null
  }

  const contactHistory = (contactId, exceptTicketId) =>
    state.tickets
      .filter((t) => t.contactId === contactId && t.id !== exceptTicketId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const agents = state.users.filter((u) => u.role === 'AGENT')

  return {
    currentUser, isSupervisor, agents,
    getContact, getChannel, getDepartment, getUser, getTicket,
    timeline, lastMessage, contactHistory,
  }
}
