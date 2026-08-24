/**
 * Roteiro da apresentação: o sistema começa vazio e vai sendo montado,
 * até uma conversa de verdade nascer e ser encerrada na frente de quem assiste.
 */
import { uid, nowIso } from './format'
import * as seed from '../data/seed'
import { TICKET_STATUS, AUTHOR, MSG_KIND } from './constants'
import { DEFAULT_BOT_CONFIG, greetingText, transferText } from './bot'

/** Estado de primeiro dia: nada cadastrado, nada acontecendo. */
export const ESTADO_ZERADO = {
  users: [seed.users.find((u) => u.id === 'u-sup')],
  departments: [],
  channels: [],
  contacts: [],
  tickets: [],
  selectedTicketId: null,
  spyTicketId: null,
  currentUserId: 'u-sup',
  view: 'team',
  simulation: false,
  botConfig: { ...DEFAULT_BOT_CONFIG, options: [] },
}

const CLIENTE = {
  id: 'c-demo',
  name: 'Renata Aguiar',
  phone: '+55 11 98123-4455',
  email: 'renata.aguiar@empresa.com.br',
  company: 'Aguiar Confecções',
  city: 'São Paulo/SP',
  avatarColor: 'bg-rose-600',
  tags: ['Primeiro contato'],
  createdAt: nowIso(),
}

const TICKET_ID = 'tk-demo'

const msg = (authorType, authorId, body, extra = {}) => ({
  id: uid('msg'),
  ticketId: TICKET_ID,
  authorType,
  authorId,
  kind: extra.kind || MSG_KIND.TEXT,
  body,
  attachment: extra.attachment || null,
  status: authorType === AUTHOR.AGENT ? 'READ' : 'RECEIVED',
  createdAt: nowIso(),
})

export const PRIMEIRO_TICKET = () => ({
  id: TICKET_ID,
  protocol: '#1001',
  contactId: CLIENTE.id,
  channelId: 'ch-wa',
  departmentId: null,
  assigneeId: null,
  status: TICKET_STATUS.BOT,
  priority: 'NORMAL',
  subject: 'Primeiro contato',
  createdAt: nowIso(),
  queuedAt: null,
  assignedAt: null,
  firstResponseAt: null,
  closedAt: null,
  lastActivityAt: nowIso(),
  unread: 1,
  rating: null,
  typing: false,
  tags: [],
  awaitingBotChoice: true,
  messages: [msg(AUTHOR.CONTACT, CLIENTE.id, 'Boa tarde! Comprei com vocês semana passada e o sistema não deixa eu emitir a nota. Podem me ajudar?')],
  notes: [],
})

export { CLIENTE, TICKET_ID, msg }
export const CONFIG_BOT = DEFAULT_BOT_CONFIG
export { greetingText, transferText }
