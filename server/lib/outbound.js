import { prisma } from './prisma.js'

/**
 * Envio de mensagens para cada provedor.
 * Todos retornam o ID externo da mensagem (para casar os recibos de entrega).
 */

/* ----------------------------- Evolution API ------------------------------ */
async function sendEvolution({ channel, to, body }) {
  const base = channel.config?.apiUrl || process.env.EVOLUTION_API_URL
  const instance = channel.config?.instance || process.env.EVOLUTION_INSTANCE
  const apiKey = channel.config?.apiKey || process.env.EVOLUTION_API_KEY

  const res = await fetch(`${base}/message/sendText/${instance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: apiKey },
    body: JSON.stringify({ number: to, text: body }),
  })
  if (!res.ok) throw new Error(`Evolution API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data?.key?.id || null
}

/* --------------------------- WhatsApp Cloud API --------------------------- */
async function sendWhatsAppCloud({ channel, to, body }) {
  const phoneId = channel.config?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = channel.config?.token || process.env.WHATSAPP_TOKEN

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body },
    }),
  })
  if (!res.ok) throw new Error(`WhatsApp Cloud ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data?.messages?.[0]?.id || null
}

/* --------------------------- Instagram Graph API -------------------------- */
async function sendInstagram({ channel, to, body }) {
  const igId = channel.config?.igId || process.env.INSTAGRAM_IG_ID
  const token = channel.config?.pageToken || process.env.INSTAGRAM_PAGE_TOKEN

  const res = await fetch(`https://graph.facebook.com/v21.0/${igId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ recipient: { id: to }, message: { text: body } }),
  })
  if (!res.ok) throw new Error(`Instagram Graph ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data?.message_id || null
}

/* --------------------------------- Webchat -------------------------------- */
async function sendWebchat({ to, body }) {
  // O widget do site recebe pelo canal SSE/WebSocket — nada a chamar externamente.
  const { emit } = await import('./realtime.js')
  emit('webchat.outbound', { sessionId: to, body })
  return null
}

const SENDERS = {
  EVOLUTION: sendEvolution,
  WHATSAPP_CLOUD: sendWhatsAppCloud,
  INSTAGRAM_GRAPH: sendInstagram,
  WEBCHAT: sendWebchat,
}

/** Descobre o endereço externo do contato naquele canal e despacha. */
export async function sendToChannel({ channel, contact, body }) {
  const link = await prisma.contactChannel.findFirst({
    where: { channelId: channel.id, contactId: contact.id },
  })
  const to = link?.externalId
  if (!to) throw new Error('Contato sem identificador neste canal')

  const sender = SENDERS[channel.provider]
  if (!sender) throw new Error(`Provedor não suportado: ${channel.provider}`)

  try {
    return await sender({ channel, to, body })
  } catch (err) {
    console.error('[outbound] falha ao enviar:', err.message)
    return null
  }
}
