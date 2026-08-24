import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, X, RotateCcw, Presentation } from 'lucide-react'
import { useApp } from '../../store/AppContext'

/**
 * Engine da apresentação guiada.
 * A narração fica numa faixa embaixo — não cobre a tela, não bloqueia clique.
 * Cada parada pode destacar um pedaço da interface e fazer algo acontecer.
 */
export default function Apresentacao({ paradas, onSair }) {
  const { state, dispatch } = useApp()
  const [i, setI] = useState(0)
  const [rect, setRect] = useState(null)
  const jaRodou = useRef(new Set())

  const parada = paradas[i]
  const ultima = i === paradas.length - 1

  /* executa a ação da parada uma única vez, mesmo com re-render */
  useEffect(() => {
    if (!parada) return
    const chave = `${i}`
    if (jaRodou.current.has(chave)) return
    jaRodou.current.add(chave)
    parada.act?.({ dispatch, state })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  /* mede o alvo depois que a tela terminou de desenhar */
  useLayoutEffect(() => {
    if (!parada) return
    let r1, r2, t
    const medir = () => {
      if (!parada.alvo) return setRect(null)
      const el = document.querySelector(`[data-tour="${parada.alvo}"]`)
      if (!el) return setRect(null)
      const b = el.getBoundingClientRect()
      setRect({ top: b.top, left: b.left, width: b.width, height: b.height })
    }
    r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(medir) })
    t = setTimeout(medir, 380)
    window.addEventListener('resize', medir)
    window.addEventListener('scroll', medir, true)
    return () => {
      cancelAnimationFrame(r1); cancelAnimationFrame(r2); clearTimeout(t)
      window.removeEventListener('resize', medir)
      window.removeEventListener('scroll', medir, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, state.view, state.selectedTicketId, state.tickets.length])

  const avancar = useCallback(() => setI((v) => Math.min(v + 1, paradas.length - 1)), [paradas.length])

  useEffect(() => {
    const tecla = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); avancar() }
      if (e.key === 'ArrowLeft') setI((v) => Math.max(v - 1, 0))
      if (e.key === 'Escape') onSair()
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [avancar, onSair])

  if (!parada) return null
  const progresso = ((i + 1) / paradas.length) * 100

  return (
    <>
      {/* destaque suave: guia o olho sem escurecer nem travar a tela */}
      {rect && (
        <div
          className="fixed z-40 pointer-events-none rounded-xl ring-2 ring-brand-500/70 transition-all duration-300"
          style={{
            top: rect.top - 6, left: rect.left - 6,
            width: rect.width + 12, height: rect.height + 12,
            boxShadow: '0 0 0 9999px rgba(15,23,42,0.10)',
          }}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-8px_30px_-12px_rgba(15,23,42,.25)]">
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-brand-600 transition-all duration-500" style={{ width: `${progresso}%` }} />
        </div>

        <div className="max-w-[1500px] mx-auto px-5 py-3.5 flex items-start gap-5">
          <div className="hidden sm:flex flex-col items-center shrink-0 pt-0.5">
            <Presentation size={18} className="text-brand-600" />
            <span className="text-[10px] font-semibold text-slate-400 mt-1 tabular-nums">
              {i + 1}/{paradas.length}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-slate-800 leading-snug">{parada.titulo}</h3>
            <p className="text-[13.5px] text-slate-600 leading-[1.6] mt-0.5 max-w-[92ch]">{parada.texto}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            {i > 0 && !ultima && (
              <button onClick={() => setI(i - 1)} className="btn-ghost py-2 px-2.5 text-xs">
                Voltar
              </button>
            )}
            <button onClick={onSair} className="btn-ghost py-2 px-2.5 text-xs text-slate-500">
              <X size={14} /> Sair
            </button>
            {ultima ? (
              <button onClick={() => window.location.reload()} className="btn-outline py-2 text-xs">
                <RotateCcw size={14} /> Recomeçar
              </button>
            ) : (
              <button onClick={avancar} className="btn-primary py-2 text-xs">
                Próximo <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
