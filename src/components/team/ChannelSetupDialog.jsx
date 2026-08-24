import React, { useMemo, useState } from 'react'
import { X, Copy, Check, Globe, ListChecks, Plug } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { useEscape } from '../../lib/useEscape'
import ChannelIcon from '../common/ChannelIcon'
import { SETUP_GUIDES } from './channelSetup'
import ConnectPanel from './ConnectPanel'
import { CHANNEL_META } from '../../lib/constants'

function CodeBlock({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* clipboard bloqueado no navegador */ }
  }
  return (
    <div className="relative mt-2 group">
      <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 pr-11 text-[11.5px] leading-relaxed overflow-x-auto scroll-thin font-mono whitespace-pre">
{text}
      </pre>
      <button
        onClick={copy}
        title="Copiar"
        className="absolute top-2 right-2 h-7 w-7 rounded-md flex items-center justify-center bg-slate-700/70 text-slate-200 hover:bg-slate-600"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  )
}

export default function ChannelSetupDialog({ initialProvider = 'WHATSAPP_CLOUD', onClose }) {
  const { state } = useApp()
  useEscape(onClose)

  const [provider, setProvider] = useState(initialProvider)
  const [domain, setDomain] = useState('https://atendimento.suaempresa.com.br')

  const guide = SETUP_GUIDES[provider]
  const base = domain.replace(/\/+$/, '') || 'https://seu-dominio'

  const steps = useMemo(
    () => guide.steps.map((s) => ({ ...s, code: s.code?.replaceAll('{{URL}}', base) })),
    [guide, base],
  )

  const providerChannel = state.channels.find((c) => c.provider === provider)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-fade-in" onClick={onClose}>
      <div
        className="card w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-200">
          <Plug size={18} className="text-brand-600" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800">Conectar um canal</h3>
            <p className="text-xs text-slate-500">O que a empresa precisa fazer do lado dela para as mensagens começarem a chegar.</p>
          </div>
          <button onClick={onClose} className="btn-ghost h-8 w-8 p-0"><X size={16} /></button>
        </header>

        {/* seletor de canal */}
        <div className="px-5 pt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(SETUP_GUIDES).map(([key, g]) => {
            const type = key === 'INSTAGRAM_GRAPH' ? 'INSTAGRAM' : key === 'WEBCHAT' ? 'WEBCHAT' : 'WHATSAPP'
            const active = provider === key
            return (
              <button
                key={key}
                onClick={() => setProvider(key)}
                className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  active ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ChannelIcon type={type} size="sm" />
                <p className="text-xs font-medium text-slate-800 mt-1.5 leading-tight">{g.label}</p>
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin px-5 py-4 space-y-4">
          <p className="text-sm text-slate-600">{guide.summary}</p>

          {provider !== 'WEBCHAT' && <ConnectPanel provider={provider} />}

          {/* domínio do cliente */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
              <Globe size={13} /> Endereço onde o OmniFlow está instalado
            </label>
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="https://atendimento.suaempresa.com.br"
              className="input py-2 text-sm font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              As URLs abaixo se ajustam ao que você digitar aqui. Precisa ser HTTPS com certificado válido — a Meta recusa endereços sem isso.
            </p>
          </div>

          {/* pré-requisitos */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5 mb-2">
              <ListChecks size={13} /> Antes de começar
            </h4>
            <ul className="space-y-1">
              {guide.needs.map((n) => (
                <li key={n} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  {n}
                </li>
              ))}
            </ul>
          </div>

          {/* passos */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">
              {provider === 'WEBCHAT' ? 'Passo a passo' : 'Ou configure manualmente'}
            </h4>
            {provider !== 'WEBCHAT' && (
              <p className="text-xs text-slate-500 mb-2.5">
                Caminho alternativo para quem já tem app próprio na Meta ou prefere colar as credenciais.
              </p>
            )}
            <ol className="space-y-3">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="h-6 w-6 shrink-0 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 pb-1">
                    <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{s.text}</p>
                    {s.code && <CodeBlock text={s.code} />}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {providerChannel && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-start gap-2.5">
              <Check size={15} className="text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-800">
                Nesta demonstração este canal já aparece como conectado:{' '}
                <strong>{providerChannel.name}</strong> ({CHANNEL_META[providerChannel.type].label} ·{' '}
                {providerChannel.identifier}). Em produção, o cartão só fica verde depois que o primeiro
                evento de teste do provedor chega no webhook.
              </p>
            </div>
          )}
        </div>

        <footer className="px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl flex items-center gap-3">
          <p className="text-[11px] text-slate-500 flex-1">
            Cada empresa tem seu próprio endereço, seu banco e seus canais — nada é compartilhado entre clientes.
          </p>
          <button onClick={onClose} className="btn-primary py-2 text-xs">Entendi</button>
        </footer>
      </div>
    </div>
  )
}
