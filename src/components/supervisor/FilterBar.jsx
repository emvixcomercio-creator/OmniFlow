import React from 'react'
import { Filter, RotateCcw, Search } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { CHANNEL_META, STATUS_META } from '../../lib/constants'

export default function FilterBar() {
  const { state, dispatch, agents } = useApp()
  const set = (key, value) => dispatch({ type: 'SET_FILTER', key, value })
  const f = state.filters
  const dirty = f.channel !== 'ALL' || f.department !== 'ALL' || f.agent !== 'ALL' || f.status !== 'ALL' || f.search

  return (
    <div className="card p-3 flex flex-wrap items-center gap-2">
      <span className="chip bg-slate-100 text-slate-600"><Filter size={12} /> Filtros</span>

      <div className="relative flex-1 min-w-[180px]">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={f.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Buscar contato, protocolo…"
          className="input py-1.5 pl-8 text-xs"
        />
      </div>

      <select value={f.channel} onChange={(e) => set('channel', e.target.value)} className="input py-1.5 text-xs w-auto">
        <option value="ALL">Todos os canais</option>
        {state.channels.map((c) => (
          <option key={c.id} value={c.id}>{CHANNEL_META[c.type].label} · {c.name}</option>
        ))}
      </select>

      <select value={f.department} onChange={(e) => set('department', e.target.value)} className="input py-1.5 text-xs w-auto">
        <option value="ALL">Todos os setores</option>
        {state.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>

      <select value={f.agent} onChange={(e) => set('agent', e.target.value)} className="input py-1.5 text-xs w-auto">
        <option value="ALL">Todos os atendentes</option>
        <option value="UNASSIGNED">Sem responsável (fila)</option>
        {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>

      <select value={f.status} onChange={(e) => set('status', e.target.value)} className="input py-1.5 text-xs w-auto">
        <option value="ALL">Todas as situações</option>
        {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>

      {dirty && (
        <button onClick={() => dispatch({ type: 'RESET_FILTERS' })} className="btn-ghost py-1.5 text-xs">
          <RotateCcw size={13} /> Limpar
        </button>
      )}
    </div>
  )
}
