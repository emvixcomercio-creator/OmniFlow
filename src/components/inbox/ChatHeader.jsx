import React from 'react'
import {
  ArrowLeft, ArrowRightLeft, CheckCircle2, RotateCcw, PanelRightClose,
  PanelRightOpen, UserPlus, Undo2, Phone, MoreVertical,
} from 'lucide-react'
import { useApp } from '../../store/AppContext'
import Avatar from '../common/Avatar'
import { StatusPill, DepartmentPill, PriorityPill } from '../common/Pill'
import { CHANNEL_META, TICKET_STATUS } from '../../lib/constants'
import { relTime } from '../../lib/format'

export default function ChatHeader({ ticket, onBack, onTogglePanel, panelOpen, onTransfer }) {
  const { dispatch, currentUser, getContact, getChannel, getDepartment } = useApp()
  const contact = getContact(ticket.contactId)
  const channel = getChannel(ticket.channelId)
  const department = getDepartment(ticket.departmentId)

  const isMine = ticket.assigneeId === currentUser.id
  const isResolved = ticket.status === TICKET_STATUS.RESOLVED
  const elapsed = relTime(ticket.createdAt)

  return (
    <header className="bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-2.5 shrink-0">
      <button onClick={onBack} className="btn-ghost h-9 w-9 p-0 md:hidden"><ArrowLeft size={18} /></button>

      <Avatar name={contact?.name} color={contact?.avatarColor} channel={channel?.type} />

      <div className="min-w-0 flex-1 basis-[180px]">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-800 truncate">{contact?.name}</h2>
          <span className="text-[11px] text-slate-400 shrink-0">{ticket.protocol}</span>
        </div>
        <p className="text-[11px] text-slate-500 truncate">
          {CHANNEL_META[channel?.type]?.label} · {channel?.identifier}
          <span className="text-slate-300 mx-1">•</span>
          aberto há {elapsed}
        </p>
      </div>

      <div className="hidden 2xl:flex items-center gap-1.5 shrink-0">
        <StatusPill status={ticket.status} />
        <DepartmentPill department={department} />
        <PriorityPill priority={ticket.priority} />
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!isResolved && !isMine && (
          <button
            onClick={() => dispatch({ type: 'ASSIGN', ticketId: ticket.id, agentId: currentUser.id })}
            className="btn-primary py-1.5 text-xs"
          >
            <UserPlus size={14} /> Assumir
          </button>
        )}
        {!isResolved && isMine && (
          <button
            onClick={() => dispatch({ type: 'RETURN_TO_QUEUE', ticketId: ticket.id })}
            title="Devolver para a fila"
            className="btn-outline py-1.5 text-xs hidden sm:inline-flex"
          >
            <Undo2 size={14} /> Devolver
          </button>
        )}
        {!isResolved && (
          <button data-tour="btn-transfer" onClick={onTransfer} className="btn-outline py-1.5 text-xs">
            <ArrowRightLeft size={14} /> <span className="hidden sm:inline">Transferir</span>
          </button>
        )}
        {isResolved ? (
          <button
            onClick={() => dispatch({ type: 'REOPEN', ticketId: ticket.id })}
            className="btn-outline py-1.5 text-xs"
          >
            <RotateCcw size={14} /> Reabrir
          </button>
        ) : (
          <button
            onClick={() => dispatch({ type: 'RESOLVE', ticketId: ticket.id, byId: currentUser.id })}
            className="btn py-1.5 px-3 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <CheckCircle2 size={14} /> <span className="hidden sm:inline">Finalizar</span>
          </button>
        )}
        <button onClick={onTogglePanel} className="btn-ghost h-9 w-9 p-0 hidden xl:flex">
          {panelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
        </button>
      </div>
    </header>
  )
}
