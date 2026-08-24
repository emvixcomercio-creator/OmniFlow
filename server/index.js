import express from 'express'
import { evolutionWebhook } from './webhooks/evolution.js'
import { whatsappWebhook } from './webhooks/whatsappCloud.js'
import { instagramWebhook } from './webhooks/instagram.js'
import { webchatWebhook } from './webhooks/webchat.js'
import { api } from './routes/api.js'
import { connect } from './routes/connect.js'
import { sseHandler } from './lib/realtime.js'

const app = express()

/* Guarda o corpo cru — necessário para validar a assinatura X-Hub-Signature-256. */
app.use(express.json({
  limit: '2mb',
  verify: (req, _res, buf) => { req.rawBody = buf.toString('utf8') },
}))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.APP_URL || '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

/* ------------------------------- webhooks --------------------------------- */
app.use('/webhooks/evolution', evolutionWebhook)   // Evolution API (Baileys)
app.use('/webhooks/whatsapp', whatsappWebhook)     // WhatsApp Cloud API (Meta)
app.use('/webhooks/instagram', instagramWebhook)   // Instagram Graph API
app.use('/webhooks/webchat', webchatWebhook)       // widget do site

/* --------------------------------- API ------------------------------------ */
app.use('/api', api)
app.use('/api/connect', connect)   // conexão de canais pelo painel

/* ------------------------- eventos em tempo real -------------------------- */
app.get('/events', sseHandler)

app.get('/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }))

app.use((err, _req, res, _next) => {
  console.error('[api] erro não tratado:', err)
  res.status(500).json({ error: err.message })
})

const port = process.env.PORT || 3333
app.listen(port, () => {
  console.log(`OmniFlow API on http://localhost:${port}`)
  console.log(`  webhooks: /webhooks/{evolution,whatsapp,instagram,webchat}`)
})
