/**
 * Conexão de contas pelas APIs oficiais da Meta, sem o cliente sair do sistema.
 *
 * WhatsApp  → Embedded Signup: o cliente autoriza numa janela da Meta e volta
 *             com um `code`; trocamos por um token permanente da WABA dele.
 * Instagram → Facebook Login for Business: OAuth normal, depois assinamos o
 *             webhook na Página vinculada ao perfil.
 *
 * Pré-requisito do lado de quem vende: o app precisa estar como Tech Provider,
 * com verificação de negócio concluída e as permissões aprovadas em App Review.
 */
const GRAPH = 'https://graph.facebook.com/v21.0'

async function graph(path, { method = 'GET', token, body, params } = {}) {
  const url = new URL(`${GRAPH}${path}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error?.message || `Graph ${res.status}`)
  return data
}

/* ------------------------ WhatsApp — Embedded Signup ---------------------- */

/** Troca o `code` devolvido pela janela da Meta por um token do cliente. */
export async function exchangeWhatsAppCode(code) {
  const { access_token } = await graph('/oauth/access_token', {
    params: {
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      code,
    },
  })
  return access_token
}

/** Descobre a conta comercial e os números que o cliente autorizou. */
export async function readWhatsAppAssets(token) {
  const debug = await graph('/debug_token', {
    params: { input_token: token, access_token: `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}` },
  })
  const wabaId = debug?.data?.granular_scopes
    ?.find((s) => s.scope === 'whatsapp_business_management')
    ?.target_ids?.[0]
  if (!wabaId) throw new Error('Nenhuma conta do WhatsApp foi autorizada')

  const numbers = await graph(`/${wabaId}/phone_numbers`, { token })
  return { wabaId, numbers: numbers.data || [] }
}

/** Assina o app nos webhooks da conta e registra o número para envio. */
export async function activateWhatsAppNumber({ wabaId, phoneNumberId, token, pin = '000000' }) {
  await graph(`/${wabaId}/subscribed_apps`, { method: 'POST', token })
  await graph(`/${phoneNumberId}/register`, {
    method: 'POST',
    token,
    body: { messaging_product: 'whatsapp', pin },
  })
}

/* --------------------- Instagram — Facebook Login for Business ------------- */

const IG_SCOPES = [
  'instagram_basic',
  'instagram_manage_messages',
  'pages_show_list',
  'pages_manage_metadata',
  'business_management',
].join(',')

/** URL que o botão "Conectar Instagram" abre. */
export function instagramAuthUrl(state) {
  const url = new URL('https://www.facebook.com/v21.0/dialog/oauth')
  url.searchParams.set('client_id', process.env.META_APP_ID)
  url.searchParams.set('redirect_uri', `${process.env.PUBLIC_URL}/api/connect/instagram/callback`)
  url.searchParams.set('scope', IG_SCOPES)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('state', state)
  return url.toString()
}

/** Troca o code por um token de longa duração e lista os perfis do cliente. */
export async function exchangeInstagramCode(code) {
  const short = await graph('/oauth/access_token', {
    params: {
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri: `${process.env.PUBLIC_URL}/api/connect/instagram/callback`,
      code,
    },
  })

  const long = await graph('/oauth/access_token', {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      fb_exchange_token: short.access_token,
    },
  })

  const pages = await graph('/me/accounts', {
    token: long.access_token,
    params: { fields: 'id,name,access_token,instagram_business_account{id,username}' },
  })

  return {
    userToken: long.access_token,
    profiles: (pages.data || [])
      .filter((p) => p.instagram_business_account)
      .map((p) => ({
        pageId: p.id,
        pageName: p.name,
        pageToken: p.access_token,
        igId: p.instagram_business_account.id,
        username: p.instagram_business_account.username,
      })),
  }
}

/** Liga o webhook de mensagens na Página escolhida. */
export async function subscribeInstagramPage({ pageId, pageToken }) {
  await graph(`/${pageId}/subscribed_apps`, {
    method: 'POST',
    token: pageToken,
    params: { subscribed_fields: 'messages,messaging_postbacks,message_reactions' },
  })
}
