#!/usr/bin/env node
// Ações pontuais no próprio perfil do X: apagar posts (X_DELETE_IDS, separados por vírgula)
// e atualizar bio/link (X_BIO, X_URL; API v1.1 account/update_profile). Credenciais OAuth 1.0a.
import { createHmac, randomBytes } from 'node:crypto'
const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET, X_DELETE_IDS, X_BIO, X_URL } = process.env
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
function auth(method, url, extra = {}) {
  const o = { oauth_consumer_key: X_API_KEY, oauth_nonce: randomBytes(16).toString('hex'), oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)), oauth_token: X_ACCESS_TOKEN, oauth_version: '1.0' }
  const all = { ...o, ...extra }
  const params = Object.keys(all).sort().map((k) => `${enc(k)}=${enc(all[k])}`).join('&')
  o.oauth_signature = createHmac('sha1', `${enc(X_API_SECRET)}&${enc(X_ACCESS_SECRET)}`).update([method, enc(url), enc(params)].join('&')).digest('base64')
  return 'OAuth ' + Object.keys(o).sort().map((k) => `${enc(k)}="${enc(o[k])}"`).join(', ')
}
let failed = 0
for (const id of (X_DELETE_IDS || '').split(',').map((s) => s.trim()).filter(Boolean)) {
  const url = `https://api.x.com/2/tweets/${id}`
  const res = await fetch(url, { method: 'DELETE', headers: { Authorization: auth('DELETE', url) } })
  const t = await res.text()
  console.log(`apagar ${id}: HTTP ${res.status} ${t.slice(0, 200)}`)
  if (!res.ok) failed++
}
if (X_BIO || X_URL) {
  const url = 'https://api.x.com/1.1/account/update_profile.json'
  const form = {}
  if (X_BIO) form.description = X_BIO
  if (X_URL) form.url = X_URL
  const res = await fetch(url, { method: 'POST', headers: { Authorization: auth('POST', url, form), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: Object.entries(form).map(([k, v]) => `${enc(k)}=${enc(v)}`).join('&') })
  const t = await res.text()
  console.log(`perfil: HTTP ${res.status} ${t.slice(0, 300)}`)
  if (!res.ok) failed++
}
if (failed) process.exitCode = 1
