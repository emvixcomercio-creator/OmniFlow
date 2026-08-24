import React, { useState } from 'react'
import { X, Eye, StickyNote, ArrowRightLeft, Send, ShieldAlert } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { useEscape } from '../../lib/useEscape'
import Avatar from '../common/Avatar'
import MessageTimeline from '../inbox/MessageTimeline'
import TransferDialog from '../inbox/TransferDialog'
import { StatusPill, DepartmentPill } from '../common/Pill'
import { CHANNEL_META } from '../../lib/constants'

/**
 * Modo espião do supervisor: acompanha a conversa em tempo real sem aparecer
 * para o cliente. O supervisor pode deixar nota interna ou intervir assumindo.
 */
export default function SpyDrawer({ ticketId, onClose }) {
  const { dispatch, currentUser, getTicket, getContact, getChannel, getDepartment, getUser } = useApp()
  const ticket = getTicket(ticketId)
  useEscape(onClose)
  const [note, setNote] = useState('')
  const [transferOpen, setTransferOpen] = useState(false)

  if (!ticket) return null
  const contact = getContact(ticket.contactId)
  const channel = getChannel(ticket.channelId)
  const assignee = getUser(ticket.assigneeId)

  const sendNote = () => {
    if (!note.trim()) return
    dispatch({ type: 'ADD_NOTE', ticketId, authorId: currentUser.id, body: note.trim() })
    setNote('')
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
          <Avatar name={contact?.name} color={contact?.avatarColor} channel={channel?.type} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 truncate">{contact?.name}</h3>
              <span className="chip bg-red-100 text-red-700"><Eye size={11} /> Modo espião</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-[11px] text-slate-500">
                {CHANNEL_META[channel?.type]?.label} · {ticket.protocol}
              </span>
              <StatusPill status={ticket.status} />
              <DepartmentPill department={getDepartment(ticket.departmentId)} />
              <span className="chip bg-slate-100 text-slate-600">{assignee?.name || 'Fila'}</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost h-9 w-9 p-0"><X size={18} /></button>
        </header>

        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
          <ShieldAlert size={14} className="text-amber-600 shrink-0" />
          <p className="text-[11px] text-amber-700">
            Você está apenas acompanhando. O cliente e o atendente não são notificados.
          </p>
        </div>

        <MessageTimeline ticket={ticket} readOnly />

        <div className="border-t border-slate-200 p-3 space-y-2 bg-white">
          <div className="flex items-center gap-2">
            <StickyNote size={15} className="text-amber-500 shrink-0" />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendNote()}
              placeholder="Orientar o atendente por nota interna…"
              className="input py-2 text-sm"
            />
            <button onClick={sendNote} disabled={!note.trim()} className="btn bg-amber-500 text-white hover:bg-amber-600 h-9 w-9 p-0">
              <Send size={15} />
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setTransferOpen(true)} className="btn-outline flex-1 py-2 text-xs">
              <ArrowRightLeft size={14} /> Redirecionar chamado
            </button>
            <button
              onClick={() => { dispatch({ type: 'ASSIGN', ticketId, agentId: currentUser.id }); onClose() }}
              className="btn-primary flex-1 py-2 text-xs"
            >
              Intervir e assumir
            </button>
          </div>
        </div>
      </div>

      {transferOpen && (
        <TransferDialog ticket={ticket} onClose={() => setTransferOpen(false)} />
      )}
    </div>
  )
}
