import React from 'react'
import { PlayCircle, MousePointerClick, ArrowRight, Clock } from 'lucide-react'
import { useApp } from '../store/AppContext'

/**
 * Porta de entrada: apresentação guiada ou sistema livre.
 * Tela calma, sem nada se mexendo — feita para começar uma gravação aqui.
 */
export default function WelcomeChoice() {
  const { dispatch, currentUser } = useApp()
  const choose = (mode) => dispatch({ type: 'SET_ENTRY_MODE', mode })

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="h-10 w-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">OF</div>
          <span className="font-semibold text-slate-800 tracking-tight">OmniFlow</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 tracking-tight leading-tight">
          Olá, {currentUser.name.split(' ')[0]}. Por onde você quer começar?
        </h1>
        <p className="text-slate-500 mt-2 max-w-xl">
          Você pode assistir a uma explicação passo a passo ou entrar direto e mexer
          no sistema à vontade. Dá para trocar depois, quando quiser.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <button
            onClick={() => choose('apresentacao')}
            className="group card p-6 text-left hover:border-brand-400 hover:shadow-lg transition-all"
          >
            <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <PlayCircle size={24} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mt-4">Ver a apresentação</h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Uma explicação guiada do caminho de um atendimento, do momento em que o
              cliente escreve até o chamado ser encerrado. Você avança no seu ritmo.
            </p>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <Clock size={12} /> Cerca de 4 minutos · 11 paradas
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 mt-4 group-hover:gap-2.5 transition-all">
              Começar <ArrowRight size={15} />
            </span>
          </button>

          <button
            onClick={() => choose('sistema')}
            className="group card p-6 text-left hover:border-slate-400 hover:shadow-lg transition-all"
          >
            <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <MousePointerClick size={24} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mt-4">Entrar no sistema</h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Sem explicação, sem nada por cima da tela. Você clica onde quiser,
              responde mensagens, transfere chamados e testa como se fosse o dia a dia.
            </p>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <Clock size={12} /> Livre · nada muda sozinho
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 mt-4 group-hover:gap-2.5 transition-all">
              Entrar <ArrowRight size={15} />
            </span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-6">
          Os dados são de exemplo e ficam parados. Dentro do sistema existe um botão
          para ligar o movimento em tempo real quando você quiser mostrar isso.
        </p>
      </div>
    </div>
  )
}
