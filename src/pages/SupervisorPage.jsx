import React, { useMemo } from 'react'
import {
  Timer, MessageSquare, Users, CheckCircle2, Gauge, Star, Bot, AlertTriangle, Activity,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { computeMetrics, filterTickets } from '../lib/metrics'
import { duration } from '../lib/format'
import MetricCard from '../components/supervisor/MetricCard'
import FilterBar from '../components/supervisor/FilterBar'
import ChannelVolume from '../components/supervisor/ChannelVolume'
import DepartmentQueues from '../components/supervisor/DepartmentQueues'
import AgentTable from '../components/supervisor/AgentTable'
import LiveBoard from '../components/supervisor/LiveBoard'
import SpyDrawer from '../components/supervisor/SpyDrawer'

export default function SupervisorPage() {
  const app = useApp()
  const { state, dispatch } = app

  const visible = useMemo(
    () => filterTickets(state.tickets, state.filters, app),
    [state.tickets, state.filters],
  )

  const metrics = useMemo(
    () => computeMetrics(visible, state.users, state.channels, state.departments),
    [visible, state.users, state.channels, state.departments],
  )

  const slaTone = metrics.slaRate >= 90 ? 'emerald' : metrics.slaRate >= 70 ? 'amber' : 'red'

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scroll-thin bg-slate-100">
      <div className="px-5 py-4 max-w-[1500px] mx-auto space-y-4">
        <header className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <h1 className="text-xl font-bold text-slate-800">Painel de supervisão</h1>
            <p className="text-sm text-slate-500">
              Monitoramento em tempo real das filas, canais e equipe de atendimento.
            </p>
          </div>
          <span className={`chip px-3 py-1.5 ${state.simulation ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
            <Activity size={13} /> {state.simulation ? 'Dados ao vivo' : 'Tela estável'}
          </span>
        </header>

        <FilterBar />

        <div data-tour="kpi-row" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <MetricCard
            icon={Timer} tone="brand" label="Espera média"
            value={duration(metrics.avgWait)}
            hint={`pior agora ${duration(metrics.maxWait)}`}
          />
          <MetricCard
            icon={MessageSquare} tone="emerald" label="Em atendimento"
            value={metrics.counters.open} hint={`${metrics.counters.total} tickets no filtro`}
          />
          <MetricCard
            icon={AlertTriangle} tone="amber" label="Na fila"
            value={metrics.counters.waiting} hint={`${metrics.counters.bot} no bot de triagem`}
          />
          <MetricCard
            icon={Gauge} tone={slaTone} label="SLA"
            value={`${metrics.slaRate.toFixed(0)}%`} hint="no prazo do setor"
          />
          <MetricCard
            icon={CheckCircle2} tone="slate" label="Finalizados"
            value={metrics.counters.resolved} hint={`TMA ${duration(metrics.avgHandling)}`}
          />
          <MetricCard
            icon={Star} tone="violet" label="CSAT"
            value={metrics.csat ? `${metrics.csat.toFixed(1)}/5` : '--'}
            hint={`1ª resposta ${duration(metrics.avgFirstResponse)}`}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <LiveBoard
              tickets={visible}
              onSpy={(id) => dispatch({ type: 'SET_SPY', ticketId: id })}
            />
            <AgentTable
              data={metrics.byAgent}
              onFilterAgent={(id) =>
                dispatch({
                  type: 'SET_FILTER',
                  key: 'agent',
                  value: state.filters.agent === id ? 'ALL' : id,
                })
              }
            />
          </div>

          <div className="space-y-4">
            <ChannelVolume data={metrics.byChannel} />
            <DepartmentQueues data={metrics.byDepartment} />
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Bot size={15} className="text-violet-500" /> Bot de triagem
              </h3>
              <p className="text-xs text-slate-500">
                {metrics.counters.bot} contato(s) respondendo o menu automático agora. O bot
                classifica o assunto e entrega o chamado direto na fila do setor correto.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-violet-50 p-2.5">
                  <p className="text-[10px] uppercase font-semibold text-violet-500">Triados hoje</p>
                  <p className="text-lg font-bold text-violet-700">
                    {state.tickets.filter((t) => t.queuedAt).length}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Sem intervenção</p>
                  <p className="text-lg font-bold text-slate-700">
                    {Math.round(
                      (state.tickets.filter((t) => t.queuedAt).length /
                        Math.max(1, state.tickets.length)) * 100,
                    )}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {state.spyTicketId && (
        <SpyDrawer
          ticketId={state.spyTicketId}
          onClose={() => dispatch({ type: 'SET_SPY', ticketId: null })}
        />
      )}
    </div>
  )
}
