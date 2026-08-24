import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, X, Compass, Check } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { TOUR_STEPS } from './tourSteps'

const PAD = 8
const CARD_W = 400

/** Recorta o elemento-alvo com quatro painéis escuros (o buraco continua clicável). */
function Scrim({ rect }) {
  const panels = rect
    ? [
        { top: 0, left: 0, width: '100%', height: Math.max(0, rect.top - PAD) },
        { top: Math.max(0, rect.bottom + PAD), left: 0, width: '100%', bottom: 0 },
        { top: Math.max(0, rect.top - PAD), left: 0, width: Math.max(0, rect.left - PAD), height: rect.height + PAD * 2 },
        { top: Math.max(0, rect.top - PAD), left: rect.right + PAD, right: 0, height: rect.height + PAD * 2 },
      ]
    : [{ inset: 0 }]

  return (
    <>
      {panels.map((style, i) => (
        <div key={i} className="fixed bg-slate-900/50 z-[60] pointer-events-none" style={style} />
      ))}
      {rect && (
        <div
          className="fixed z-[61] pointer-events-none rounded-xl ring-2 ring-brand-400 ring-offset-2 ring-offset-slate-900/0 transition-all duration-300"
          style={{
            top: rect.top - PAD, left: rect.left - PAD,
            width: rect.width + PAD * 2, height: rect.height + PAD * 2,
          }}
        />
      )}
    </>
  )
}

/** Posiciona o cartão ao lado do alvo, sem sair da tela. */
function cardStyle(rect, place) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (!rect || place === 'center') {
    return { top: Math.max(24, vh / 2 - 160), left: Math.max(24, vw / 2 - CARD_W / 2), width: CARD_W }
  }
  const clampX = (x) => Math.min(Math.max(16, x), vw - CARD_W - 16)
  const clampY = (y) => Math.min(Math.max(16, y), vh - 250)

  if (place === 'right' && rect.right + CARD_W + 40 < vw)
    return { top: clampY(rect.top), left: clampX(rect.right + 24), width: CARD_W }
  if (place === 'left' && rect.left - CARD_W - 40 > 0)
    return { top: clampY(rect.top), left: clampX(rect.left - CARD_W - 24), width: CARD_W }
  if (place === 'top')
    return { top: clampY(rect.top - 236), left: clampX(rect.left + rect.width / 2 - CARD_W / 2), width: CARD_W }
  return { top: clampY(rect.bottom + 20), left: clampX(rect.left + rect.width / 2 - CARD_W / 2), width: CARD_W }
}

export default function GuidedTour({ open, onClose, onFinish }) {
  const { state, dispatch } = useApp()
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState(null)
  const wasRunning = useRef(false)
  const loggedUser = useRef(null)

  const step = TOUR_STEPS[index]
  const last = index === TOUR_STEPS.length - 1

  /* guarda se a simulação estava ligada para devolvê-la no fim */
  useEffect(() => {
    if (open) {
      wasRunning.current = state.simulation
      loggedUser.current = state.currentUserId
      setIndex(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const finish = useCallback(() => {
    dispatch({ type: 'SET_SIMULATION', value: wasRunning.current })
    // o tour troca de usuário para mostrar as duas visões — devolve quem entrou
    if (loggedUser.current) dispatch({ type: 'SET_CURRENT_USER', userId: loggedUser.current })
    onClose()
  }, [dispatch, onClose])

  /* prepara o app para o passo atual */
  useEffect(() => {
    if (!open || !step) return
    step.before?.({ dispatch, state })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index])

  /* mede o alvo depois que a tela terminou de renderizar */
  useLayoutEffect(() => {
    if (!open || !step) return
    let raf1, raf2, timer

    const measure = () => {
      if (!step.target) return setRect(null)
      const el = document.querySelector(`[data-tour="${step.target}"]`)
      if (!el) return setRect(null)
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height })
    }

    const el = step.target && document.querySelector(`[data-tour="${step.target}"]`)
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })

    raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(measure) })
    timer = setTimeout(measure, 420)

    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); clearTimeout(timer)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, state.view, state.selectedTicketId])

  /* teclado: setas navegam, Esc encerra */
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') finish()
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, TOUR_STEPS.length - 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, finish])

  if (!open || !step) return null

  return (
    <>
      <Scrim rect={rect} />

      <div
        role="dialog"
        aria-label={step.title}
        className="fixed z-[62] card shadow-2xl p-5 animate-pop-in"
        style={cardStyle(rect, step.place)}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Compass size={14} className="text-brand-600 shrink-0" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-600 flex-1">
            {step.eyebrow}
          </span>
          <button onClick={finish} title="Encerrar tour" className="btn-ghost h-7 w-7 p-0">
            <X size={14} />
          </button>
        </div>

        <h3 className="text-[17px] font-semibold text-slate-800 leading-snug">{step.title}</h3>
        <p className="text-[14px] text-slate-600 mt-2 leading-[1.65]">{step.body}</p>
        <p className="text-[11px] text-slate-400 mt-2.5">
          Pode clicar na tela normalmente enquanto lê — nada fica travado.
        </p>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex gap-1 flex-1">
            {TOUR_STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                title={s.title}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-5 bg-brand-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button onClick={finish} className="btn-ghost py-1.5 px-2 text-xs text-slate-500">
            Sair
          </button>

          {index > 0 && (
            <button onClick={() => setIndex(index - 1)} className="btn-ghost py-1.5 px-2 text-xs">
              <ArrowLeft size={14} />
            </button>
          )}

          {last ? (
            <button
              onClick={() => { onFinish?.(); finish() }}
              className="btn-primary py-1.5 text-xs"
            >
              <Check size={14} /> {step.cta || 'Concluir'}
            </button>
          ) : (
            <button onClick={() => setIndex(index + 1)} className="btn-primary py-1.5 text-xs">
              Próximo <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
