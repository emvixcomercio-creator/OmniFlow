import React from 'react'
import {
  Phone, Mail, MapPin, Building2, History, Tag as TagIcon, Star,
  Clock, MessageSquareText, Plus, X, StickyNote,
} from 'lucide-react'
import { useApp } from '../../store/AppContext'
import Avatar from '../common/Avatar'
import { StatusPill, DepartmentPill, Tag } from '../common/Pill'
import { ChannelLabel } from '../common/ChannelIcon'
import { relTime, clock, duration, dayLabel } from '../../lib/format'
import { PRIORITY_META } from '../../lib/constants'

function Row({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
        <p className="text-[13px] text-slate-700 break-words">{value}</p>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children, action }) {
  return (
    <section className="px-4 py-2.5 border-t border-slate-100">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={13} className="text-slate-400" />
        <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex-1">{title}</h4>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function ContactPanel({ ticket, onClose }) {
  const { dispatch, getContact, getChannel, getDepartment, getUser, contactHistory } = useApp()
  const contact = getContact(ticket.contactId)
  const channel = getChannel(ticket.channelId)
  const department = getDepartment(ticket.departmentId)
  const assignee = getUser(ticket.assigneeId)
  const history = contactHistory(ticket.contactId, ticket.id)

  const waited = ticket.assignedAt
    ? duration(new Date(ticket.assignedAt) - new Date(ticket.queuedAt || ticket.createdAt))
    : duration(Date.now() - new Date(ticket.queuedAt || ticket.createdAt))

  return (
    <aside data-tour="contact-panel" className="w-[286px] 2xl:w-[320px] shrink-0 bg-white border-l border-slate-200 h-full overflow-y-auto scroll-thin">
      <div className="px-4 py-3 flex flex-col items-center text-center relative">
        <button onClick={onClose} className="absolute right-2 top-2 btn-ghost h-8 w-8 p-0 xl:hidden">
          <X size={16} />
        </button>
        <Avatar name={contact?.name} color={contact?.avatarColor} size="xl" channel={channel?.type} />
        <h3 className="mt-2.5 font-semibold text-slate-800">{contact?.name}</h3>
        <p className="text-xs text-slate-500">{contact?.company}</p>
        <div className="flex flex-wrap justify-center gap-1 mt-2">
          {contact?.tags?.map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Contato desde {dayLabel(contact?.createdAt)}</p>
      </div>

      <Section title="Dados do contato" icon={Building2}>
        <Row icon={Phone} label="Telefone" value={contact?.phone} />
        <Row icon={Mail} label="E-mail" value={contact?.email} />
        <Row icon={MapPin} label="Cidade" value={contact?.city} />
        <Row icon={Building2} label="Empresa" value={contact?.company} />
      </Section>

      <Section title="Atendimento atual" icon={MessageSquareText}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Protocolo</span>
            <span className="text-xs font-semibold text-slate-700">{ticket.protocol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Canal</span>
            <ChannelLabel type={channel?.type} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Departamento</span>
            <DepartmentPill department={department} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Situação</span>
            <StatusPill status={ticket.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Responsável</span>
            <span className="text-xs font-medium text-slate-700">{assignee?.name || 'Fila'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={11} /> Espera na fila</span>
            <span className="text-xs font-medium text-slate-700">{waited}</span>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1.5">Prioridade</p>
          <div className="flex gap-1">
            {Object.entries(PRIORITY_META).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => dispatch({ type: 'SET_PRIORITY', ticketId: ticket.id, priority: key })}
                className={`flex-1 rounded-md py-1 text-[11px] font-medium border ${
                  ticket.priority === key
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title={`Notas internas (${ticket.notes.length})`} icon={StickyNote}>
        {ticket.notes.length === 0 ? (
          <p className="text-xs text-slate-400">Nenhuma nota registrada.</p>
        ) : (
          <div className="space-y-2">
            {ticket.notes.map((n) => (
              <div key={n.id} className="rounded-lg bg-amber-50 border border-amber-200 p-2">
                <p className="text-[11px] font-semibold text-amber-700">
                  {getUser(n.authorId)?.name} · {clock(n.createdAt)}
                </p>
                <p className="text-xs text-amber-900 mt-0.5">{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={`Histórico do contato (${history.length})`} icon={History}>
        {history.length === 0 ? (
          <p className="text-xs text-slate-400">Primeiro atendimento deste contato.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() => dispatch({ type: 'SELECT_TICKET', ticketId: h.id })}
                className="w-full text-left rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-slate-700 flex-1 truncate">{h.subject}</p>
                  <span className="text-[10px] text-slate-400">{relTime(h.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <StatusPill status={h.status} dot={false} />
                  <DepartmentPill department={getDepartment(h.departmentId)} />
                  {h.rating && (
                    <span className="chip bg-yellow-100 text-yellow-700">
                      <Star size={10} className="fill-yellow-500 text-yellow-500" /> {h.rating}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {getUser(h.assigneeId)?.name || 'Sem responsável'} · {h.messages.length} mensagens
                </p>
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section title="Etiquetas do ticket" icon={TagIcon}>
        <div className="flex flex-wrap gap-1">
          {ticket.tags.map((t) => <Tag key={t}>{t}</Tag>)}
          <button
            onClick={() => {
              const tag = window.prompt('Nova etiqueta:')
              if (tag) dispatch({ type: 'ADD_TAG', ticketId: ticket.id, tag })
            }}
            className="chip border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50"
          >
            <Plus size={11} /> Adicionar
          </button>
        </div>
      </Section>
    </aside>
  )
}
