import { Router } from 'express'
import crypto from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { handleInbound } from '../lib/ticketService.js'
import { emit } from '../lib/realtime.js'

/**
 * Webhook oficial da WhatsApp Cloud API (Meta).
 * Callback URL: https://seu-dominio/webhooks/whatsapp
 * Campos assinados: messages
 */
export const whatsappWebhook = Router()

/* ------------------------- 1) verificação do handshake -------------------- */
whatsappWebhook.get('/', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge)
  }
  return res.sendStatus(403)
})

/* ------------------- 2) validação da assinatura X-Hub ---------------------- */
export function verifyMetaSignature(secretEnv) {
  return (req, res, next) => {
    const secret = process.env[secretEnv]
    if (!secret) return next() // ambiente de desenvolvimento
    const signature = req.get('x-hub-signature-256') || ''
    const expected =
      'sha256=' + crypto.createHmac('sha256', secret).update(req.rawBody || '').digest('hex')
    const ok =
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    if (!ok) return res.sendStatus(401)
    next()
  }
}

/* ------------------------------ 3) recepção ------------------------------- */
function parseMessage(msg) {
  switch (msg.type) {
    case 'text':     return { kind: 'TEXT', body: msg.text.body }
    case 'button':   return { kind: 'TEXT', body: msg.button.text }
    case 'interactive':
      return {
        kind: 'TEXT',
        body: msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '',
      }
    case 'image':    return { kind: 'IMAGE', body: msg.image.caption || 'Imagem', mediaMime: msg.image.mime_type, mediaUrl: msg.image.id }
    case 'document': return { kind: 'FILE', body: msg.document.filename || 'Documento', mediaName: msg.document.filename, mediaMime: msg.document.mime_type, mediaUrl: msg.document.id }
    case 'audio':    return { kind: 'AUDIO', body: 'Mensagem de voz', mediaMime: msg.audio.mime_type, mediaUrl: msg.audio.id }
    case 'location': return { kind: 'LOCATION', body: `${msg.location.latitude},${msg.location.longitude}` }
    default:         return { kind: 'TEXT', body: `[${msg.type} não suportado]` }
  }
}

whatsappWebhook.post('/', verifyMetaSignature('WHATSAPP_APP_SECRET'), async (req, res) => {
  res.sendStatus(200) // Meta exige 200 em até 20s

  try {
    const entries = req.body?.entry || []
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const value = change.value || {}
        const phoneNumberId = value.metadata?.phone_number_id

        const channel =
          (await prisma.channel.findFirst({
            where: { provider: 'WHATSAPP_CLOUD', config: { path: ['phoneNumberId'], equals: phoneNumberId } },
          })) ||
          (await prisma.channel.findFirst({ where: { provider: 'WHATSAPP_CLOUD', active: true } }))
        if (!channel) continue

        /* Recibos de entrega/leitura */
        for (const st of value.statuses || []) {
          const map = { sent: 'SENT', delivered: 'DELIVERED', read: 'READ', failed: 'FAILED' }
          await prisma.message.updateMany({
            where: { externalId: st.id },
            data: { status: map[st.status] || 'SENT' },
          })
          emit('message.status', { externalId: st.id, status: map[st.status] })
        }

        /* Mensagens recebidas */
        for (const msg of value.messages || []) {
          const profile = value.contacts?.find((c) => c.wa_id === msg.from)
          await handleInbound({
            channel,
            externalId: msg.from,
            phone: `+${msg.from}`,
            name: profile?.profile?.name || `+${msg.from}`,
            message: { ...parseMessage(msg), externalId: msg.id, raw: msg },
          })
        }
      }
    }
  } catch (err) {
    console.error('[whatsapp-cloud] erro no webhook:', err)
  }
})
