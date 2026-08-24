/**
 * Dados mockados interativos. Espelham 1:1 os modelos do schema Prisma,
 * então trocar o mock por `fetch('/api/tickets')` não muda a UI.
 */
import { uid, minutesAgo } from '../lib/format'
import { CHANNEL_TYPE, TICKET_STATUS, AUTHOR, MSG_KIND, ROLE } from '../lib/constants'

/* ------------------------------- Departments ------------------------------ */
export const departments = [
  { id: 'dep-comercial', name: 'Comercial', slaMinutes: 5, autoAssign: true },
  { id: 'dep-suporte', name: 'Suporte', slaMinutes: 3, autoAssign: true },
  { id: 'dep-financeiro', name: 'Financeiro', slaMinutes: 10, autoAssign: false },
  { id: 'dep-juridico', name: 'Jurídico', slaMinutes: 15, autoAssign: false },
]

/* -------------------------------- Channels -------------------------------- */
export const channels = [
  { id: 'ch-wa', type: CHANNEL_TYPE.WHATSAPP, name: 'WhatsApp Oficial', identifier: '+55 11 4002-8922', provider: 'WHATSAPP_CLOUD', active: true },
  { id: 'ch-wa2', type: CHANNEL_TYPE.WHATSAPP, name: 'WhatsApp Comercial', identifier: '+55 11 98877-1200', provider: 'EVOLUTION', active: true },
  { id: 'ch-ig', type: CHANNEL_TYPE.INSTAGRAM, name: '@andradegomes.adv', identifier: '17841400000000', provider: 'INSTAGRAM_GRAPH', active: true },
  { id: 'ch-web', type: CHANNEL_TYPE.WEBCHAT, name: 'Chat do Site', identifier: 'andradegomes.com.br', provider: 'WEBCHAT', active: true },
]

/* --------------------------------- Users ---------------------------------- */
export const users = [
  { id: 'u-ana', name: 'Ana Beatriz Rocha', email: 'ana@andradegomes.com.br', role: ROLE.AGENT, departmentIds: ['dep-comercial', 'dep-suporte'], avatarColor: 'bg-rose-500', status: 'ONLINE', maxConcurrent: 6 },
  { id: 'u-carlos', name: 'Carlos Menezes', email: 'carlos@andradegomes.com.br', role: ROLE.AGENT, departmentIds: ['dep-suporte'], avatarColor: 'bg-sky-500', status: 'ONLINE', maxConcurrent: 8 },
  { id: 'u-julia', name: 'Júlia Ferraz', email: 'julia@andradegomes.com.br', role: ROLE.AGENT, departmentIds: ['dep-financeiro'], avatarColor: 'bg-amber-500', status: 'BUSY', maxConcurrent: 5 },
  { id: 'u-rafael', name: 'Rafael Lima', email: 'rafael@andradegomes.com.br', role: ROLE.AGENT, departmentIds: ['dep-juridico'], avatarColor: 'bg-violet-500', status: 'AWAY', maxConcurrent: 4 },
  { id: 'u-sup', name: 'Marina Duarte', email: 'marina@andradegomes.com.br', role: ROLE.SUPERVISOR, departmentIds: ['dep-comercial', 'dep-suporte', 'dep-financeiro', 'dep-juridico'], avatarColor: 'bg-brand-600', status: 'ONLINE', maxConcurrent: 3 },
]

export const CURRENT_AGENT_ID = 'u-ana'
export const SUPERVISOR_ID = 'u-sup'

/* -------------------------------- Contacts -------------------------------- */
export const contacts = [
  { id: 'c-1', name: 'Marcos Vinícius Alves', phone: '+55 11 99812-4477', email: 'marcos.alves@construtoraalfa.com.br', company: 'Construtora Alfa', city: 'São Paulo/SP', avatarColor: 'bg-emerald-600', tags: ['Cliente VIP', 'Contrato ativo'], createdAt: minutesAgo(60 * 24 * 320) },
  { id: 'c-2', name: 'Patrícia Nogueira', phone: '+55 21 98455-1290', email: 'patricia@nogueiracontabil.com', company: 'Nogueira Contábil', city: 'Rio de Janeiro/RJ', avatarColor: 'bg-pink-600', tags: ['Lead quente'], createdAt: minutesAgo(60 * 24 * 12) },
  { id: 'c-3', name: 'Eduardo Tavares', phone: '+55 31 99120-3388', email: 'eduardo.tavares@gmail.com', company: '—', city: 'Belo Horizonte/MG', avatarColor: 'bg-sky-600', tags: ['Pessoa física'], createdAt: minutesAgo(60 * 24 * 3) },
  { id: 'c-4', name: 'Luciana Prado', phone: '+55 11 97733-0091', email: 'luciana@pradoimoveis.com.br', company: 'Prado Imóveis', city: 'Campinas/SP', avatarColor: 'bg-amber-600', tags: ['Inadimplente'], createdAt: minutesAgo(60 * 24 * 190) },
  { id: 'c-5', name: 'Roberto Salles', phone: '+55 41 98800-7712', email: 'rsalles@transportessalles.com', company: 'Transportes Salles', city: 'Curitiba/PR', avatarColor: 'bg-violet-600', tags: ['Processo 0012345-98'], createdAt: minutesAgo(60 * 24 * 420) },
  { id: 'c-6', name: 'Fernanda Ribeiro', phone: '+55 51 99677-2210', email: 'fernanda.ribeiro@outlook.com', company: 'MEI', city: 'Porto Alegre/RS', avatarColor: 'bg-teal-600', tags: ['Novo contato'], createdAt: minutesAgo(45) },
  { id: 'c-7', name: 'Thiago Moraes', phone: '+55 11 96540-8123', email: 'thiago@agenciapulse.com.br', company: 'Agência Pulse', city: 'São Paulo/SP', avatarColor: 'bg-indigo-600', tags: ['Parceiro'], createdAt: minutesAgo(60 * 24 * 40) },
  { id: 'c-8', name: 'Camila Duarte', phone: '+55 62 98120-4455', email: 'camila.duarte@gmail.com', company: '—', city: 'Goiânia/GO', avatarColor: 'bg-fuchsia-600', tags: [], createdAt: minutesAgo(60 * 24 * 7) },
]

/* -------------------------------- Helpers --------------------------------- */
let seq = 1000
const nextProtocol = () => `#${++seq}`

const m = (ticketId, authorType, authorId, body, minsAgo, extra = {}) => ({
  id: uid('msg'),
  ticketId,
  authorType,
  authorId,
  kind: extra.kind || MSG_KIND.TEXT,
  body,
  attachment: extra.attachment || null,
  status: authorType === AUTHOR.AGENT ? extra.status || 'READ' : 'RECEIVED',
  createdAt: minutesAgo(minsAgo),
})

const n = (ticketId, authorId, body, minsAgo) => ({
  id: uid('note'),
  ticketId,
  authorId,
  body,
  kind: MSG_KIND.NOTE,
  createdAt: minutesAgo(minsAgo),
})

const MENU = (first) =>
  `Olá, ${first}! 👋 Sou o assistente virtual da Andrade & Gomes.\n` +
  `Para agilizar seu atendimento, escolha uma opção digitando o número:\n` +
  `*1* - Contratar / Orçamento\n*2* - Suporte técnico\n*3* - 2ª via de boleto / Financeiro\n` +
  `*4* - Assuntos jurídicos / Processos\n*0* - Falar com um atendente`

const EV = (id, body, mins) => m(id, AUTHOR.SYSTEM, null, body, mins, { kind: MSG_KIND.EVENT })

/* --------------------------------- Tickets -------------------------------- */
function buildTickets() {
  const t = []

  /* 1 — WhatsApp, em atendimento com a atendente logada */
  t.push({
    id: 'tk-1', protocol: nextProtocol(), contactId: 'c-1', channelId: 'ch-wa',
    departmentId: 'dep-comercial', assigneeId: 'u-ana', status: TICKET_STATUS.OPEN,
    priority: 'HIGH', subject: 'Renovação de contrato anual',
    createdAt: minutesAgo(34), queuedAt: minutesAgo(33), assignedAt: minutesAgo(31),
    firstResponseAt: minutesAgo(30), closedAt: null, lastActivityAt: minutesAgo(2),
    unread: 2, rating: null, typing: false, tags: ['Renovação'],
    messages: [
      m('tk-1', AUTHOR.BOT, null, MENU('Marcos'), 34),
      m('tk-1', AUTHOR.CONTACT, 'c-1', '1', 33),
      EV('tk-1', 'Triagem concluída — ticket direcionado à fila *Comercial*.', 33),
      EV('tk-1', 'Ana Beatriz Rocha assumiu o atendimento.', 31),
      m('tk-1', AUTHOR.AGENT, 'u-ana', 'Olá Marcos, boa tarde! Aqui é a Ana do Comercial. Vi que você quer tratar sobre contrato — é a renovação do plano Empresarial?', 30),
      m('tk-1', AUTHOR.CONTACT, 'c-1', 'Boa tarde Ana! Isso mesmo. O contrato vence dia 30 e queria negociar o reajuste.', 27),
      m('tk-1', AUTHOR.CONTACT, 'c-1', 'Segue o contrato atual que está comigo:', 26),
      m('tk-1', AUTHOR.CONTACT, 'c-1', 'contrato-empresarial-2024.pdf', 26, { kind: MSG_KIND.FILE, attachment: { name: 'contrato-empresarial-2024.pdf', size: 284112, mime: 'application/pdf' } }),
      m('tk-1', AUTHOR.AGENT, 'u-ana', 'Recebido! Vou analisar as cláusulas de reajuste e já te trago uma proposta com condição especial de renovação antecipada.', 22),
      m('tk-1', AUTHOR.CONTACT, 'c-1', 'Perfeito. Consegue ainda hoje? Preciso levar para aprovação da diretoria amanhã cedo.', 4),
      m('tk-1', AUTHOR.CONTACT, 'c-1', 'Se precisar de mais algum documento é só falar 👍', 2),
    ],
    notes: [
      n('tk-1', 'u-ana', 'Cliente desde 2022, nunca atrasou pagamento. Diretoria autorizou até 8% de desconto na renovação antecipada.', 21),
      n('tk-1', 'u-sup', 'Ana, pode oferecer 2 licenças extras como brinde se travar na negociação. — Marina', 10),
    ],
  })

  /* 2 — Instagram, em atendimento com a atendente logada */
  t.push({
    id: 'tk-2', protocol: nextProtocol(), contactId: 'c-2', channelId: 'ch-ig',
    departmentId: 'dep-comercial', assigneeId: 'u-ana', status: TICKET_STATUS.OPEN,
    priority: 'NORMAL', subject: 'Dúvida sobre planos (anúncio IG)',
    createdAt: minutesAgo(18), queuedAt: minutesAgo(17), assignedAt: minutesAgo(15),
    firstResponseAt: minutesAgo(14), closedAt: null, lastActivityAt: minutesAgo(6),
    unread: 0, rating: null, typing: false, tags: ['Lead', 'Instagram Ads'],
    messages: [
      m('tk-2', AUTHOR.CONTACT, 'c-2', 'Oi! Vi o anúncio de vocês aqui no Instagram, ainda tem a promoção?', 18),
      m('tk-2', AUTHOR.BOT, null, MENU('Patrícia'), 18),
      m('tk-2', AUTHOR.CONTACT, 'c-2', '1', 17),
      EV('tk-2', 'Triagem concluída — ticket direcionado à fila *Comercial*.', 17),
      EV('tk-2', 'Ana Beatriz Rocha assumiu o atendimento.', 15),
      m('tk-2', AUTHOR.AGENT, 'u-ana', 'Oi Patrícia! Tem sim 😊 A condição do anúncio vale até sexta. Você é MEI ou tem CNPJ com contabilidade própria?', 14),
      m('tk-2', AUTHOR.CONTACT, 'c-2', 'Tenho escritório de contabilidade, somos 4 pessoas.', 9),
      m('tk-2', AUTHOR.AGENT, 'u-ana', 'Perfeito, então o plano ideal é o Escritório. Vou te mandar a tabela agora.', 7),
      m('tk-2', AUTHOR.AGENT, 'u-ana', 'tabela-planos-2025.png', 6, { kind: MSG_KIND.IMAGE, attachment: { name: 'tabela-planos-2025.png', size: 512400, mime: 'image/png' }, status: 'DELIVERED' }),
    ],
    notes: [n('tk-2', 'u-ana', 'Veio da campanha "IG Ads — Contadores". Registrar origem no CRM.', 8)],
  })

  /* 3 — Webchat aguardando na fila do Suporte (SLA em risco) */
  t.push({
    id: 'tk-3', protocol: nextProtocol(), contactId: 'c-3', channelId: 'ch-web',
    departmentId: 'dep-suporte', assigneeId: null, status: TICKET_STATUS.WAITING,
    priority: 'URGENT', subject: 'Erro ao emitir relatório',
    createdAt: minutesAgo(9), queuedAt: minutesAgo(8), assignedAt: null,
    firstResponseAt: null, closedAt: null, lastActivityAt: minutesAgo(7),
    unread: 3, rating: null, typing: false, tags: ['Bug'],
    messages: [
      m('tk-3', AUTHOR.CONTACT, 'c-3', 'Bom dia! Alguém pode me atender? É urgente.', 9),
      m('tk-3', AUTHOR.BOT, null, MENU('Eduardo'), 9),
      m('tk-3', AUTHOR.CONTACT, 'c-3', '2', 8),
      EV('tk-3', 'Triagem concluída — ticket direcionado à fila *Suporte*.', 8),
      m('tk-3', AUTHOR.CONTACT, 'c-3', 'O sistema retorna erro 500 quando tento gerar o relatório mensal.', 8),
      m('tk-3', AUTHOR.CONTACT, 'c-3', 'erro-500.png', 7, { kind: MSG_KIND.IMAGE, attachment: { name: 'erro-500.png', size: 340220, mime: 'image/png' } }),
    ],
    notes: [],
  })

  /* 4 — WhatsApp ainda dentro do bot de triagem */
  t.push({
    id: 'tk-4', protocol: nextProtocol(), contactId: 'c-6', channelId: 'ch-wa2',
    departmentId: null, assigneeId: null, status: TICKET_STATUS.BOT,
    priority: 'NORMAL', subject: 'Novo contato',
    createdAt: minutesAgo(2), queuedAt: null, assignedAt: null,
    firstResponseAt: null, closedAt: null, lastActivityAt: minutesAgo(1),
    unread: 1, rating: null, typing: false, tags: [], awaitingBotChoice: true,
    messages: [
      m('tk-4', AUTHOR.CONTACT, 'c-6', 'Olá, tudo bem? Vim pelo site de vocês.', 2),
      m('tk-4', AUTHOR.BOT, null, MENU('Fernanda'), 2),
    ],
    notes: [],
  })

  /* 5 — Financeiro com Júlia */
  t.push({
    id: 'tk-5', protocol: nextProtocol(), contactId: 'c-4', channelId: 'ch-wa',
    departmentId: 'dep-financeiro', assigneeId: 'u-julia', status: TICKET_STATUS.OPEN,
    priority: 'HIGH', subject: 'Negociação de débito em aberto',
    createdAt: minutesAgo(52), queuedAt: minutesAgo(51), assignedAt: minutesAgo(44),
    firstResponseAt: minutesAgo(43), closedAt: null, lastActivityAt: minutesAgo(5),
    unread: 1, rating: null, typing: false, tags: ['Cobrança'],
    messages: [
      m('tk-5', AUTHOR.CONTACT, 'c-4', 'Oi, recebi um aviso de pendência mas acredito que já paguei.', 52),
      m('tk-5', AUTHOR.CONTACT, 'c-4', '3', 51),
      EV('tk-5', 'Triagem concluída — ticket direcionado à fila *Financeiro*.', 51),
      EV('tk-5', 'Júlia Ferraz assumiu o atendimento.', 44),
      m('tk-5', AUTHOR.AGENT, 'u-julia', 'Olá Luciana! Vou verificar aqui. Consegue me enviar o comprovante?', 43),
      m('tk-5', AUTHOR.CONTACT, 'c-4', 'comprovante-pix.pdf', 40, { kind: MSG_KIND.FILE, attachment: { name: 'comprovante-pix.pdf', size: 96400, mime: 'application/pdf' } }),
      m('tk-5', AUTHOR.AGENT, 'u-julia', 'Recebido. O pagamento consta de uma competência anterior — vou pedir a baixa manual.', 22),
      m('tk-5', AUTHOR.CONTACT, 'c-4', 'E o boleto deste mês, consigo mudar o vencimento para dia 20?', 5),
    ],
    notes: [n('tk-5', 'u-julia', 'Cliente com 2 atrasos nos últimos 6 meses. Alterar vencimento só com aval da supervisão.', 20)],
  })

  /* 6 — Jurídico aguardando na fila */
  t.push({
    id: 'tk-6', protocol: nextProtocol(), contactId: 'c-5', channelId: 'ch-wa',
    departmentId: 'dep-juridico', assigneeId: null, status: TICKET_STATUS.WAITING,
    priority: 'NORMAL', subject: 'Andamento processual',
    createdAt: minutesAgo(14), queuedAt: minutesAgo(13), assignedAt: null,
    firstResponseAt: null, closedAt: null, lastActivityAt: minutesAgo(13),
    unread: 2, rating: null, typing: false, tags: ['Processo'],
    messages: [
      m('tk-6', AUTHOR.CONTACT, 'c-5', 'Boa tarde, teve alguma movimentação no processo 0012345-98?', 14),
      m('tk-6', AUTHOR.CONTACT, 'c-5', '4', 13),
      EV('tk-6', 'Triagem concluída — ticket direcionado à fila *Jurídico*.', 13),
    ],
    notes: [],
  })

  /* 7 — Suporte com Carlos (contato digitando) */
  t.push({
    id: 'tk-7', protocol: nextProtocol(), contactId: 'c-7', channelId: 'ch-web',
    departmentId: 'dep-suporte', assigneeId: 'u-carlos', status: TICKET_STATUS.OPEN,
    priority: 'NORMAL', subject: 'Integração da API travando',
    createdAt: minutesAgo(41), queuedAt: minutesAgo(40), assignedAt: minutesAgo(38),
    firstResponseAt: minutesAgo(37), closedAt: null, lastActivityAt: minutesAgo(3),
    unread: 0, rating: null, typing: true, tags: ['API'],
    messages: [
      m('tk-7', AUTHOR.CONTACT, 'c-7', 'Fala pessoal! A integração da API está retornando 429 direto.', 41),
      EV('tk-7', 'Triagem concluída — ticket direcionado à fila *Suporte*.', 40),
      EV('tk-7', 'Carlos Menezes assumiu o atendimento.', 38),
      m('tk-7', AUTHOR.AGENT, 'u-carlos', 'Opa Thiago! 429 é rate limit. Qual o volume de requisições por minuto no pico?', 37),
      m('tk-7', AUTHOR.CONTACT, 'c-7', 'Umas 600/min.', 30),
      m('tk-7', AUTHOR.AGENT, 'u-carlos', 'O plano atual libera 300/min. Consigo subir seu limite temporariamente enquanto o Comercial avalia o upgrade.', 26),
      m('tk-7', AUTHOR.CONTACT, 'c-7', 'Show, pode subir por favor.', 3),
    ],
    notes: [n('tk-7', 'u-carlos', 'Limite elevado para 800/min até sexta. Abrir card para o Comercial ofertar upgrade.', 25)],
  })

  /* 8, 9, 10 — Finalizados (alimentam histórico e métricas) */
  t.push({
    id: 'tk-8', protocol: nextProtocol(), contactId: 'c-8', channelId: 'ch-wa',
    departmentId: 'dep-suporte', assigneeId: 'u-ana', status: TICKET_STATUS.RESOLVED,
    priority: 'LOW', subject: 'Reset de senha',
    createdAt: minutesAgo(180), queuedAt: minutesAgo(179), assignedAt: minutesAgo(176),
    firstResponseAt: minutesAgo(175), closedAt: minutesAgo(160), lastActivityAt: minutesAgo(160),
    unread: 0, rating: 5, typing: false, tags: [],
    messages: [
      m('tk-8', AUTHOR.CONTACT, 'c-8', 'Esqueci minha senha, como recupero?', 180),
      EV('tk-8', 'Triagem concluída — ticket direcionado à fila *Suporte*.', 179),
      m('tk-8', AUTHOR.AGENT, 'u-ana', 'Oi Camila! Acabei de enviar o link de redefinição para o seu e-mail cadastrado. 😉', 175),
      m('tk-8', AUTHOR.CONTACT, 'c-8', 'Deu certo! Obrigada 🙏', 162),
      EV('tk-8', 'Atendimento finalizado por Ana Beatriz Rocha. Avaliação: 5/5.', 160),
    ],
    notes: [],
  })

  t.push({
    id: 'tk-9', protocol: nextProtocol(), contactId: 'c-1', channelId: 'ch-wa',
    departmentId: 'dep-financeiro', assigneeId: 'u-julia', status: TICKET_STATUS.RESOLVED,
    priority: 'NORMAL', subject: '2ª via de boleto — abril',
    createdAt: minutesAgo(1560), queuedAt: minutesAgo(1560), assignedAt: minutesAgo(1548),
    firstResponseAt: minutesAgo(1542), closedAt: minutesAgo(1500), lastActivityAt: minutesAgo(1500),
    unread: 0, rating: 4, typing: false, tags: [],
    messages: [
      m('tk-9', AUTHOR.CONTACT, 'c-1', 'Preciso da 2ª via do boleto de abril.', 1560),
      m('tk-9', AUTHOR.AGENT, 'u-julia', 'Segue em anexo, Marcos!', 1542),
      EV('tk-9', 'Atendimento finalizado por Júlia Ferraz. Avaliação: 4/5.', 1500),
    ],
    notes: [],
  })

  t.push({
    id: 'tk-10', protocol: nextProtocol(), contactId: 'c-5', channelId: 'ch-wa',
    departmentId: 'dep-juridico', assigneeId: 'u-rafael', status: TICKET_STATUS.RESOLVED,
    priority: 'NORMAL', subject: 'Envio de procuração assinada',
    createdAt: minutesAgo(3000), queuedAt: minutesAgo(3000), assignedAt: minutesAgo(2970),
    firstResponseAt: minutesAgo(2964), closedAt: minutesAgo(2880), lastActivityAt: minutesAgo(2880),
    unread: 0, rating: 5, typing: false, tags: [],
    messages: [
      m('tk-10', AUTHOR.CONTACT, 'c-5', 'Segue a procuração assinada.', 3000),
      m('tk-10', AUTHOR.AGENT, 'u-rafael', 'Recebido, Roberto. Protocolei no processo hoje.', 2964),
      EV('tk-10', 'Atendimento finalizado por Rafael Lima. Avaliação: 5/5.', 2880),
    ],
    notes: [],
  })

  return t
}

export const tickets = buildTickets()
export const newProtocol = nextProtocol

/** Pool de contatos "novos" usado pelo simulador de tempo real. */
export const INBOUND_POOL = [
  { name: 'Gustavo Pinheiro', phone: '+55 11 99442-1177', company: 'Pinheiro Engenharia', city: 'São Paulo/SP', avatarColor: 'bg-cyan-600' },
  { name: 'Aline Castro', phone: '+55 85 98871-3390', company: 'Castro Modas', city: 'Fortaleza/CE', avatarColor: 'bg-rose-600' },
  { name: 'Wagner Souto', phone: '+55 47 99120-8845', company: 'Souto Log', city: 'Joinville/SC', avatarColor: 'bg-lime-600' },
  { name: 'Beatriz Amaral', phone: '+55 71 98110-2266', company: '—', city: 'Salvador/BA', avatarColor: 'bg-orange-600' },
  { name: 'Henrique Vasques', phone: '+55 61 99230-4471', company: 'Vasques Consultoria', city: 'Brasília/DF', avatarColor: 'bg-purple-600' },
]
