import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { handleInbound } from '../lib/ticketService.js'

/**
 * Endpoint do widget de chat do site.
 * O widget envia { sessionId, name, email, text } e escuta /events (SSE).
 */
export const webchatWebhook = Router()

webchatWebhook.post('/', async (req, res) => {
  try {
    const { sessionId, name, email, text, origin } = req.body || {}
    if (!sessionId || !text) return res.status(400).json({ error: 'sessionId e text são obrigatórios' })

    const channel = await prisma.channel.findFirst({ where: { provider: 'WEBCHAT', active: true } })
    if (!channel) return res.status(404).json({ error: 'Canal de webchat não configurado' })

    const ticket = await handleInbound({
      channel,
      externalId: sessionId,
      name: name || 'Visitante do site',
      message: { kind: 'TEXT', body: text, raw: { origin, email } },
    })

    res.json({ ok: true, ticketId: ticket.id, protocol: ticket.protocol })
  } catch (err) {
    console.error('[webchat] erro:', err)
    res.status(500).json({ error: 'Falha ao processar mensagem' })
  }
})
