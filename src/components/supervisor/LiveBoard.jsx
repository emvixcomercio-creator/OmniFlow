import React from 'react'
import { Eye, Radio, AlertTriangle } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import Avatar from '../common/Avatar'
import { StatusPill, DepartmentPill, PriorityPill } from '../common/Pill'
import { relTime, duration } from '../../lib/format'
import { TICKET_STATUS } from '../../lib/constants'
import EmptyState from '../common/EmptyState'

/** Monitor em tempo real: toda conversa em andamento, com acesso ao modo espião. */
export default function LiveBoard({ tickets, onSpy }) {
  const { getContact, getChannel, getDepartment, getUser, lastMessage } = useApp()

  const live = tickets
    .filter((t) => t.status !== TICKET_STATUS.RESOLVED)
    .sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt))

  return (
    <div data-tour="live-board" className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Radio size={15} className="text-red-500 animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-700 flex-1">Conversas em andamento</h3>
        <span className="chip bg-slate-100 text-slate-600">{live.length} ao vivo</span>
      </div>

      {live.length === 0 ? (
        <EmptyState icon={Radio} title="Nenhuma conversa ativa" description="Ajuste os filtros ou aguarde novos contatos." />
      ) : (
        <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto scroll-thin">
          {live.map((t) => {
            const contact = getContact(t.contactId)
            const channel = getChannel(t.channelId)
            const assignee = getUser(t.assigneeId)
            const last = lastMessage(t)
            const waiting = t.status === TICKET_STATUS.WAITING
            const waitMs = Date.now() - new Date(t.queuedAt || t.createdAt)
            const dep = getDepartment(t.departmentId)
            const breached = waiting && dep && waitMs > dep.slaMinutes * 60_000

            return (
              <div key={t.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 group">
                <Avatar name={contact?.name} color={contact?.avatarColor} channel={channel?.type} size="sm" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800 truncate">{contact?.name}</p>
                    <span className="text-[10px] text-slate-300">{t.protocol}</span>
                    {breached && <span className="chip bg-red-100 text-red-700"><AlertTriangle size={10} /> {duration(waitMs)}</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {t.typing ? <span className="text-emerald-600 font-medium">digitando…</span> : last?.body?.replace(/\*/g, '').split('\n')[0]}
                  </p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <StatusPill status={t.status} />
                    <DepartmentPill department={dep} />
                    <PriorityPill priority={t.priority} />
                    <span className="chip bg-slate-100 text-slate-600">
                      {assignee ? assignee.name : 'Sem responsável'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-[11px] text-slate-400">{relTime(t.lastActivityAt)}</p>
                  <p className="text-[10px] text-slate-400">{t.messages.length} msgs</p>
                </div>

                <button
                  onClick={() => onSpy(t.id)}
                  title="Acompanhar conversa (modo espião)"
                  className="btn-outline py-1.5 px-2.5 text-xs shrink-0 opacity-70 group-hover:opacity-100"
                >
                  <Eye size={14} /> <span className="hidden md:inline">Espiar</span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
