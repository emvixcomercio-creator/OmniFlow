import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { handleInbound } from '../lib/ticketService.js'
import { verifyMetaSignature } from './whatsappCloud.js'

/**
 * Webhook do Instagram Messaging (Graph API).
 * Callback URL: https://seu-dominio/webhooks/instagram
 * Campos assinados: messages, messaging_postbacks, message_reactions
 * Requer a conta comercial vinculada a uma Página do Facebook.
 */
export const instagramWebhook = Router()

instagramWebhook.get('/', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  if (mode === 'subscribe' && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
    return res.status(200).send(req.query['hub.challenge'])
  }
  return res.sendStatus(403)
})

/** Busca o @ do remetente para exibir no painel. */
async function fetchProfile(igsid) {
  try {
    const token = process.env.INSTAGRAM_PAGE_TOKEN
    const url = `https://graph.facebook.com/v21.0/${igsid}?fields=name,username,profile_pic&access_token=${token}`
    const res = await fetch(url)
    if (!res.ok) return {}
    return await res.json()
  } catch {
    return {}
  }
}

function parseMessaging(messaging) {
  const msg = messaging.message || {}

  if (msg.attachments?.length) {
    const att = msg.attachments[0]
    const kindMap = { image: 'IMAGE', video: 'VIDEO', audio: 'AUDIO', file: 'FILE', share: 'TEXT', story_mention: 'IMAGE' }
    return {
      kind: kindMap[att.type] || 'FILE',
      body: att.type === 'story_mention' ? 'Mencionou você em um story' : msg.text || att.type,
      mediaUrl: att.payload?.url || null,
    }
  }

  if (messaging.postback) return { kind: 'TEXT', body: messaging.postback.title || messaging.postback.payload }
  if (msg.reply_to?.story) return { kind: 'TEXT', body: `[resposta a story] ${msg.text || ''}` }
  return { kind: 'TEXT', body: msg.text || '' }
}

instagramWebhook.post('/', verifyMetaSignature('INSTAGRAM_APP_SECRET'), async (req, res) => {
  res.sendStatus(200)

  try {
    if (req.body?.object !== 'instagram') return

    for (const entry of req.body.entry || []) {
      const igId = entry.id

      const channel =
        (await prisma.channel.findFirst({
          where: { provider: 'INSTAGRAM_GRAPH', identifier: String(igId) },
        })) ||
        (await prisma.channel.findFirst({ where: { provider: 'INSTAGRAM_GRAPH', active: true } }))
      if (!channel) continue

      for (const messaging of entry.messaging || []) {
        // ignora o eco das mensagens enviadas pela própria página
        if (messaging.message?.is_echo) continue
        if (!messaging.message && !messaging.postback) continue

        const igsid = messaging.sender?.id
        if (!igsid) continue

        const profile = await fetchProfile(igsid)
        await handleInbound({
          channel,
          externalId: igsid,
          name: profile.name || profile.username || 'Contato do Instagram',
          handle: profile.username ? `@${profile.username}` : null,
          message: {
            ...parseMessaging(messaging),
            externalId: messaging.message?.mid || null,
            raw: messaging,
          },
        })
      }
    }
  } catch (err) {
    console.error('[instagram] erro no webhook:', err)
  }
})
