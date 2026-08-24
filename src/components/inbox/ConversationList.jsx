import React, { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X, Inbox as InboxIcon } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { TICKET_STATUS, CHANNEL_META } from '../../lib/constants'
import { filterTickets } from '../../lib/metrics'
import ConversationItem from './ConversationItem'
import EmptyState from '../common/EmptyState'

const TABS = [
  { key: 'ACTIVE', label: 'Ativas' },
  { key: 'PENDING', label: 'Pendentes' },
  { key: 'RESOLVED', label: 'Finalizadas' },
]

export default function ConversationList({ onPick }) {
  const app = useApp()
  const { state, dispatch, currentUser, isSupervisor } = app
  const [tab, setTab] = useState('ACTIVE')
  const [showFilters, setShowFilters] = useState(false)
  const [onlyMine, setOnlyMine] = useState(true)

  const buckets = useMemo(() => {
    const base = filterTickets(state.tickets, state.filters, app)
    const mine = (t) => !onlyMine || isSupervisor || t.assigneeId === currentUser.id
    return {
      ACTIVE: base.filter((t) => t.status === TICKET_STATUS.OPEN && mine(t)),
      PENDING: base.filter(
        (t) => t.status === TICKET_STATUS.WAITING || t.status === TICKET_STATUS.BOT,
      ),
      RESOLVED: base.filter((t) => t.status === TICKET_STATUS.RESOLVED && mine(t)),
    }
  }, [state.tickets, state.filters, onlyMine, currentUser.id, isSupervisor])

  const list = [...buckets[tab]].sort(
    (a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt),
  )

  const setFilter = (key, value) => dispatch({ type: 'SET_FILTER', key, value })
  const activeFilters =
    (state.filters.channel !== 'ALL' ? 1 : 0) + (state.filters.department !== 'ALL' ? 1 : 0)

  return (
    <aside data-tour="inbox-list" className="w-full md:w-[324px] 2xl:w-[360px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Busca */}
      <div className="p-2.5 border-b border-slate-100 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={state.filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Buscar contato, protocolo ou mensagem…"
              className="input pl-9 pr-8 py-2"
            />
            {state.filters.search && (
              <button
                onClick={() => setFilter('search', '')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative h-[38px] w-[38px] rounded-lg border flex items-center justify-center transition-colors ${
              showFilters || activeFilters
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'border-slate-300 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal size={16} />
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-2 animate-fade-in">
            <select className="input py-1.5 text-xs" value={state.filters.channel} onChange={(e) => setFilter('channel', e.target.value)}>
              <option value="ALL">Todos os canais</option>
              {state.channels.map((c) => (
                <option key={c.id} value={c.id}>{CHANNEL_META[c.type].label} · {c.name}</option>
              ))}
            </select>
            <select className="input py-1.5 text-xs" value={state.filters.department} onChange={(e) => setFilter('department', e.target.value)}>
              <option value="ALL">Todos os setores</option>
              {state.departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <label className="col-span-2 flex items-center gap-2 text-xs text-slate-600 px-1">
              <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} className="rounded border-slate-300" />
              Mostrar apenas os meus atendimentos
            </label>
          </div>
        )}

        {/* Abas */}
        <div data-tour="inbox-tabs" className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              <span className={`px-1.5 rounded-full text-[10px] font-bold ${
                tab === t.key ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-500'
              }`}>
                {buckets[t.key].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto scroll-thin divide-y divide-slate-100">
        {list.length === 0 ? (
          <EmptyState icon={InboxIcon} title="Nada por aqui" description="Nenhuma conversa nesta aba com os filtros atuais." />
        ) : (
          list.map((t) => (
            <ConversationItem
              key={t.id}
              ticket={t}
              active={t.id === state.selectedTicketId}
              onClick={() => { dispatch({ type: 'SELECT_TICKET', ticketId: t.id }); onPick?.() }}
            />
          ))
        )}
      </div>
    </aside>
  )
}
