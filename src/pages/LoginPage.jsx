import React, { useState } from 'react'
import {
  Mail, Lock, Eye, EyeOff, LogIn, MessageCircle, Instagram, Globe,
  ShieldCheck, TriangleAlert, ArrowRight,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import Avatar from '../components/common/Avatar'

const DEMO_PASSWORD = '123456'

const HIGHLIGHTS = [
  { icon: MessageCircle, color: '#25D366', text: 'WhatsApp oficial e via QR Code' },
  { icon: Instagram, color: '#E1306C', text: 'Direct e respostas a stories' },
  { icon: Globe, color: '#0EA5E9', text: 'Chat no site da empresa' },
]

export default function LoginPage() {
  const { state, dispatch } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = (e) => {
    e?.preventDefault()
    setError(null)

    const user = state.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    )
    if (!user) return setError('Não encontramos esse e-mail. Confira o endereço e tente de novo.')
    if (password !== DEMO_PASSWORD) return setError('Senha incorreta. Na demonstração, a senha é 123456.')

    setBusy(true)
    setTimeout(() => dispatch({ type: 'LOGIN', userId: user.id }), 450)
  }

  const enterAs = (user) => {
    setEmail(user.email)
    setPassword(DEMO_PASSWORD)
    setError(null)
    setBusy(true)
    setTimeout(() => dispatch({ type: 'LOGIN', userId: user.id }), 350)
  }

  const shortcuts = state.users.filter((u) => ['u-ana', 'u-sup'].includes(u.id))

  return (
    <div className="min-h-full flex bg-slate-100">
      {/* painel de marca */}
      <aside className="hidden lg:flex w-[46%] max-w-[560px] flex-col justify-between bg-slate-900 text-white p-10">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center font-bold">OF</div>
          <span className="font-semibold tracking-tight">OmniFlow</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            Todo o atendimento da sua empresa em uma tela só.
          </h1>
          <p className="text-slate-400 mt-3 leading-relaxed">
            Mensagens de três canais entram na mesma fila, o robô faz a triagem e o
            gestor acompanha tudo ao vivo.
          </p>

          <ul className="mt-7 space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, color, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}22`, color }}
                >
                  <Icon size={16} />
                </span>
                <span className="text-sm text-slate-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldCheck size={13} /> Cada empresa com seu próprio endereço, banco e canais.
        </p>
      </aside>

      {/* formulário */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-10 w-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">OF</div>
            <span className="font-semibold text-slate-800 tracking-tight">OmniFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Entrar no painel</h2>
          <p className="text-sm text-slate-500 mt-1">Use o e-mail corporativo cadastrado pelo administrador.</p>

          <form onSubmit={submit} className="mt-6 space-y-3.5">
            <div>
              <label htmlFor="email" className="text-xs font-semibold text-slate-600 mb-1.5 block">E-mail</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email" type="email" autoComplete="username" autoFocus
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@suaempresa.com.br"
                  className="input pl-9 py-2.5"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-semibold text-slate-600 mb-1.5 block">Senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password" type={show ? 'text' : 'password'} autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="input pl-9 pr-10 py-2.5"
                />
                <button
                  type="button" onClick={() => setShow((v) => !v)}
                  title={show ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <TriangleAlert size={14} className="mt-px shrink-0" /> {error}
              </p>
            )}

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                Manter conectado
              </label>
              <button type="button" className="text-xs font-medium text-brand-600 hover:underline">
                Esqueci minha senha
              </button>
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full py-2.5">
              <LogIn size={16} /> {busy ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          {/* atalhos da demonstração */}
          <div className="mt-7 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2.5">
              Entrar direto na demonstração
            </p>
            <div className="space-y-2">
              {shortcuts.map((u) => (
                <button
                  key={u.id} onClick={() => enterAs(u)}
                  className="w-full flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left hover:border-brand-300 hover:bg-brand-50/50 transition-colors group"
                >
                  <Avatar name={u.name} color={u.avatarColor} size="sm" presence={u.status} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {u.role === 'AGENT' ? 'Atendente — vê apenas o inbox' : 'Supervisora — vê o painel do gestor'}
                    </p>
                  </div>
                  <ArrowRight size={15} className="text-slate-300 group-hover:text-brand-600 shrink-0" />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              Qualquer e-mail da equipe funciona com a senha <code className="font-mono">123456</code>.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
