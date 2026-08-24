/**
 * Barramento de eventos em tempo real.
 * Aqui está com SSE puro para não amarrar a stack; troque por Socket.IO/Pusher
 * mantendo a mesma assinatura `emit(event, payload)`.
 */
const clients = new Set()

export function sseHandler(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  })
  res.write('retry: 3000\n\n')
  clients.add(res)
  req.on('close', () => clients.delete(res))
}

export function emit(event, payload) {
  const chunk = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`
  for (const res of clients) {
    try { res.write(chunk) } catch { clients.delete(res) }
  }
}
