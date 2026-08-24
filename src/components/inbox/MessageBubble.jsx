import React from 'react'
import { Check, CheckCheck, Clock, Bot, StickyNote, FileText, Download, Info } from 'lucide-react'
import { AUTHOR, MSG_KIND } from '../../lib/constants'
import { clock, bytes } from '../../lib/format'
import { useApp } from '../../store/AppContext'

/** Converte *negrito* do WhatsApp em <strong> e preserva quebras de linha. */
function RichText({ text }) {
  const parts = String(text).split(/(\*[^*\n]+\*)/g)
  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((p, i) =>
        p.startsWith('*') && p.endsWith('*') && p.length > 2
          ? <strong key={i}>{p.slice(1, -1)}</strong>
          : <React.Fragment key={i}>{p}</React.Fragment>,
      )}
    </span>
  )
}

function Ack({ status }) {
  if (status === 'SENT') return <Clock size={13} className="text-white/60" />
  if (status === 'DELIVERED') return <Check size={13} className="text-white/70" />
  return <CheckCheck size={13} className="text-sky-200" />
}

function Attachment({ attachment, kind, mine }) {
  if (!attachment) return null
  if (kind === MSG_KIND.IMAGE) {
    return (
      <div className={`mt-1 rounded-lg overflow-hidden border ${mine ? 'border-white/20' : 'border-slate-200'}`}>
        <div className="h-36 w-56 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
          <span className="text-[11px] text-slate-500 font-medium">{attachment.name}</span>
        </div>
      </div>
    )
  }
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className={`mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 border ${
        mine ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <FileText size={20} className={mine ? 'text-white/80' : 'text-slate-500'} />
      <div className="min-w-0">
        <p className="text-xs font-medium truncate max-w-[180px]">{attachment.name}</p>
        <p className={`text-[10px] ${mine ? 'text-white/60' : 'text-slate-400'}`}>{bytes(attachment.size)}</p>
      </div>
      <Download size={14} className={mine ? 'text-white/70' : 'text-slate-400'} />
    </a>
  )
}

export default function MessageBubble({ item, ticket }) {
  const { getUser, getContact } = useApp()

  /* Evento de sistema (transferência, atribuição, encerramento) */
  if (item.kind === MSG_KIND.EVENT) {
    return (
      <div className="flex justify-center my-3 animate-fade-in">
        <div className="max-w-[80%] flex items-start gap-1.5 rounded-lg bg-slate-200/70 px-3 py-1.5 text-[11px] text-slate-600">
          <Info size={12} className="mt-0.5 shrink-0" />
          <RichText text={item.body} />
          <span className="text-slate-400 ml-1 shrink-0">{clock(item.createdAt)}</span>
        </div>
      </div>
    )
  }

  /* Nota interna — nunca sai para o cliente */
  if (item.kind === MSG_KIND.NOTE) {
    const author = getUser(item.authorId)
    return (
      <div className="flex justify-end my-2 animate-fade-in">
        <div className="max-w-[78%] rounded-xl rounded-tr-sm border border-amber-300 bg-amber-50 px-3 py-2 shadow-sm">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 mb-1">
            <StickyNote size={12} />
            Nota interna · {author?.name || 'Sistema'}
            <span className="font-normal text-amber-500">(invisível ao cliente)</span>
          </div>
          <p className="text-sm text-amber-900 whitespace-pre-wrap break-words">{item.body}</p>
          <p className="text-[10px] text-amber-500 text-right mt-1">{clock(item.createdAt)}</p>
        </div>
      </div>
    )
  }

  const isBot = item.authorType === AUTHOR.BOT
  const mine = item.authorType === AUTHOR.AGENT || isBot
  const author = isBot ? { name: 'Assistente Virtual' } : getUser(item.authorId) || getContact(item.authorId)

  return (
    <div className={`flex my-1.5 animate-fade-in ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[78%] px-3 py-2 shadow-sm text-sm ${
          isBot
            ? 'bg-violet-600 text-white rounded-xl rounded-tr-sm'
            : mine
              ? 'bg-brand-600 text-white rounded-xl rounded-tr-sm'
              : 'bg-white text-slate-800 rounded-xl rounded-tl-sm border border-slate-200'
        }`}
      >
        {mine && (
          <p className={`text-[11px] font-semibold mb-0.5 flex items-center gap-1 ${isBot ? 'text-violet-200' : 'text-brand-100'}`}>
            {isBot && <Bot size={12} />}
            {author?.name}
          </p>
        )}
        <RichText text={item.body} />
        <Attachment attachment={item.attachment} kind={item.kind} mine={mine} />
        <div className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-slate-400'}`}>
          {clock(item.createdAt)}
          {item.authorType === AUTHOR.AGENT && <Ack status={item.status} />}
        </div>
      </div>
    </div>
  )
}
