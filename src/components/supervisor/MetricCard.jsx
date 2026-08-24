import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function MetricCard({ icon: Icon, label, value, hint, tone = 'brand', trend }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    violet: 'bg-violet-50 text-violet-600',
    slate: 'bg-slate-100 text-slate-600',
  }
  return (
    <div className="card p-3.5">
      <div className="flex items-start gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-800 leading-tight mt-0.5 tabular-nums">{value}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {trend != null && (
              <span className={`chip px-1.5 ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(trend)}%
              </span>
            )}
            {hint && <p className="text-[11px] text-slate-400 truncate">{hint}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
