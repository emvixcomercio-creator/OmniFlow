import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { emit } from '../lib/realtime.js'
import {
  exchangeWhatsAppCode, readWhatsAppAssets, activateWhatsAppNumber,
  instagramAuthUrl, exchangeInstagramCode, subscribeInstagramPage,
} from '../lib/meta.js'

/**
 * Conexão de canais feita pelo próprio painel — o cliente nunca abre o
 * console de desenvolvedor da Meta nem cola token à mão.
 */
export const connect = Router()

const ready = () => Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET)

connect.get('/status', (_req, res) => {
  res.json({
    metaConfigured: ready(),
    whatsappConfigId: process.env.META_WHATSAPP_CONFIG_ID || null,
    appId: process.env.META_APP_ID || null,
    evolutionConfigured: Boolean(process.env.EVOLUTION_API_URL),
  })
})

/* ------------------------------- WhatsApp --------------------------------- */
/** Recebe o `code` da janela de Embedded Signup e conclui a conexão. */
connect.post('/whatsapp', async (req, res) => {
  if (!ready()) return res.status(503).json({ error: 'App da Meta não configurado no servidor' })
  try {
    const { code } = req.body
    const token = await exchangeWhatsAppCode(code)
    const { wabaId, numbers } = await readWhatsAppAssets(token)

    const created = []
    for (const n of numbers) {
      await activateWhatsAppNumber({ wabaId, phoneNumberId: n.id, token })
      const channel = await prisma.channel.upsert({
        where: { provider_identifier: { provider: 'WHATSAPP_CLOUD', identifier: n.display_phone_number } },
        update: { active: true, config: { wabaId, phoneNumberId: n.id, token } },
        create: {
          name: n.verified_name || n.display_phone_number,
          type: 'WHATSAPP',
          provider: 'WHATSAPP_CLOUD',
          identifier: n.display_phone_number,
          config: { wabaId, phoneNumberId: n.id, token },
        },
      })
      created.push(channel)
    }

    emit('channel.connected', created)
    res.json({ ok: true, channels: created })
  } catch (err) {
    console.error('[connect/whatsapp]', err)
    res.status(400).json({ error: err.message })
  }
})

/* ------------------------------- Instagram -------------------------------- */
connect.get('/instagram/start', (req, res) => {
  if (!ready()) return res.status(503).json({ error: 'App da Meta não configurado no servidor' })
  res.json({ url: instagramAuthUrl(req.query.state || 'omniflow') })
})

connect.get('/instagram/callback', async (req, res) => {
  try {
    const { profiles } = await exchangeInstagramCode(req.query.code)
    for (const p of profiles) {
      await subscribeInstagramPage(p)
      await prisma.channel.upsert({
        where: { provider_identifier: { provider: 'INSTAGRAM_GRAPH', identifier: p.igId } },
        update: { active: true, config: { igId: p.igId, pageId: p.pageId, pageToken: p.pageToken } },
        create: {
          name: `@${p.username}`,
          type: 'INSTAGRAM',
          provider: 'INSTAGRAM_GRAPH',
          identifier: p.igId,
          config: { igId: p.igId, pageId: p.pageId, pageToken: p.pageToken },
        },
      })
    }
    emit('channel.connected', profiles)
    // fecha a janela e avisa o painel que abriu
    res.send('<script>window.opener?.postMessage({omniflow:"instagram-connected"},"*");window.close()</script>')
  } catch (err) {
    console.error('[connect/instagram]', err)
    res.status(400).send(`Falha ao conectar: ${err.message}`)
  }
})

/* ------------------- Evolution — QR Code dentro do painel ------------------ */
connect.post('/evolution', async (req, res) => {
  try {
    const { instanceName } = req.body
    const base = process.env.EVOLUTION_API_URL
    const r = await fetch(`${base}/instance/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: process.env.EVOLUTION_API_KEY },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        webhook: `${process.env.PUBLIC_URL}/webhooks/evolution`,
        webhookByEvents: false,
        events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE'],
      }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data?.message || 'Falha ao criar instância')
    // devolve o QR em base64 para o painel desenhar na tela
    res.json({ instanceName, qrcode: data?.qrcode?.base64 || null })
  } catch (err) {
    console.error('[connect/evolution]', err)
    res.status(400).json({ error: err.message })
  }
})

connect.get('/evolution/:instance/state', async (req, res) => {
  try {
    const r = await fetch(`${process.env.EVOLUTION_API_URL}/instance/connectionState/${req.params.instance}`, {
      headers: { apikey: process.env.EVOLUTION_API_KEY },
    })
    res.json(await r.json())
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})
