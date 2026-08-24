/** Utilitários de formatação, tempo e identificadores. */

export const uid = (prefix = 'id') =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`

export const nowIso = () => new Date().toISOString()

export const minutesAgo = (m) => new Date(Date.now() - m * 60_000).toISOString()

/** 09:42 */
export const clock = (iso) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

/** "agora", "3 min", "2 h", "4 d" */
export function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 45) return 'agora'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} h`
  const d = Math.floor(h / 24)
  return `${d} d`
}

/** 00:00 / 12:35 / 1h 04m */
export function duration(ms) {
  if (ms == null || Number.isNaN(ms)) return '--'
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function dayLabel(iso) {
  const d = new Date(iso)
  const today = new Date()
  const yest = new Date(Date.now() - 86_400_000)
  const same = (a, b) => a.toDateString() === b.toDateString()
  if (same(d, today)) return 'Hoje'
  if (same(d, yest)) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
}

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export const bytes = (n) => {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
