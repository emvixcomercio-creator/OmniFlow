import React, { useRef, useState } from 'react'
import { Send, Paperclip, Smile, StickyNote, MessageSquare, Zap, X, Mic } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { MSG_KIND } from '../../lib/constants'
import { QUICK_REPLIES } from '../../lib/replies'
import { bytes } from '../../lib/format'

const EMOJIS = ['😀', '😉', '🙂', '👍', '🙏', '🎉', '✅', '⏳', '📎', '📄', '💰', '⚠️']

export default function Composer({ ticket }) {
  const { dispatch, currentUser, getDepartment } = useApp()
  const [mode, setMode] = useState('reply') // reply | note
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [showQuick, setShowQuick] = useState(false)
  const fileRef = useRef(null)
  const taRef = useRef(null)

  const isNote = mode === 'note'

  const send = () => {
    const body = text.trim()
    if (!body && !file) return

    if (isNote) {
      dispatch({ type: 'ADD_NOTE', ticketId: ticket.id, authorId: currentUser.id, body })
    } else if (file) {
      const kind = file.type.startsWith('image/') ? MSG_KIND.IMAGE : MSG_KIND.FILE
      dispatch({
        type: 'SEND_MESSAGE',
        ticketId: ticket.id,
        authorId: currentUser.id,
        kind,
        body: body || file.name,
        attachment: { name: file.name, size: file.size, mime: file.type },
      })
      simulateAck(ticket.id)
    } else {
      dispatch({ type: 'SEND_MESSAGE', ticketId: ticket.id, authorId: currentUser.id, body })
      simulateAck(ticket.id)
    }

    setText(''); setFile(null); setShowEmoji(false); setShowQuick(false)
    taRef.current?.focus()
  }

  /** Progressão de recibo: enviado → entregue → lido (o gateway faria isso). */
  const simulateAck = (ticketId) => {
    setTimeout(() => dispatch({ type: 'ACK_LAST', ticketId, status: 'DELIVERED' }), 700)
    setTimeout(() => dispatch({ type: 'ACK_LAST', ticketId, status: 'READ' }), 2400)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const applyMacro = (macro) => {
    const dept = getDepartment(ticket.departmentId)
    setText(
      macro.text
        .replace('{{atendente}}', currentUser.name.split(' ')[0])
        .replace('{{setor}}', dept?.name || 'Atendimento'),
    )
    setShowQuick(false)
    taRef.current?.focus()
  }

  return (
    <div data-tour="composer" className={`border-t transition-colors ${isNote ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
      {/* Alternância resposta / nota */}
      <div data-tour="composer-note" className="flex items-center gap-1 px-3 pt-1.5">
        <button
          onClick={() => setMode('reply')}
          className={`chip px-2.5 py-1 ${!isNote ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <MessageSquare size={12} /> Responder
        </button>
        <button
          onClick={() => setMode('note')}
          className={`chip px-2.5 py-1 ${isNote ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <StickyNote size={12} /> Nota interna
        </button>
        {isNote && (
          <span className="text-[11px] text-amber-700 ml-1">Somente a equipe enxerga esta mensagem</span>
        )}
      </div>

      {file && (
        <div className="mx-3 mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Paperclip size={14} className="text-slate-500" />
          <span className="text-xs text-slate-700 flex-1 truncate">{file.name}</span>
          <span className="text-[10px] text-slate-400">{bytes(file.size)}</span>
          <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
        </div>
      )}

      {showQuick && (
        <div className="mx-3 mt-2 card p-1 max-h-44 overflow-y-auto scroll-thin animate-pop-in">
          {QUICK_REPLIES.map((q) => (
            <button key={q.id} onClick={() => applyMacro(q)} className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100">
              <p className="text-xs font-semibold text-slate-700">{q.title}</p>
              <p className="text-[11px] text-slate-500 truncate">{q.text}</p>
            </button>
          ))}
        </div>
      )}

      {showEmoji && (
        <div className="mx-3 mt-2 card p-2 flex flex-wrap gap-1 animate-pop-in">
          {EMOJIS.map((e) => (
            <button key={e} onClick={() => setText((t) => t + e)} className="h-8 w-8 rounded-lg hover:bg-slate-100 text-lg">
              {e}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-1.5 px-3 py-2">
        <div className="flex gap-0.5">
          <button onClick={() => fileRef.current?.click()} title="Anexar arquivo" className="btn-ghost h-9 w-9 p-0">
            <Paperclip size={18} />
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); e.target.value = '' }}
          />
          <button onClick={() => { setShowEmoji((v) => !v); setShowQuick(false) }} title="Emojis" className="btn-ghost h-9 w-9 p-0">
            <Smile size={18} />
          </button>
          <button onClick={() => { setShowQuick((v) => !v); setShowEmoji(false) }} title="Respostas rápidas" className="btn-ghost h-9 w-9 p-0">
            <Zap size={18} />
          </button>
        </div>

        <textarea
          ref={taRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isNote ? 'Escreva uma nota interna para a equipe…' : 'Digite sua mensagem…'}
          className={`input resize-none max-h-28 py-2 ${isNote ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-100 bg-white' : ''}`}
          style={{ height: 'auto' }}
          onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px` }}
        />

        <button className="btn-ghost h-9 w-9 p-0" title="Áudio"><Mic size={18} /></button>
        <button
          onClick={send}
          disabled={!text.trim() && !file}
          className={`btn h-10 w-10 p-0 text-white ${isNote ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-600 hover:bg-brand-700'}`}
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  )
}
