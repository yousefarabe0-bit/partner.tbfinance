#!/usr/bin/env node
// Publica no Threads (perfil do Yousef) os posts vencidos de automation/threads/posts.json.
// API oficial do Threads (graph.threads.net): cria o contêiner e depois publica.
// Tipos: "post" (text) e "thread" (texts: publicados em sequência, cada um respondendo ao anterior).
// Env: THREADS_TOKEN (escopos threads_basic e threads_content_publish), THREADS_DRY_RUN. Não imprime o token.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const POSTS = process.env.THREADS_POSTS_FILE || path.join(DIR, 'posts.json')
const STATE = process.env.THREADS_STATE_FILE || path.join(DIR, 'published.json')
const API = 'https://graph.threads.net/v1.0'
const TOKEN = process.env.THREADS_TOKEN
const DRY = process.env.THREADS_DRY_RUN === 'true' || process.argv.includes('--dry-run')
const VALIDATE = process.argv.includes('--validate')
const MAX_ATTEMPTS = 3
const MAX_LEN = 500
const log = (...a) => console.log(new Date().toISOString(), ...a)

const posts = JSON.parse(await readFile(POSTS, 'utf8'))
const state = JSON.parse(await readFile(STATE, 'utf8').catch(() => '{}'))
const ids = new Set()
for (const p of posts) {
  if (!p.id || ids.has(p.id)) throw new Error(`id repetido ou vazio: ${p.id}`)
  ids.add(p.id)
  if (isNaN(new Date(p.publishAt))) throw new Error(`${p.id}: publishAt inválido`)
  const parts = p.type === 'thread' ? p.texts : p.type === 'post' ? [p.text] : null
  if (!parts || !parts.length) throw new Error(`${p.id}: type deve ser post (text) ou thread (texts)`)
  parts.forEach((t, i) => { if (!t || [...t].length > MAX_LEN) throw new Error(`${p.id}[${i}]: vazio ou com mais de ${MAX_LEN} caracteres`) })
}
log(`threads/posts.json OK (${posts.length} post(s))`)
if (VALIDATE) process.exit(0)

async function call(method, endpoint, params) {
  const url = new URL(`${API}/${endpoint}`)
  for (const [k, v] of Object.entries(params || {})) if (v !== undefined) url.searchParams.set(k, String(v))
  url.searchParams.set('access_token', TOKEN)
  const res = await fetch(url, { method })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) throw new Error(`${endpoint}: ${data.error?.message || res.status}`)
  return data
}
async function publish(text, replyTo) {
  const c = await call('POST', 'me/threads', { media_type: 'TEXT', text, reply_to_id: replyTo })
  // A Meta recomenda esperar o contêiner ficar pronto antes de publicar.
  for (let i = 0; i < 20; i++) {
    const s = await call('GET', c.id, { fields: 'status,error_message' })
    if (s.status === 'FINISHED') break
    if (s.status === 'ERROR' || s.status === 'EXPIRED') throw new Error(`contêiner ${s.status}: ${s.error_message || ''}`)
    await new Promise((r) => setTimeout(r, 3000))
  }
  return (await call('POST', 'me/threads_publish', { creation_id: c.id })).id
}

const now = process.argv.find((a) => a.startsWith('--now='))?.slice(6)
const due = posts.filter((p) => new Date(p.publishAt) <= new Date(now || Date.now()))
  .filter((p) => !state[p.id]?.url && (state[p.id]?.attempts || 0) < MAX_ATTEMPTS)
log(`${due.length} post(s) vencido(s) para publicar.`)
if (!due.length) process.exit(0)
if (!TOKEN && !DRY) { log('THREADS_TOKEN não definido: nada publicado.'); process.exit(0) }

let failed = 0
for (const p of due) {
  const parts = p.type === 'thread' ? p.texts : [p.text]
  try {
    if (DRY) { log(`[dry-run] ${p.id}: ${parts.length} parte(s)`); continue }
    const done = state[p.id]?.ids || []
    let prev = done.at(-1)
    for (let i = done.length; i < parts.length; i++) {
      prev = await publish(parts[i], prev)
      done.push(prev)
      state[p.id] = { ...(state[p.id] || {}), ids: done }
      await writeFile(STATE, JSON.stringify(state, null, 2) + '\n')
    }
    const link = await call('GET', done[0], { fields: 'permalink' }).catch(() => ({}))
    state[p.id] = { ids: done, url: link.permalink || `threads:${done[0]}`, publishedAt: new Date().toISOString() }
    log(`✅ ${p.id}: ${state[p.id].url}`)
  } catch (e) {
    failed++
    state[p.id] = { ...(state[p.id] || {}), attempts: (state[p.id]?.attempts || 0) + 1, lastError: e.message, lastAttemptAt: new Date().toISOString() }
    log(`❌ ${p.id}: ${e.message}`)
  }
  if (!DRY) await writeFile(STATE, JSON.stringify(state, null, 2) + '\n')
}
if (failed) process.exitCode = 1
