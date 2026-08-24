import React, { useEffect, useRef, useState } from 'react'
import { Loader2, Check, ShieldCheck, QrCode, ExternalLink, TriangleAlert } from 'lucide-react'

/** Etapas que o cliente vê enquanto a conexão acontece. */
const FLOWS = {
  WHATSAPP_CLOUD: {
    cta: 'Conectar com o Facebook',
    note: 'Abre a janela oficial da Meta. O cliente entra com a conta dele, escolhe a conta comercial, informa o número e digita o código de verificação — tudo sem sair daqui.',
    stages: [
      'Abrindo a janela da Meta…',
      'Cliente autorizou a conta comercial',
      'Trocando o código por um token permanente',
      'Registrando o número e assinando o webhook',
    ],
    done: 'WhatsApp conectado. As mensagens já chegam na aba Pendentes.',
  },
  INSTAGRAM_GRAPH: {
    cta: 'Conectar Instagram',
    note: 'Login do Facebook com permissão de mensagens. Depois é só escolher qual perfil comercial vai atender por aqui.',
    stages: [
      'Abrindo o login do Facebook…',
      'Cliente autorizou o acesso às mensagens',
      'Listando os perfis vinculados às Páginas',
      'Assinando o webhook na Página escolhida',
    ],
    done: 'Instagram conectado. Direct e respostas a stories entram no painel.',
  },
  EVOLUTION: {
    cta: 'Gerar QR Code',
    note: 'Cria a instância no servidor e mostra o QR aqui na tela. O cliente lê com o celular da empresa, como no WhatsApp Web.',
    stages: [
      'Criando a instância no servidor…',
      'QR Code gerado — aguardando a leitura',
      'Aparelho pareado',
      'Webhook apontado para este painel',
    ],
    done: 'Número pareado. Mantenha o celular com internet.',
  },
}

function FakeQr() {
  // padrão determinístico só para ilustrar o QR na demonstração
  const cells = []
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const on = (x * 7 + y * 13 + ((x * y) % 5)) % 3 === 0
      const corner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
      if (corner ? (x % 6 === 0 || y % 6 === 0 || (x > 1 && x < 5 && y > 1 && y < 5)) : on) {
        cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)
      }
    }
  }
  return (
    <svg viewBox="0 0 21 21" role="img" aria-label="QR Code de exemplo" className="h-36 w-36 shrink-0 rounded-lg bg-white p-1.5 border border-slate-200">
      <g fill="currentColor" className="text-slate-800">{cells}</g>
    </svg>
  )
}

export default function ConnectPanel({ provider }) {
  const [status, setStatus] = useState(null)   // resposta de /api/connect/status
  const [stage, setStage] = useState(-1)       // -1 parado, n = etapa atual
  const [error, setError] = useState(null)
  const timers = useRef([])

  const flow = FLOWS[provider]

  useEffect(() => {
    let alive = true
    fetch('/api/connect/status')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => alive && setStatus(d))
      .catch(() => alive && setStatus({ offline: true }))
    return () => { alive = false }
  }, [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => { setStage(-1); setError(null) }, [provider])

  if (!flow) return null

  const live = status && !status.offline && status.metaConfigured
  const running = stage >= 0 && stage < flow.stages.length
  const finished = stage >= flow.stages.length

  const start = () => {
    setError(null)
    if (live) {
      // caminho real: Embedded Signup / OAuth abrem a janela da Meta
      setError('Servidor conectado, mas este ambiente de demonstração não dispara a janela da Meta.')
      return
    }
    // demonstração: percorre as etapas para mostrar como o cliente enxerga
    setStage(0)
    timers.current = flow.stages.map((_, i) =>
      setTimeout(() => setStage(i + 1), (i + 1) * 900),
    )
  }

  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-3.5">
      <div className="flex items-start gap-2.5">
        <ShieldCheck size={16} className="text-brand-600 mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-slate-800">Conectar pelo painel</h4>
            {live ? (
              <span className="chip bg-emerald-100 text-emerald-700">servidor pronto</span>
            ) : (
              <span className="chip bg-amber-100 text-amber-700">modo demonstração</span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-1">{flow.note}</p>
        </div>
      </div>

      {provider === 'EVOLUTION' && stage >= 1 && !finished && (
        <div className="flex items-center gap-3 mt-3 rounded-lg bg-white border border-slate-200 p-3">
          <FakeQr />
          <div className="text-xs text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">Leia com o celular da empresa</p>
            <p>WhatsApp → Aparelhos conectados → Conectar aparelho.</p>
            <p className="text-slate-400 mt-1.5">O código expira em 60 segundos e é renovado sozinho.</p>
          </div>
        </div>
      )}

      {stage >= 0 && (
        <ol className="mt-3 space-y-1.5">
          {flow.stages.map((s, i) => {
            const doneStep = stage > i
            const current = stage === i
            return (
              <li key={s} className={`flex items-center gap-2 text-xs ${doneStep ? 'text-slate-500' : current ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                {doneStep ? <Check size={13} className="text-emerald-600 shrink-0" />
                  : current ? <Loader2 size={13} className="animate-spin text-brand-600 shrink-0" />
                  : <span className="h-[13px] w-[13px] rounded-full border border-slate-300 shrink-0" />}
                {s}
              </li>
            )
          })}
        </ol>
      )}

      {finished && (
        <p className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <Check size={14} /> {flow.done}
        </p>
      )}

      {error && (
        <p className="mt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <TriangleAlert size={14} className="mt-px shrink-0" /> {error}
        </p>
      )}

      <div className="flex items-center gap-2 mt-3">
        <button onClick={start} disabled={running} className="btn-primary py-2 text-xs">
          {provider === 'EVOLUTION' ? <QrCode size={14} /> : <ExternalLink size={14} />}
          {running ? 'Conectando…' : finished ? 'Conectar outro número' : flow.cta}
        </button>
        {!live && (
          <p className="text-[11px] text-slate-500">
            Sequência ilustrativa — nenhuma conta é conectada de verdade nesta demonstração.
          </p>
        )}
      </div>
    </div>
  )
}
