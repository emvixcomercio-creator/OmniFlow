/**
 * Bot de triagem — dirigido por configuração, não por código.
 * O gestor edita tudo em Equipe → Menu de triagem; o que está aqui é só o
 * padrão de fábrica e as funções que montam as mensagens.
 * Espelhado no back-end por server/lib/bot.js (model BotMenuOption).
 */

export const BOT_NAME = 'Assistente Virtual'

export const DEFAULT_BOT_CONFIG = {
  companyName: 'Andrade & Gomes',
  greeting:
    'Olá, {{nome}}! 👋 Sou o assistente virtual da {{empresa}}.\n' +
    'Para agilizar seu atendimento, escolha uma opção digitando o número:',
  invalid: 'Não entendi sua resposta. 😕 Digite apenas o *número* da opção desejada.',
  transfer:
    'Perfeito! Estou transferindo você para o setor *{{setor}}*.\n' +
    'Um de nossos especialistas assumirá a conversa em instantes. ⏳',
  maxAttempts: 3,
  fallbackDepartmentId: 'dep-comercial',
  keywordsEnabled: true,
  options: [
    { id: 'opt-1', key: '1', label: 'Contratar / Orçamento', departmentId: 'dep-comercial', subject: 'Solicitação de orçamento', active: true },
    { id: 'opt-2', key: '2', label: 'Suporte técnico', departmentId: 'dep-suporte', subject: 'Suporte técnico', active: true },
    { id: 'opt-3', key: '3', label: '2ª via de boleto / Financeiro', departmentId: 'dep-financeiro', subject: 'Assunto financeiro', active: true },
    { id: 'opt-4', key: '4', label: 'Assuntos jurídicos / Processos', departmentId: 'dep-juridico', subject: 'Consulta jurídica', active: true },
    { id: 'opt-0', key: '0', label: 'Falar com um atendente', departmentId: 'dep-comercial', subject: 'Atendimento geral', active: true },
  ],
}

/** Palavras-chave levam ao departamento, não à tecla — sobrevivem a mudanças no menu. */
const KEYWORDS = [
  { re: /(or[cç]amento|contrat|compr|plano|pre[cç]o|valor)/i, departmentId: 'dep-comercial' },
  { re: /(suporte|erro|bug|n[aã]o funciona|sistema|senha|acesso)/i, departmentId: 'dep-suporte' },
  { re: /(boleto|nota|fatura|pagamento|financeir|cobran)/i, departmentId: 'dep-financeiro' },
  { re: /(processo|jur[ií]dic|advogad|a[cç][aã]o|audi[eê]ncia)/i, departmentId: 'dep-juridico' },
]

export const activeOptions = (config) => (config?.options || []).filter((o) => o.active)

export const menuText = (config) =>
  activeOptions(config).map((o) => `*${o.key}* - ${o.label}`).join('\n')

export function greetingText(config, contactName = 'tudo bem') {
  const first = String(contactName).trim().split(/\s+/)[0]
  const head = (config.greeting || '')
    .replaceAll('{{nome}}', first)
    .replaceAll('{{empresa}}', config.companyName || '')
  return `${head}\n${menuText(config)}`
}

export const invalidText = (config) => `${config.invalid}\n\n${menuText(config)}`

export const transferText = (config, departmentName) =>
  (config.transfer || '').replaceAll('{{setor}}', departmentName)

/** Interpreta a resposta do contato: primeiro a tecla, depois palavra-chave. */
export function resolveChoice(config, text) {
  const clean = String(text || '').trim().toLowerCase()
  const options = activeOptions(config)

  const direct = options.find((o) => o.key.toLowerCase() === clean)
  if (direct) return direct

  if (config.keywordsEnabled) {
    const hit = KEYWORDS.find((k) => k.re.test(clean))
    if (hit) {
      const byDept = options.find((o) => o.departmentId === hit.departmentId)
      if (byDept) return byDept
    }
  }
  return null
}

/** Para onde vai quem errou o menu vezes demais. */
export const fallbackOption = (config) => ({
  key: '-',
  label: 'Atendimento geral',
  departmentId: config.fallbackDepartmentId,
  subject: 'Atendimento geral',
})
