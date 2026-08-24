import React from 'react'
import { STATUS_META, PRIORITY_META, DEPT_COLORS } from '../../lib/constants'

export function StatusPill({ status, dot = true }) {
  const meta = STATUS_META[status] || STATUS_META.OPEN
  return (
    <span className={`chip ${meta.pill}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />}
      {meta.label}
    </span>
  )
}

export function PriorityPill({ priority }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.NORMAL
  return <span className={`chip ${meta.pill}`}>{meta.label}</span>
}

export function DepartmentPill({ department }) {
  if (!department) return <span className="chip bg-slate-100 text-slate-500">Sem setor</span>
  const cls = DEPT_COLORS[department.id] || 'bg-slate-100 text-slate-600 border-slate-200'
  return <span className={`chip border ${cls}`}>{department.name}</span>
}

export function Tag({ children }) {
  return <span className="chip bg-slate-100 text-slate-600 border border-slate-200">{children}</span>
}
