/** Árvore de triagem — espelho de src/lib/bot.js usado no front. */

export const BOT_MENU = [
  { key: '1', label: 'Contratar / Orçamento', slug: 'comercial', subject: 'Solicitação de orçamento' },
  { key: '2', label: 'Suporte técnico', slug: 'suporte', subject: 'Suporte técnico' },
  { key: '3', label: '2ª via de boleto / Financeiro', slug: 'financeiro', subject: 'Assunto financeiro' },
  { key: '4', label: 'Assuntos jurídicos / Processos', slug: 'juridico', subject: 'Consulta jurídica' },
  { key: '0', label: 'Falar com um atendente', slug: 'comercial', subject: 'Atendimento geral' },
]

const KEYWORDS = [
  { re: /(or[cç]amento|contrat|compr|plano|pre[cç]o|valor)/i, key: '1' },
  { re: /(suporte|erro|bug|n[aã]o funciona|sistema|senha|acesso)/i, key: '2' },
  { re: /(boleto|nota|fatura|pagamento|financeir|cobran)/i, key: '3' },
  { re: /(processo|jur[ií]dic|advogad|a[cç][aã]o|audi[eê]ncia)/i, key: '4' },
  { re: /(atendente|humano|pessoa|falar com)/i, key: '0' },
]

export const menuText = () => BOT_MENU.map((o) => `*${o.key}* - ${o.label}`).join('\n')

export const greeting = (name, company = 'Andrade & Gomes') =>
  `Olá, ${String(name).split(' ')[0]}! 👋 Sou o assistente virtual da ${company}.\n` +
  `Para agilizar seu atendimento, escolha uma opção digitando o número:\n${menuText()}`

export const invalid = () =>
  `Não entendi sua resposta. 😕 Digite apenas o *número* da opção desejada.\n\n${menuText()}`

export const transferText = (deptName) =>
  `Perfeito! Estou transferindo você para o setor *${deptName}*.\n` +
  `Um de nossos especialistas assumirá a conversa em instantes. ⏳`

export function resolveChoice(text) {
  const clean = String(text || '').trim().toLowerCase()
  const direct = BOT_MENU.find((o) => o.key === clean)
  if (direct) return direct
  const hit = KEYWORDS.find((k) => k.re.test(clean))
  return hit ? BOT_MENU.find((o) => o.key === hit.key) : null
}
