#!/usr/bin/env node
// Lê o perfil do próprio usuário no X (bio, link, fixado, métricas) e os últimos posts, para revisão.
// Usa as mesmas credenciais OAuth 1.0a do publish.mjs. Custo: algumas leituras (~US$ 0,01).
import { createHmac, randomBytes } from 'node:crypto'
const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
function auth(method, url, query) {
  const o = { oauth_consumer_key: X_API_KEY, oauth_nonce: randomBytes(16).toString('hex'), oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)), oauth_token: X_ACCESS_TOKEN, oauth_version: '1.0' }
  const all = { ...o, ...query }
  const params = Object.keys(all).sort().map((k) => `${enc(k)}=${enc(all[k])}`).join('&')
  o.oauth_signature = createHmac('sha1', `${enc(X_API_SECRET)}&${enc(X_ACCESS_SECRET)}`).update([method, enc(url), enc(params)].join('&')).digest('base64')
  return 'OAuth ' + Object.keys(o).sort().map((k) => `${enc(k)}="${enc(o[k])}"`).join(', ')
}
async function get(url, query) {
  const qs = new URLSearchParams(query).toString()
  const res = await fetch(`${url}?${qs}`, { headers: { Authorization: auth('GET', url, query) } })
  const t = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status} ${t.slice(0, 300)}`)
  return JSON.parse(t)
}
const me = await get('https://api.x.com/2/users/me', {
  'user.fields': 'description,url,entities,pinned_tweet_id,public_metrics,profile_image_url,created_at,verified,location,name,username',
  expansions: 'pinned_tweet_id', 'tweet.fields': 'text,created_at,public_metrics',
})
const tl = await get(`https://api.x.com/2/users/${me.data.id}/tweets`, { max_results: '10', 'tweet.fields': 'created_at,public_metrics' })
console.log('===X-PROFILE-BEGIN===')
console.log(JSON.stringify({ me, recent: tl.data || [] }, null, 1))
console.log('===X-PROFILE-END===')
