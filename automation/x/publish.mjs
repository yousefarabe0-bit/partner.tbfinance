#!/usr/bin/env node
// Publica no X (perfil pessoal do Yousef) os posts vencidos de automation/x/posts.json.
// Tipos: "post" (um texto) e "thread" (lista de textos, publicados em sequência como respostas).
// Autenticação OAuth 1.0a de usuário: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET.
// Não imprime credenciais.
import { readFile, writeFile } from 'node:fs/promises'
import { createHmac, randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const POSTS = process.env.X_POSTS_FILE || path.join(DIR, 'posts.json')
const STATE = process.env.X_STATE_FILE || path.join(DIR, 'published.json')
const API = 'https://api.x.com/2/tweets'
const DRY = process.env.X_DRY_RUN === 'true' || process.argv.includes('--dry-run')
const VALIDATE = process.argv.includes('--validate')
const MAX_ATTEMPTS = 3
const MAX_LEN = 280
const log = (...a) => console.log(new Date().toISOString(), ...a)
const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env

// O X conta link como 23 caracteres e alguns símbolos como 2; aqui contamos de forma conservadora.
const xlen = (t) => [...t.replace(/https?:\/\/\S+/g, 'x'.repeat(23))].reduce((n, c) => n + (c.codePointAt(0) > 0x10ff ? 2 : 1), 0)

const posts = JSON.parse(await readFile(POSTS, 'utf8'))
const state = JSON.parse(await readFile(STATE, 'utf8').catch(() => '{}'))
const ids = new Set()
for (const p of posts) {
  if (!p.id || ids.has(p.id)) throw new Error(`id repetido ou vazio: ${p.id}`)
  ids.add(p.id)
  if (isNaN(new Date(p.publishAt))) throw new Error(`${p.id}: publishAt inválido`)
  const parts = p.type === 'thread' ? p.texts : p.type === 'post' ? [p.text] : null
  if (!parts || !parts.length) throw new Error(`${p.id}: type deve ser post (text) ou thread (texts)`)
  parts.forEach((t, i) => { if (!t || xlen(t) > MAX_LEN) throw new Error(`${p.id}[${i}]: vazio ou com mais de ${MAX_LEN} caracteres (${t && xlen(t)})`) })
}
log(`x/posts.json OK (${posts.length} post(s))`)
if (VALIDATE) process.exit(0)

const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
function oauthHeader(method, url) {
  const o = {
    oauth_consumer_key: X_API_KEY, oauth_nonce: randomBytes(16).toString('hex'), oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)), oauth_token: X_ACCESS_TOKEN, oauth_version: '1.0',
  }
  const params = Object.keys(o).sort().map((k) => `${enc(k)}=${enc(o[k])}`).join('&')
  const base = [method, enc(url), enc(params)].join('&')
  o.oauth_signature = createHmac('sha1', `${enc(X_API_SECRET)}&${enc(X_ACCESS_SECRET)}`).update(base).digest('base64')
  return 'OAuth ' + Object.keys(o).sort().map((k) => `${enc(k)}="${enc(o[k])}"`).join(', ')
}
async function tweet(text, replyTo) {
  const body = { text, ...(replyTo ? { reply: { in_reply_to_tweet_id: replyTo } } : {}) }
  const res = await fetch(API, { method: 'POST', headers: { Authorization: oauthHeader('POST', API), 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const t = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status} ${t.slice(0, 300)}`)
  return JSON.parse(t).data.id
}

const now = process.argv.find((a) => a.startsWith('--now='))?.slice(6)
const due = posts.filter((p) => new Date(p.publishAt) <= new Date(now || Date.now()))
  .filter((p) => !state[p.id]?.url && (state[p.id]?.attempts || 0) < MAX_ATTEMPTS)
log(`${due.length} post(s) vencido(s) para publicar.`)
if (!due.length) process.exit(0)
const hasCreds = X_API_KEY && X_API_SECRET && X_ACCESS_TOKEN && X_ACCESS_SECRET
if (!hasCreds && !DRY) { log('Credenciais do X não definidas: nada publicado.'); process.exit(0) }

let failed = 0
for (const p of due) {
  const parts = p.type === 'thread' ? p.texts : [p.text]
  try {
    if (DRY) { log(`[dry-run] ${p.id}: ${parts.length} parte(s)`); continue }
    // Retoma um fio que parou no meio, sem repetir as partes já publicadas.
    const done = state[p.id]?.ids || []
    let prev = done.at(-1)
    for (let i = done.length; i < parts.length; i++) {
      prev = await tweet(parts[i], prev)
      done.push(prev)
      state[p.id] = { ...(state[p.id] || {}), ids: done }
      await writeFile(STATE, JSON.stringify(state, null, 2) + '\n')
    }
    state[p.id] = { ids: done, url: `https://x.com/i/status/${done[0]}`, publishedAt: new Date().toISOString() }
    log(`✅ ${p.id}: ${state[p.id].url}`)
  } catch (e) {
    failed++
    state[p.id] = { ...(state[p.id] || {}), attempts: (state[p.id]?.attempts || 0) + 1, lastError: e.message, lastAttemptAt: new Date().toISOString() }
    log(`❌ ${p.id}: ${e.message}`)
  }
  if (!DRY) await writeFile(STATE, JSON.stringify(state, null, 2) + '\n')
}
if (failed) process.exitCode = 1
