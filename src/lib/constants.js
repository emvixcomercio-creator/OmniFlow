/** Enums espelhando o schema Prisma — fonte única de verdade da UI. */

export const CHANNEL_TYPE = {
  WHATSAPP: 'WHATSAPP',
  INSTAGRAM: 'INSTAGRAM',
  WEBCHAT: 'WEBCHAT',
}

export const CHANNEL_META = {
  WHATSAPP: { label: 'WhatsApp', color: '#25D366', soft: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  INSTAGRAM: { label: 'Instagram', color: '#E1306C', soft: 'bg-pink-50 text-pink-700 border-pink-200' },
  WEBCHAT: { label: 'Chat do Site', color: '#0EA5E9', soft: 'bg-sky-50 text-sky-700 border-sky-200' },
}

/** Ciclo de vida do ticket. */
export const TICKET_STATUS = {
  BOT: 'BOT',           // no menu de triagem automática
  WAITING: 'WAITING',   // na fila do departamento, sem atendente
  OPEN: 'OPEN',         // em atendimento humano
  RESOLVED: 'RESOLVED', // finalizado
}

export const STATUS_META = {
  BOT: { label: 'Bot / Triagem', pill: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  WAITING: { label: 'Aguardando', pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  OPEN: { label: 'Em atendimento', pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  RESOLVED: { label: 'Finalizado', pill: 'bg-slate-200 text-slate-600', dot: 'bg-slate-400' },
}

export const PRIORITY_META = {
  LOW: { label: 'Baixa', pill: 'bg-slate-100 text-slate-600' },
  NORMAL: { label: 'Normal', pill: 'bg-sky-100 text-sky-700' },
  HIGH: { label: 'Alta', pill: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgente', pill: 'bg-red-100 text-red-700' },
}

export const ROLE = { ADMIN: 'ADMIN', SUPERVISOR: 'SUPERVISOR', AGENT: 'AGENT' }

export const AUTHOR = { CONTACT: 'CONTACT', AGENT: 'AGENT', BOT: 'BOT', SYSTEM: 'SYSTEM' }

/** Tipos de item na linha do tempo. */
export const MSG_KIND = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
  AUDIO: 'AUDIO',
  EVENT: 'EVENT', // transferências, atribuições, encerramento
  NOTE: 'NOTE',   // nota interna (model Note)
}

export const DEPT_COLORS = {
  'dep-comercial': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'dep-suporte': 'bg-sky-100 text-sky-700 border-sky-200',
  'dep-financeiro': 'bg-amber-100 text-amber-700 border-amber-200',
  'dep-juridico': 'bg-violet-100 text-violet-700 border-violet-200',
}
