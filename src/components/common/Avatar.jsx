import React from 'react'
import { initials } from '../../lib/format'
import ChannelIcon from './ChannelIcon'

const SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-lg',
}

const PRESENCE = { ONLINE: 'bg-emerald-500', BUSY: 'bg-red-500', AWAY: 'bg-amber-400', OFFLINE: 'bg-slate-300' }

export default function Avatar({ name = '?', color = 'bg-slate-500', size = 'md', channel, presence }) {
  return (
    <div className="relative shrink-0">
      <div
        className={`${SIZES[size]} ${color} rounded-full flex items-center justify-center font-semibold text-white select-none`}
      >
        {initials(name)}
      </div>
      {channel && (
        <span className="absolute -bottom-0.5 -right-0.5">
          <ChannelIcon type={channel} size="sm" withRing />
        </span>
      )}
      {presence && (
        <span
          className={`absolute -bottom-0 -right-0 h-3 w-3 rounded-full ring-2 ring-white ${PRESENCE[presence] || PRESENCE.OFFLINE}`}
        />
      )}
    </div>
  )
}
