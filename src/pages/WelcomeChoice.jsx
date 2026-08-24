import React from 'react'
import { PlayCircle, MousePointerClick, ArrowRight, Clock, MessageCircle, Instagram, Globe, Sparkles } from 'lucide-react'
import { useApp } from '../store/AppContext'

/** Primeira tela: escolhe entre ver o fluxo encenado ou usar o sistema livre. */
export default function WelcomeChoice() {
  const { dispatch } = useApp()
  const choose = (mode, userId) => dispatch({ type: 'SET_ENTRY_MODE', mode, userId })

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-2.5 mb-9">
          <div className="h-11 w-11 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg">OF</div>
          <div>
            <p className="font-semibold text-slate-800 tracking-tight leading-tight">OmniFlow</p>
            <p className="text-xs text-slate-500">Atendimento em um lugar só</p>
          </div>
        </div>

        <h1 className="text-[2rem] font-bold text-slate-800 tracking-tight leading-[1.15]">
          WhatsApp, Instagram e o chat do site<br />na mesma caixa de entrada.
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          {[
            { Icon: MessageCircle, cor: '#25D366', nome: 'WhatsApp' },
            { Icon: Instagram, cor: '#E1306C', nome: 'Instagram' },
            { Icon: Globe, cor: '#0EA5E9', nome: 'Chat do site' },
          ].map(({ Icon, cor, nome }) => (
            <span key={nome} className="inline-flex items-center gap-1.5 text-sm text-slate-600">
              <span className="h-6 w-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${cor}1f`, color: cor }}>
                <Icon size={13} />
              </span>
              {nome}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-9">
          <button
            onClick={() => choose('apresentacao', 'u-ana')}
            className="group card p-6 text-left hover:border-brand-400 hover:shadow-lg transition-all"
          >
            <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <PlayCircle size={24} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mt-4">Assistir ao fluxo</h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Uma conversa de verdade acontece na sua frente: o cliente escreve, o robô
              descobre o assunto, a equipe atende, transfere e encerra. Você avança
              parada por parada.
            </p>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <Clock size={12} /> Cerca de 4 minutos
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 mt-4 group-hover:gap-2.5 transition-all">
              Começar <ArrowRight size={15} />
            </span>
          </button>

          <button
            onClick={() => choose('sistema', 'u-ana')}
            className="group card p-6 text-left hover:border-slate-400 hover:shadow-lg transition-all"
          >
            <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <MousePointerClick size={24} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mt-4">Usar o sistema</h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Sem explicação e sem nada por cima da tela. Responda mensagens, transfira
              chamados, abra o painel do gestor — mexa como se fosse o dia a dia.
            </p>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <Clock size={12} /> Livre · nada muda sozinho
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 mt-4 group-hover:gap-2.5 transition-all">
              Entrar <ArrowRight size={15} />
            </span>
          </button>
        </div>

        <button
          onClick={() => choose('primeiro-dia', 'u-sup')}
          className="group card p-5 mt-4 w-full text-left hover:border-emerald-400 hover:shadow-lg transition-all flex items-start gap-4"
        >
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-800">Ver o primeiro dia</h2>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Começa com o sistema vazio, como ele chega para a sua empresa: nenhum canal
              ligado, nenhum setor, ninguém na equipe. A gente monta tudo junto e a primeira
              mensagem de cliente chega no final.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 mt-3 group-hover:gap-2.5 transition-all">
              Começar do zero <ArrowRight size={15} />
            </span>
          </div>
        </button>

        <p className="text-xs text-slate-400 mt-7">
          Não precisa de senha para conhecer.{' '}
          <button onClick={() => choose('login')} className="text-brand-600 hover:underline font-medium">
            Ver a tela de login da equipe
          </button>
        </p>
      </div>
    </div>
  )
}
