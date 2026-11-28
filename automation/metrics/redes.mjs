#!/usr/bin/env node
// Métricas dos posts publicados pela automação nas 4 redes (API oficial). Não imprime tokens.
// Lê os published.json e consulta cada rede. METRICS_SINCE=AAAA-MM-DD (padrão: 7 dias).
import { readFile } from 'node:fs/promises'
import { createHmac, randomBytes } from 'node:crypto'

const SINCE = new Date(process.env.METRICS_SINCE || Date.now() - 7 * 864e5)
const load = async (n) => JSON.parse(await readFile(`automation/${n}/published.json`, 'utf8'))
const recent = (o) => Object.entries(o).filter(([, v]) => v && v.publishedAt && new Date(v.publishedAt) >= SINCE)
const out = { since: SINCE.toISOString(), instagram: [], x: [], threads: [], linkedin: [] }

// Instagram: curtidas e comentários (o token não tem permissão de insights)
const IG = { pessoal: process.env.IG_PESSOAL_TOKEN, empresa: process.env.IG_EMPRESA_TOKEN }
for (const [k, v] of recent(await load('instagram'))) {
  const acc = k.split(':')[1]; const token = IG[acc]
  if (!token || !v.mediaId) continue
  try {
    const r = await (await fetch(`https://graph.facebook.com/v23.0/${v.mediaId}?fields=like_count,comments_count,media_product_type&access_token=${token}`)).json()
    out.instagram.push({ id: k, likes: r.like_count, comments: r.comments_count, type: r.media_product_type, error: r.error?.message })
  } catch (e) { out.instagram.push({ id: k, error: e.message }) }
}

// X: public_metrics (impressões, curtidas, reposts, respostas)
const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
function xAuth(method, base, query) {
  const o = { oauth_consumer_key: X_API_KEY, oauth_nonce: randomBytes(16).toString('hex'), oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)), oauth_token: X_ACCESS_TOKEN, oauth_version: '1.0' }
  const all = { ...o, ...query }
  const params = Object.keys(all).sort().map((k) => `${enc(k)}=${enc(all[k])}`).join('&')
  o.oauth_signature = createHmac('sha1', `${enc(X_API_SECRET)}&${enc(X_ACCESS_SECRET)}`).update([method, enc(base), enc(params)].join('&')).digest('base64')
  return 'OAuth ' + Object.keys(o).sort().map((k) => `${enc(k)}="${enc(o[k])}"`).join(', ')
}
if (X_API_KEY) {
  const xs = recent(await load('x')).map(([k, v]) => ({ k, id: (v.ids || [])[0] })).filter((t) => t.id)
  for (let i = 0; i < xs.length; i += 100) {
    const chunk = xs.slice(i, i + 100)
    const base = 'https://api.x.com/2/tweets'
    const query = { ids: chunk.map((t) => t.id).join(','), 'tweet.fields': 'public_metrics' }
    const url = `${base}?${new URLSearchParams(query)}`
    const r = await (await fetch(url, { headers: { Authorization: xAuth('GET', base, query) } })).json()
    if (!r.data) { out.x.push({ error: JSON.stringify(r).slice(0, 300) }); continue }
    for (const t of r.data) out.x.push({ id: chunk.find((c) => c.id === t.id)?.k, ...t.public_metrics })
  }
}

// Threads: insights por post
const TT = process.env.THREADS_TOKEN
if (TT) for (const [k, v] of recent(await load('threads'))) {
  const id = (v.ids || [])[0]; if (!id) continue
  const r = await (await fetch(`https://graph.threads.net/v1.0/${id}/insights?metric=views,likes,replies,reposts,quotes&access_token=${TT}`)).json()
  const m = { id: k }
  for (const d of r.data || []) m[d.name] = d.values?.[0]?.value ?? d.total_value?.value
  if (r.error) m.error = r.error.message
  out.threads.push(m)
}

// LinkedIn: curtidas e comentários (socialActions)
const LT = process.env.LINKEDIN_TOKEN
if (LT) for (const [k, v] of recent(await load('linkedin'))) {
  const urn = v.urn || (v.url || '').match(/urn:li:[a-zA-Z]+:\d+/)?.[0]; if (!urn) continue
  let res, d = new Date()
  for (let t = 0; t < 12; t++) {
    const ver = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    res = await fetch(`https://api.linkedin.com/rest/socialActions/${encodeURIComponent(urn)}`, {
      headers: { Authorization: `Bearer ${LT}`, 'LinkedIn-Version': ver, 'X-Restli-Protocol-Version': '2.0.0' } })
    if (res.status !== 426) break
    d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1))
  }
  const r = await res.json().catch(() => ({}))
  out.linkedin.push({ id: k, likes: r.likesSummary?.totalLikes, comments: r.commentsSummary?.aggregatedTotalComments, error: res.ok ? undefined : `HTTP ${res.status} ${JSON.stringify(r).slice(0, 200)}` })
}

console.log('===REDES-BEGIN===')
console.log(JSON.stringify(out))
console.log('===REDES-END===')
