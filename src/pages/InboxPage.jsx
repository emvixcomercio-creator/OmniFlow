import React, { useState } from 'react'
import { MessagesSquare, Bot, UserPlus, CheckCircle2, Star, Headphones } from 'lucide-react'
import { useApp } from '../store/AppContext'
import ConversationList from '../components/inbox/ConversationList'
import ChatHeader from '../components/inbox/ChatHeader'
import MessageTimeline from '../components/inbox/MessageTimeline'
import Composer from '../components/inbox/Composer'
import ContactPanel from '../components/inbox/ContactPanel'
import TransferDialog from '../components/inbox/TransferDialog'
import EmptyState from '../components/common/EmptyState'
import { TICKET_STATUS } from '../lib/constants'

/** Rodapé alternativo quando o atendente ainda não pode digitar. */
function ComposerLock({ ticket }) {
  const { dispatch, currentUser, getUser } = useApp()
  const owner = ticket.assigneeId && ticket.assigneeId !== currentUser.id
    ? getUser(ticket.assigneeId)
    : null

  if (ticket.status === TICKET_STATUS.BOT) {
    return (
      <div className="border-t border-violet-200 bg-violet-50 px-4 py-4 flex items-center gap-3">
        <Bot size={20} className="text-violet-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-violet-800">Contato no menu de triagem automática</p>
          <p className="text-xs text-violet-600">
            O bot está coletando a opção do cliente. Assuma manualmente se quiser interromper o fluxo.
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'ASSIGN', ticketId: ticket.id, agentId: currentUser.id })}
          className="btn-primary py-2 text-xs shrink-0"
        >
          <UserPlus size={14} /> Assumir agora
        </button>
      </div>
    )
  }

  if (ticket.status === TICKET_STATUS.RESOLVED) {
    return (
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 flex items-center gap-3">
        <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-700">Atendimento finalizado</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            Protocolo {ticket.protocol}
            {ticket.rating && (
              <>
                · Avaliação
                <Star size={11} className="fill-yellow-500 text-yellow-500" />
                {ticket.rating}/5
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'REOPEN', ticketId: ticket.id })}
          className="btn-outline py-2 text-xs shrink-0"
        >
          Reabrir conversa
        </button>
      </div>
    )
  }

  // já está com outra pessoa da equipe
  if (owner) {
    return (
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 flex items-center gap-3">
        <Headphones size={20} className="text-slate-500 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-700">
            Esta conversa está com {owner.name}
          </p>
          <p className="text-xs text-slate-500">
            Você pode acompanhar sem interferir. Para responder ao cliente, é preciso assumir.
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'ASSIGN', ticketId: ticket.id, agentId: currentUser.id })}
          className="btn-outline py-2 text-xs shrink-0"
        >
          <UserPlus size={14} /> Assumir para mim
        </button>
      </div>
    )
  }

  // esperando na fila, sem ninguém responsável
  return (
    <div className="border-t border-amber-200 bg-amber-50 px-4 py-4 flex items-center gap-3">
      <MessagesSquare size={20} className="text-amber-600 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-800">Ninguém atendendo ainda</p>
        <p className="text-xs text-amber-600">O cliente está esperando na fila do setor.</p>
      </div>
      <button
        onClick={() => dispatch({ type: 'ASSIGN', ticketId: ticket.id, agentId: currentUser.id })}
        className="btn-primary py-2 text-xs shrink-0"
      >
        <UserPlus size={14} /> Atender agora
      </button>
    </div>
  )
}

export default function InboxPage() {
  const { state, currentUser, getTicket } = useApp()
  const [panelOpen, setPanelOpen] = useState(true)
  const [transferOpen, setTransferOpen] = useState(false)
  const [mobileChat, setMobileChat] = useState(false)

  const ticket = getTicket(state.selectedTicketId)
  const canType =
    ticket &&
    ticket.status === TICKET_STATUS.OPEN &&
    ticket.assigneeId === currentUser.id

  return (
    <div className="flex-1 min-h-0 flex">
      <div className={`${mobileChat ? 'hidden md:flex' : 'flex'} h-full shrink-0`}>
        <ConversationList onPick={() => setMobileChat(true)} />
      </div>

      <section className={`${mobileChat ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 min-h-0 flex-col h-full`}>
        {!ticket ? (
          <EmptyState
            icon={MessagesSquare}
            title="Selecione uma conversa"
            description="Escolha um atendimento na lista ao lado para começar a responder."
          />
        ) : (
          <>
            <ChatHeader
              ticket={ticket}
              panelOpen={panelOpen}
              onBack={() => setMobileChat(false)}
              onTogglePanel={() => setPanelOpen((v) => !v)}
              onTransfer={() => setTransferOpen(true)}
            />
            <MessageTimeline ticket={ticket} />
            {canType ? <Composer ticket={ticket} /> : <ComposerLock ticket={ticket} />}
          </>
        )}
      </section>

      {ticket && panelOpen && (
        <div className="hidden xl:block h-full">
          <ContactPanel ticket={ticket} onClose={() => setPanelOpen(false)} />
        </div>
      )}

      {transferOpen && ticket && (
        <TransferDialog ticket={ticket} onClose={() => setTransferOpen(false)} />
      )}
    </div>
  )
}
