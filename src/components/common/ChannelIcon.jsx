import React from 'react'
import { MessageCircle, Instagram, Globe } from 'lucide-react'
import { CHANNEL_TYPE, CHANNEL_META } from '../../lib/constants'

const ICONS = {
  [CHANNEL_TYPE.WHATSAPP]: MessageCircle,
  [CHANNEL_TYPE.INSTAGRAM]: Instagram,
  [CHANNEL_TYPE.WEBCHAT]: Globe,
}

/** Selo do canal de origem — usado na lista, no header e nos cards do gestor. */
export default function ChannelIcon({ type, size = 'md', withRing = false, className = '' }) {
  const Icon = ICONS[type] || Globe
  const meta = CHANNEL_META[type] || {}
  const dims = { xs: 'h-4 w-4', sm: 'h-5 w-5', md: 'h-6 w-6', lg: 'h-8 w-8' }[size]
  const icon = { xs: 10, sm: 12, md: 14, lg: 18 }[size]

  return (
    <span
      title={meta.label}
      style={{ backgroundColor: meta.color }}
      className={`inline-flex items-center justify-center rounded-full text-white shrink-0 ${dims} ${
        withRing ? 'ring-2 ring-white' : ''
      } ${className}`}
    >
      <Icon size={icon} strokeWidth={2.5} />
    </span>
  )
}

export function ChannelLabel({ type }) {
  const meta = CHANNEL_META[type] || {}
  return (
    <span className={`chip border ${meta.soft}`}>
      <ChannelIcon type={type} size="xs" />
      {meta.label}
    </span>
  )
}
