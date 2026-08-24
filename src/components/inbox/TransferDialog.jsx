import React, { useState } from 'react'
import { X, ArrowRightLeft, Building2, User, Users } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { useEscape } from '../../lib/useEscape'
import Avatar from '../common/Avatar'
import { PRIORITY_META } from '../../lib/constants'

/** Transferência entre departamentos / atendentes, com motivo registrado na timeline. */
export default function TransferDialog({ ticket, onClose }) {
  const { state, dispatch, currentUser, getDepartment } = useApp()
  const [departmentId, setDepartmentId] = useState(ticket.departmentId || state.departments[0].id)
  const [agentId, setAgentId] = useState('')
  const [priority, setPriority] = useState(ticket.priority)
  const [reason, setReason] = useState('')
  useEscape(onClose)

  const available = state.users.filter(
    (u) => u.departmentIds.includes(departmentId) && u.id !== currentUser.id,
  )

  const confirm = () => {
    dispatch({
      type: 'TRANSFER',
      ticketId: ticket.id,
      departmentId,
      agentId: agentId || null,
      priority,
      reason: reason.trim(),
      byId: currentUser.id,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-fade-in" onClick={onClose}>
      <div className="card w-full max-w-lg shadow-2xl animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center gap-2 px-5 py-4 border-b border-slate-200">
          <ArrowRightLeft size={18} className="text-brand-600" />
          <h3 className="font-semibold text-slate-800 flex-1">Transferir atendimento</h3>
          <button onClick={onClose} className="btn-ghost h-8 w-8 p-0"><X size={16} /></button>
        </header>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto scroll-thin">
          <div>
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
              <Building2 size={13} /> Departamento de destino
            </label>
            <div className="grid grid-cols-2 gap-2">
              {state.departments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setDepartmentId(d.id); setAgentId('') }}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    departmentId === d.id
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-medium text-slate-800">{d.name}</p>
                  <p className="text-[11px] text-slate-500">
                    SLA {d.slaMinutes} min ·{' '}
                    {state.tickets.filter((t) => t.departmentId === d.id && t.status === 'WAITING').length} na fila
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
              <User size={13} /> Atendente (opcional)
            </label>
            <div className="space-y-1">
              <button
                onClick={() => setAgentId('')}
                className={`w-full flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left ${
                  !agentId ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <Users size={15} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Fila do departamento</p>
                  <p className="text-[11px] text-slate-500">Distribuição automática para o próximo livre</p>
                </div>
              </button>
              {available.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setAgentId(u.id)}
                  className={`w-full flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left ${
                    agentId === u.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Avatar name={u.name} color={u.avatarColor} size="sm" presence={u.status} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{u.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {state.tickets.filter((t) => t.assigneeId === u.id && t.status === 'OPEN').length} em atendimento
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Prioridade</label>
            <div className="flex gap-2">
              {Object.entries(PRIORITY_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setPriority(key)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium ${
                    priority === key ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Motivo da transferência</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex.: cliente solicitou 2ª via de boleto — assunto financeiro"
              className="input resize-none"
            />
          </div>
        </div>

        <footer className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button onClick={onClose} className="btn-outline">Cancelar</button>
          <button onClick={confirm} className="btn-primary">
            <ArrowRightLeft size={15} /> Transferir para {getDepartment(departmentId)?.name}
          </button>
        </footer>
      </div>
    </div>
  )
}
