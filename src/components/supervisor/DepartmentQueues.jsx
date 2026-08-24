import React from 'react'
import { AlertTriangle, Timer } from 'lucide-react'
import { duration } from '../../lib/format'

/** Estado das filas por departamento, com alerta de SLA estourado. */
export default function DepartmentQueues({ data }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Filas por departamento</h3>
      <div className="space-y-2">
        {data.map(({ department, open, waiting, oldestWait, breached }) => (
          <div
            key={department.id}
            className={`rounded-lg border p-3 ${breached ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}
          >
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-800 flex-1">{department.name}</p>
              {breached && (
                <span className="chip bg-red-100 text-red-700"><AlertTriangle size={11} /> SLA estourado</span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1.5">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Na fila</p>
                <p className={`text-lg font-bold tabular-nums ${waiting > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {waiting}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Ativos</p>
                <p className="text-lg font-bold text-slate-700 tabular-nums">{open}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold flex items-center gap-1 justify-end">
                  <Timer size={10} /> Espera mais antiga
                </p>
                <p className={`text-sm font-semibold tabular-nums ${breached ? 'text-red-600' : 'text-slate-700'}`}>
                  {waiting ? duration(oldestWait) : '--'}
                </p>
                <p className="text-[10px] text-slate-400">meta {department.slaMinutes} min</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
