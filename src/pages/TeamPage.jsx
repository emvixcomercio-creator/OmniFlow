import React, { useEffect, useState } from 'react'
import { Building2, Bot, Users, Timer, Plug, Settings2, Pencil } from 'lucide-react'
import ChannelSetupDialog from '../components/team/ChannelSetupDialog'
import BotEditor from '../components/team/BotEditor'
import { useApp } from '../store/AppContext'
import Avatar from '../components/common/Avatar'
import ChannelIcon from '../components/common/ChannelIcon'
import { activeOptions } from '../lib/bot'
import { TICKET_STATUS, CHANNEL_META } from '../lib/constants'

export default function TeamPage() {
  const { state } = useApp()
  const [setup, setSetup] = useState(null)
  const [botOpen, setBotOpen] = useState(false)

  // o último passo do tour guiado abre este assistente
  useEffect(() => {
    const open = () => setSetup('WHATSAPP_CLOUD')
    window.addEventListener('omniflow:open-channel-setup', open)
    return () => window.removeEventListener('omniflow:open-channel-setup', open)
  }, [])

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scroll-thin bg-slate-100">
      <div className="px-5 py-4 max-w-[1500px] mx-auto space-y-4">
        <header className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[240px]">
            <h1 className="text-xl font-bold text-slate-800">Departamentos, equipe e canais</h1>
            <p className="text-sm text-slate-500">
              Configuração das filas, do menu de triagem e das integrações conectadas.
            </p>
          </div>
          <button onClick={() => setSetup('WHATSAPP_CLOUD')} className="btn-primary py-2 text-xs">
            <Plug size={14} /> Conectar um canal
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Departamentos */}
          <section className="card p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <Building2 size={15} className="text-slate-400" /> Departamentos
            </h3>
            <div className="space-y-2">
              {state.departments.map((d) => {
                const team = state.users.filter((u) => u.departmentIds.includes(d.id))
                const queue = state.tickets.filter(
                  (t) => t.departmentId === d.id && t.status === TICKET_STATUS.WAITING,
                ).length
                return (
                  <div key={d.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 flex-1">{d.name}</p>
                      <span className="chip bg-slate-100 text-slate-600"><Timer size={11} /> SLA {d.slaMinutes} min</span>
                      <span className={`chip ${queue ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {queue} na fila
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {team.map((u) => (
                        <Avatar key={u.id} name={u.name} color={u.avatarColor} size="sm" presence={u.status} />
                      ))}
                      <span className="text-[11px] text-slate-400 ml-1">
                        {team.length} membro(s) · distribuição {d.autoAssign ? 'automática' : 'manual'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Menu do bot */}
          <section className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 flex-1">
                <Bot size={15} className="text-violet-500" /> Menu de triagem automática
              </h3>
              <button onClick={() => setBotOpen(true)} className="btn-outline py-1 px-2.5 text-xs">
                <Pencil size={13} /> Editar
              </button>
            </div>
            <div className="space-y-1.5">
              {activeOptions(state.botConfig).map((o) => {
                const dep = state.departments.find((d) => d.id === o.departmentId)
                return (
                  <div key={o.key} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                    <span className="h-7 w-7 rounded-lg bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center">
                      {o.key}
                    </span>
                    <p className="text-sm text-slate-700 flex-1">{o.label}</p>
                    <span className="chip bg-slate-100 text-slate-600">→ {dep?.name}</span>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              {state.botConfig.keywordsEnabled
                ? 'Respostas fora do menu passam por palavras-chave antes de o bot repetir as opções.'
                : 'O bot aceita apenas o número da opção.'}{' '}
              Depois de {state.botConfig.maxAttempts} tentativas erradas, o chamado vai para{' '}
              {state.departments.find((d) => d.id === state.botConfig.fallbackDepartmentId)?.name}.
            </p>
          </section>

          {/* Canais */}
          <section className="card p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <Plug size={15} className="text-slate-400" /> Canais conectados
            </h3>
            <div className="space-y-2">
              {state.channels.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                  <ChannelIcon type={c.type} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                    <p className="text-[11px] text-slate-500">{CHANNEL_META[c.type].label} · {c.identifier}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`chip ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {c.active ? 'Conectado' : 'Inativo'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{c.provider}</p>
                  </div>
                  <button
                    onClick={() => setSetup(c.provider)}
                    title="Ver o passo a passo de conexão"
                    className="btn-outline py-1.5 px-2.5 text-xs shrink-0"
                  >
                    <Settings2 size={14} /> <span className="hidden sm:inline">Como conectar</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Equipe */}
          <section className="card p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <Users size={15} className="text-slate-400" /> Equipe
            </h3>
            <div className="space-y-2">
              {state.users.map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                  <Avatar name={u.name} color={u.avatarColor} presence={u.status} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="chip bg-brand-50 text-brand-700 border border-brand-200">
                      {u.role === 'AGENT' ? 'Atendente' : u.role === 'SUPERVISOR' ? 'Supervisor' : 'Admin'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">até {u.maxConcurrent} simultâneos</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {setup && <ChannelSetupDialog initialProvider={setup} onClose={() => setSetup(null)} />}
      {botOpen && <BotEditor onClose={() => setBotOpen(false)} />}
    </div>
  )
}
