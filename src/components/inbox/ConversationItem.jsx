import React from 'react'
import { CheckCheck, Check, Bot, Paperclip, Image as ImageIcon, AlertTriangle } from 'lucide-react'
import Avatar from '../common/Avatar'
import { DepartmentPill } from '../common/Pill'
import { relTime } from '../../lib/format'
import { AUTHOR, MSG_KIND, TICKET_STATUS } from '../../lib/constants'
import { useApp } from '../../store/AppContext'

export default function ConversationItem({ ticket, active, onClick }) {
  const { getContact, getChannel, getDepartment, getUser, lastMessage } = useApp()
  const contact = getContact(ticket.contactId)
  const channel = getChannel(ticket.channelId)
  const department = getDepartment(ticket.departmentId)
  const assignee = getUser(ticket.assigneeId)
  const last = lastMessage(ticket)

  const slaBreach =
    ticket.status === TICKET_STATUS.WAITING &&
    Date.now() - new Date(ticket.queuedAt || ticket.createdAt) > 5 * 60_000

  const preview = () => {
    if (ticket.typing) return <span className="text-emerald-600 font-medium">digitando…</span>
    if (!last) return 'Sem mensagens'
    if (last.kind === MSG_KIND.IMAGE) return <span className="inline-flex items-center gap-1"><ImageIcon size={12} /> Imagem</span>
    if (last.kind === MSG_KIND.FILE) return <span className="inline-flex items-center gap-1"><Paperclip size={12} /> {last.attachment?.name}</span>
    return last.body.replace(/\*/g, '').split('\n')[0]
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 flex gap-2.5 border-l-[3px] transition-colors ${
        active
          ? 'bg-brand-50 border-brand-600'
          : 'border-transparent hover:bg-slate-50'
      }`}
    >
      <Avatar name={contact?.name} color={contact?.avatarColor} channel={channel?.type} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-slate-800 truncate flex-1">{contact?.name}</p>
          <span className="text-[11px] text-slate-400 shrink-0">{relTime(ticket.lastActivityAt)}</span>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-slate-500 truncate flex-1 flex items-center gap-1">
            {last?.authorType === AUTHOR.AGENT && (
              last.status === 'READ'
                ? <CheckCheck size={13} className="text-brand-500 shrink-0" />
                : <Check size={13} className="text-slate-400 shrink-0" />
            )}
            {last?.authorType === AUTHOR.BOT && <Bot size={13} className="text-violet-500 shrink-0" />}
            {preview()}
          </p>
          {ticket.unread > 0 && (
            <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
              {ticket.unread}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          {ticket.status === TICKET_STATUS.BOT ? (
            <span className="chip bg-violet-100 text-violet-700"><Bot size={11} /> Triagem</span>
          ) : (
            <DepartmentPill department={department} />
          )}
          {assignee && (
            <span className="chip bg-slate-100 text-slate-600">{assignee.name.split(' ')[0]}</span>
          )}
          {slaBreach && (
            <span className="chip bg-red-100 text-red-700"><AlertTriangle size={11} /> SLA</span>
          )}
          <span className="text-[10px] text-slate-300 ml-auto">{ticket.protocol}</span>
        </div>
      </div>
    </button>
  )
}
