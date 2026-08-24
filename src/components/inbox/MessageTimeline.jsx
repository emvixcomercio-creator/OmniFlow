import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import { dayLabel } from '../../lib/format'
import { useApp } from '../../store/AppContext'

function DayDivider({ label }) {
  return (
    <div className="flex justify-center my-4">
      <span className="bg-white border border-slate-200 text-[11px] text-slate-500 px-3 py-1 rounded-full shadow-sm">
        {label}
      </span>
    </div>
  )
}

function TypingBubble({ name }) {
  return (
    <div className="flex justify-start my-2 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
        <span className="text-[11px] text-slate-400 mr-1">{name} está digitando</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-blink"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function MessageTimeline({ ticket, readOnly = false }) {
  const { timeline, getContact } = useApp()
  const items = timeline(ticket)
  const contact = getContact(ticket.contactId)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [items.length, ticket.typing, ticket.id])

  let lastDay = null

  return (
    <div data-tour={readOnly ? undefined : 'chat-timeline'} className={`flex-1 min-h-0 overflow-y-auto scroll-thin chat-bg px-3 py-2.5 ${readOnly ? 'select-text' : ''}`}>
      {items.map((item) => {
        const day = dayLabel(item.createdAt)
        const showDivider = day !== lastDay
        lastDay = day
        return (
          <React.Fragment key={item.id}>
            {showDivider && <DayDivider label={day} />}
            <MessageBubble item={item} ticket={ticket} />
          </React.Fragment>
        )
      })}
      {ticket.typing && <TypingBubble name={contact?.name?.split(' ')[0] || 'Contato'} />}
      <div ref={endRef} />
    </div>
  )
}
