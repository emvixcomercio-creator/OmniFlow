import React from 'react'
import { Compass, X } from 'lucide-react'

/**
 * Convite discreto para o tour. Fica num canto e NÃO bloqueia a tela —
 * quem quiser apenas usar o sistema clica em qualquer lugar normalmente.
 */
export default function TourInvite({ onStart, onDismiss }) {
  return (
    <div className="fixed bottom-4 left-[88px] z-40 w-[266px] card shadow-xl p-3.5 animate-slide-left">
      <div className="flex items-start gap-2">
        <Compass size={16} className="text-brand-600 mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">Primeira vez por aqui?</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Um tour de 11 passos mostra o caminho de um atendimento, do WhatsApp até o encerramento.
          </p>
        </div>
        <button onClick={onDismiss} title="Dispensar" className="btn-ghost h-6 w-6 p-0 shrink-0">
          <X size={13} />
        </button>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={onStart} className="btn-primary py-1.5 text-xs flex-1">
          Ver o tour
        </button>
        <button onClick={onDismiss} className="btn-ghost py-1.5 text-xs">
          Agora não
        </button>
      </div>
    </div>
  )
}
