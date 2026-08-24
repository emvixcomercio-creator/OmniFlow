import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { handleInbound } from '../lib/ticketService.js'
import { emit } from '../lib/realtime.js'

/**
 * Webhook da Evolution API (WhatsApp não-oficial / Baileys).
 * Configure no painel da Evolution:
 *   POST https://seu-dominio/webhooks/evolution
 *   eventos: MESSAGES_UPSERT, MESSAGES_UPDATE, CONNECTION_UPDATE
 */
export const evolutionWebhook = Router()

/* Mapeia o formato Baileys para o payload interno. */
function parseMessage(msg) {
  const m = msg.message || {}
  if (m.conversation) return { kind: 'TEXT', body: m.conversation }
  if (m.extendedTextMessage) return { kind: 'TEXT', body: m.extendedTextMessage.text }
  if (m.imageMessage) {
    return { kind: 'IMAGE', body: m.imageMessage.caption || 'Imagem', mediaMime: m.imageMessage.mimetype, mediaSize: m.imageMessage.fileLength }
  }
  if (m.documentMessage) {
    return { kind: 'FILE', body: m.documentMessage.fileName || 'Documento', mediaName: m.documentMessage.fileName, mediaMime: m.documentMessage.mimetype, mediaSize: m.documentMessage.fileLength }
  }
  if (m.audioMessage) return { kind: 'AUDIO', body: 'Mensagem de voz', mediaMime: m.audioMessage.mimetype }
  if (m.locationMessage) {
    const { degreesLatitude: lat, degreesLongitude: lng } = m.locationMessage
    return { kind: 'LOCATION', body: `${lat},${lng}` }
  }
  return { kind: 'TEXT', body: '[mensagem não suportada]' }
}

evolutionWebhook.post('/', async (req, res) => {
  // Responda rápido: a Evolution reenvia se demorar.
  res.sendStatus(200)

  try {
    const token = req.headers['x-webhook-token'] || req.query.token
    if (process.env.EVOLUTION_WEBHOOK_TOKEN && token !== process.env.EVOLUTION_WEBHOOK_TOKEN) {
      console.warn('[evolution] token inválido')
      return
    }

    const { event, instance, data } = req.body || {}

    /* Recibos de entrega/leitura */
    if (event === 'messages.update' || event === 'MESSAGES_UPDATE') {
      const list = Array.isArray(data) ? data : [data]
      for (const upd of list) {
        const externalId = upd?.key?.id
        const ack = Number(upd?.update?.status ?? upd?.status ?? 0)
        if (!externalId) continue
        const status = ack >= 4 ? 'READ' : ack >= 3 ? 'DELIVERED' : 'SENT'
        await prisma.message.updateMany({ where: { externalId }, data: { status } })
        emit('message.status', { externalId, status })
      }
      return
    }

    if (event !== 'messages.upsert' && event !== 'MESSAGES_UPSERT') return

    const messages = Array.isArray(data?.messages) ? data.messages : [data]
    const channel = await prisma.channel.findFirst({
      where: { provider: 'EVOLUTION', config: { path: ['instance'], equals: instance } },
    }) || await prisma.channel.findFirst({ where: { provider: 'EVOLUTION', active: true } })
    if (!channel) return console.warn('[evolution] canal não cadastrado:', instance)

    for (const msg of messages) {
      if (msg?.key?.fromMe) continue                       // ignora eco das próprias mensagens
      const jid = msg?.key?.remoteJid || ''
      if (jid.endsWith('@g.us')) continue                  // ignora grupos
      const waId = jid.split('@')[0]

      const parsed = parseMessage(msg)
      await handleInbound({
        channel,
        externalId: waId,
        phone: `+${waId}`,
        name: msg.pushName || `+${waId}`,
        message: { ...parsed, externalId: msg.key.id, raw: msg },
      })
    }
  } catch (err) {
    console.error('[evolution] erro no webhook:', err)
  }
})
