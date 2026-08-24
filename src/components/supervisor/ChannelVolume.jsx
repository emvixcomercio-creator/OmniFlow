import React from 'react'
import ChannelIcon from '../common/ChannelIcon'
import { CHANNEL_META } from '../../lib/constants'

/** Volume por canal — barras proporcionais, sem dependência de lib de gráfico. */
export default function ChannelVolume({ data }) {
  const max = Math.max(1, ...data.map((d) => d.total))
  const total = data.reduce((s, d) => s + d.total, 0)

  return (
    <div className="card p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Volume por canal</h3>
        <span className="text-xs text-slate-400">{total} atendimentos</span>
      </div>

      <div className="space-y-3">
        {data.map(({ channel, total: t, open, waiting }) => {
          const meta = CHANNEL_META[channel.type]
          const pct = Math.round((t / max) * 100)
          return (
            <div key={channel.id}>
              <div className="flex items-center gap-2 mb-1">
                <ChannelIcon type={channel.type} size="sm" />
                <span className="text-xs font-medium text-slate-700 flex-1 truncate">{channel.name}</span>
                <span className="text-xs font-semibold text-slate-800 tabular-nums">{t}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: meta.color }}
                />
              </div>
              <div className="flex gap-3 mt-1">
                <span className="text-[10px] text-slate-400">{open} em atendimento</span>
                <span className="text-[10px] text-amber-600">{waiting} na fila</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
