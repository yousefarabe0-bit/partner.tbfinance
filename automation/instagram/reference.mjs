#!/usr/bin/env node
// Lê os posts públicos recentes de perfis comerciais de referência (ex.: @g4educacao)
// pela API oficial (Business Discovery), para estudar o estilo dos carrosséis.
// Uso: REF_HANDLES=g4educacao,outro node reference.mjs
// Saída: JSON entre ===REFERENCE-BEGIN=== e ===REFERENCE-END===. Não imprime tokens.
const API = `https://graph.facebook.com/${process.env.GRAPH_API_VERSION || 'v23.0'}`
const token = process.env.IG_PESSOAL_TOKEN
if (!token) throw new Error('IG_PESSOAL_TOKEN não definido')

async function get(endpoint, params = {}) {
  const url = new URL(`${API}/${endpoint}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
  url.searchParams.set('access_token', token)
  const res = await fetch(url)
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) throw new Error(data.error?.message || res.statusText)
  return data
}

let userId = process.env.IG_PESSOAL_USER_ID
if (!userId) {
  const pages = await get('me/accounts', { fields: 'instagram_business_account{id,username}', limit: 100 })
  userId = pages.data.find((p) => p.instagram_business_account?.username === 'yousefameroficial')?.instagram_business_account?.id
}
const handles = (process.env.REF_HANDLES || 'g4educacao').split(',').map((h) => h.trim().replace(/^@/, '')).filter(Boolean)
const limit = Number(process.env.REF_LIMIT || 25)
const out = {}
for (const h of handles) {
  try {
    const fields = `business_discovery.username(${h}){username,followers_count,media.limit(${limit}){id,caption,media_type,permalink,timestamp,like_count,comments_count,media_url,children{media_type,media_url}}}`
    const data = await get(userId, { fields })
    out[h] = data.business_discovery
    console.error(`@${h}: ${data.business_discovery?.media?.data?.length || 0} posts`)
  } catch (e) {
    out[h] = { error: e.message }
    console.error(`@${h}: ERRO ${e.message}`)
  }
}
console.log('===REFERENCE-BEGIN===')
console.log(JSON.stringify(out))
console.log('===REFERENCE-END===')
