import React, { useState } from 'react'
import {
  X, Bot, Plus, Trash2, ArrowUp, ArrowDown, Save, RotateCcw, Smartphone, Wand2,
} from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { useEscape } from '../../lib/useEscape'
import { DEFAULT_BOT_CONFIG, greetingText, transferText } from '../../lib/bot'
import { uid } from '../../lib/format'

/** Renderiza *negrito* como o WhatsApp faz, para a prévia bater com o real. */
function Rich({ text }) {
  return String(text).split(/(\*[^*\n]+\*)/g).map((p, i) =>
    p.startsWith('*') && p.endsWith('*') && p.length > 2
      ? <strong key={i}>{p.slice(1, -1)}</strong>
      : <React.Fragment key={i}>{p}</React.Fragment>,
  )
}

/** Bolha do WhatsApp usada só na pré-visualização. */
function Bubble({ children, from = 'bot' }) {
  const mine = from === 'bot'
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} my-1`}>
      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[12.5px] whitespace-pre-wrap shadow-sm ${
        mine ? 'bg-violet-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
      }`}>
        <Rich text={children} />
      </div>
    </div>
  )
}

export default function BotEditor({ onClose }) {
  const { state, dispatch } = useApp()
  useEscape(onClose)

  const [draft, setDraft] = useState(state.botConfig)
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))

  const setOption = (id, patch) =>
    set({ options: draft.options.map((o) => (o.id === id ? { ...o, ...patch } : o)) })

  const move = (index, dir) => {
    const next = [...draft.options]
    const to = index + dir
    if (to < 0 || to >= next.length) return
    ;[next[index], next[to]] = [next[to], next[index]]
    set({ options: next })
  }

  const addOption = () =>
    set({
      options: [...draft.options, {
        id: uid('opt'), key: String(draft.options.length + 1),
        label: 'Nova opção', departmentId: state.departments[0].id,
        subject: 'Novo assunto', active: true,
      }],
    })

  const remove = (id) => set({ options: draft.options.filter((o) => o.id !== id) })

  const duplicateKeys = draft.options
    .filter((o) => o.active)
    .map((o) => o.key.trim())
    .filter((k, i, arr) => k && arr.indexOf(k) !== i)

  const save = () => {
    dispatch({ type: 'UPDATE_BOT_CONFIG', config: draft })
    onClose()
  }

  const previewDept = state.departments.find((d) => d.id === draft.options[0]?.departmentId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-fade-in" onClick={onClose}>
      <div className="card w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-200">
          <Bot size={18} className="text-violet-600" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800">Menu de triagem automática</h3>
            <p className="text-xs text-slate-500">
              Quem edita: supervisor ou administrador. Vale para todos os canais ao mesmo tempo.
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost h-8 w-8 p-0"><X size={16} /></button>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-hidden">
          {/* edição */}
          <div className="overflow-y-auto scroll-thin p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Nome da empresa</label>
                <input value={draft.companyName} onChange={(e) => set({ companyName: e.target.value })} className="input py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Tentativas antes de desistir
                </label>
                <input
                  type="number" min="1" max="5" value={draft.maxAttempts}
                  onChange={(e) => set({ maxAttempts: Number(e.target.value) })}
                  className="input py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Saudação</label>
              <textarea
                rows={3} value={draft.greeting} onChange={(e) => set({ greeting: e.target.value })}
                className="input resize-none text-sm"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Use <code>{'{{nome}}'}</code> para o primeiro nome do cliente e <code>{'{{empresa}}'}</code> para o nome acima.
              </p>
            </div>

            {/* opções */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex-1">
                  Opções do menu
                </h4>
                <button onClick={addOption} className="btn-outline py-1 px-2 text-xs">
                  <Plus size={13} /> Adicionar
                </button>
              </div>

              {duplicateKeys.length > 0 && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2">
                  A tecla <strong>{duplicateKeys[0]}</strong> está repetida. O bot vai usar sempre a primeira.
                </p>
              )}

              <div className="space-y-2">
                {draft.options.map((o, i) => (
                  <div key={o.id} className={`rounded-lg border p-2.5 ${o.active ? 'border-slate-200' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
                    <div className="flex items-center gap-2">
                      <input
                        value={o.key} onChange={(e) => setOption(o.id, { key: e.target.value.slice(0, 2) })}
                        className="input w-11 text-center py-1.5 text-sm font-mono" aria-label="Tecla"
                      />
                      <input
                        value={o.label} onChange={(e) => setOption(o.id, { label: e.target.value })}
                        placeholder="O que o cliente lê" className="input py-1.5 text-sm flex-1"
                      />
                      <select
                        value={o.departmentId} onChange={(e) => setOption(o.id, { departmentId: e.target.value })}
                        className="input py-1.5 text-xs w-auto"
                      >
                        {state.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        value={o.subject} onChange={(e) => setOption(o.id, { subject: e.target.value })}
                        placeholder="Assunto do ticket" className="input py-1 text-xs flex-1"
                      />
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-600 shrink-0">
                        <input type="checkbox" checked={o.active} onChange={(e) => setOption(o.id, { active: e.target.checked })} className="rounded border-slate-300" />
                        Ativa
                      </label>
                      <div className="flex gap-0.5 shrink-0">
                        <button onClick={() => move(i, -1)} disabled={i === 0} className="btn-ghost h-7 w-7 p-0"><ArrowUp size={13} /></button>
                        <button onClick={() => move(i, 1)} disabled={i === draft.options.length - 1} className="btn-ghost h-7 w-7 p-0"><ArrowDown size={13} /></button>
                        <button onClick={() => remove(o.id)} className="btn-ghost h-7 w-7 p-0 text-slate-400 hover:text-red-600"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* fallback e NLU */}
            <div className="rounded-lg border border-slate-200 p-3 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox" checked={draft.keywordsEnabled}
                  onChange={(e) => set({ keywordsEnabled: e.target.checked })}
                  className="rounded border-slate-300 mt-0.5"
                />
                <span>
                  <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                    <Wand2 size={13} className="text-violet-500" /> Entender texto solto
                  </span>
                  <span className="text-xs text-slate-500 block">
                    Quem escreve "preciso da 2ª via do boleto" vai para o Financeiro sem digitar o número.
                  </span>
                </span>
              </label>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Se errar {draft.maxAttempts}× o menu, mandar para
                </label>
                <select
                  value={draft.fallbackDepartmentId}
                  onChange={(e) => set({ fallbackDepartmentId: e.target.value })}
                  className="input py-1.5 text-sm"
                >
                  {state.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Aviso de transferência</label>
              <textarea
                rows={2} value={draft.transfer} onChange={(e) => set({ transfer: e.target.value })}
                className="input resize-none text-sm"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                <code>{'{{setor}}'}</code> vira o nome do departamento escolhido.
              </p>
            </div>
          </div>

          {/* pré-visualização */}
          <aside className="border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50 flex flex-col min-h-0">
            <div className="px-4 py-2.5 border-b border-slate-200 flex items-center gap-1.5">
              <Smartphone size={13} className="text-slate-400" />
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                O que o cliente vê
              </h4>
            </div>
            <div className="flex-1 overflow-y-auto scroll-thin chat-bg p-3">
              <Bubble from="contact">Oi, boa tarde!</Bubble>
              <Bubble>{greetingText(draft, 'Marcos Vinícius')}</Bubble>
              <Bubble from="contact">{draft.options.find((o) => o.active)?.key || '1'}</Bubble>
              <Bubble>{transferText(draft, previewDept?.name || 'Comercial')}</Bubble>
            </div>
            <p className="text-[11px] text-slate-400 px-4 py-2 border-t border-slate-200">
              Atualiza conforme você digita. Vale igual para WhatsApp, Instagram e chat do site.
            </p>
          </aside>
        </div>

        <footer className="flex items-center gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button onClick={() => setDraft(DEFAULT_BOT_CONFIG)} className="btn-ghost py-2 text-xs">
            <RotateCcw size={14} /> Restaurar padrão
          </button>
          <span className="flex-1" />
          <button onClick={onClose} className="btn-outline py-2 text-xs">Cancelar</button>
          <button onClick={save} className="btn-primary py-2 text-xs">
            <Save size={14} /> Salvar menu
          </button>
        </footer>
      </div>
    </div>
  )
}
