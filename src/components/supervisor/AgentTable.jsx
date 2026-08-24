import React from 'react'
import { Star } from 'lucide-react'
import Avatar from '../common/Avatar'
import { duration } from '../../lib/format'

const PRESENCE_LABEL = { ONLINE: 'Disponível', BUSY: 'Ocupado', AWAY: 'Ausente', OFFLINE: 'Offline' }

/** Conversas ativas por atendente + carga de trabalho. */
export default function AgentTable({ data, onFilterAgent }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">Conversas ativas por atendente</h3>
      </div>

      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-slate-400 bg-slate-50">
              <th className="text-left font-semibold px-4 py-2">Atendente</th>
              <th className="text-center font-semibold px-3 py-2">Ativas</th>
              <th className="text-left font-semibold px-3 py-2 w-40">Carga</th>
              <th className="text-center font-semibold px-3 py-2">1ª resposta</th>
              <th className="text-center font-semibold px-3 py-2">Finalizados</th>
              <th className="text-center font-semibold px-3 py-2">CSAT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => {
              const overload = row.load >= 90
              return (
                <tr
                  key={row.user.id}
                  onClick={() => onFilterAgent?.(row.user.id)}
                  className="hover:bg-slate-50 cursor-pointer"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={row.user.name} color={row.user.avatarColor} size="sm" presence={row.user.status} />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{row.user.name}</p>
                        <p className="text-[11px] text-slate-400">{PRESENCE_LABEL[row.user.status]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center px-3 py-2.5 font-semibold tabular-nums text-slate-800">{row.active}</td>
                  <td className="px-3 py-2.5">
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          overload ? 'bg-red-500' : row.load >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, row.load)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {row.active}/{row.user.maxConcurrent} simultâneos
                    </p>
                  </td>
                  <td className="text-center px-3 py-2.5 tabular-nums text-slate-600">
                    {row.avgFirstResponse ? duration(row.avgFirstResponse) : '--'}
                  </td>
                  <td className="text-center px-3 py-2.5 tabular-nums text-slate-600">{row.resolved}</td>
                  <td className="text-center px-3 py-2.5">
                    {row.csat ? (
                      <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                        <Star size={12} className="fill-yellow-500 text-yellow-500" />
                        {row.csat.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-slate-300">--</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
