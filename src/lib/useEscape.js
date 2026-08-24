import { useEffect } from 'react'

/** Fecha modais/drawers com a tecla Esc. */
export function useEscape(onClose) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])
}
