#!/usr/bin/env node
// Publica no perfil pessoal do LinkedIn os posts vencidos de automation/linkedin/posts.json.
// Tipos: "text" (só texto) e "document" (carrossel em PDF). API oficial (Posts + Documents).
// Env: LINKEDIN_TOKEN (escopo w_member_social + openid profile), LINKEDIN_VERSION (YYYYMM), LI_DRY_RUN.
// Não imprime o token.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(DIR, '..', '..')
const POSTS = process.env.LI_POSTS_FILE || path.join(DIR, 'posts.json')
const STATE = process.env.LI_STATE_FILE || path.join(DIR, 'published.json')
// Versão da API (YYYYMM). O LinkedIn só mantém as dos últimos ~12 meses: começa no mês atual e recua se não existir.
let VERSION = process.env.LINKEDIN_VERSION || (() => { const d = new Date(); return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}` })()
const prevVersion = (v) => { let y = +v.slice(0, 4), m = +v.slice(4, 6) - 1; if (!m) { y--; m = 12 } return `${y}${String(m).padStart(2, '0')}` }
const TOKEN = process.env.LINKEDIN_TOKEN
const DRY = process.env.LI_DRY_RUN === 'true' || process.argv.includes('--dry-run')
const VALIDATE = process.argv.includes('--validate')
const MAX_ATTEMPTS = 3
const log = (...a) => console.log(new Date().toISOString(), ...a)

const posts = JSON.parse(await readFile(POSTS, 'utf8'))
const state = JSON.parse(await readFile(STATE, 'utf8').catch(() => '{}'))

// Valida a fila
const ids = new Set()
for (const p of posts) {
  if (!p.id || ids.has(p.id)) throw new Error(`id repetido ou vazio: ${p.id}`)
  ids.add(p.id)
  if (isNaN(new Date(p.publishAt))) throw new Error(`${p.id}: publishAt inválido`)
  if (!['text', 'document'].includes(p.type)) throw new Error(`${p.id}: type deve ser text ou document`)
  if (!p.text || p.text.length > 3000) throw new Error(`${p.id}: texto vazio ou com mais de 3000 caracteres`)
  if (p.type === 'document' && (!p.document || !p.title)) throw new Error(`${p.id}: document e title são obrigatórios`)
}
log(`linkedin/posts.json OK (${posts.length} post(s))`)
if (VALIDATE) process.exit(0)

// O LinkedIn interpreta alguns caracteres no texto ("little text"): é preciso escapar.
const escape = (t) => t.replace(/[\\|{}@\[\]()<>#*_~]/g, (c) => '\\' + c)

async function api(method, url, body, extra = {}, tries = 0) {
  const res = await fetch(url.startsWith('http') ? url : `https://api.linkedin.com${url}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'LinkedIn-Version': VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
      ...(body && !(body instanceof Buffer) ? { 'Content-Type': 'application/json' } : {}),
      ...extra,
    },
    body: body instanceof Buffer ? body : body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (res.status === 426 && /NONEXISTENT_VERSION/.test(text) && tries < 12) {
    VERSION = prevVersion(VERSION)
    return api(method, url, body, extra, tries + 1)
  }
  if (!res.ok) throw new Error(`${method} ${url}: HTTP ${res.status} ${text.slice(0, 300)}`)
  return { res, data: text ? JSON.parse(text) : {} }
}

const now = process.argv.find((a) => a.startsWith('--now='))?.slice(6)
const due = posts.filter((p) => new Date(p.publishAt) <= new Date(now || Date.now()))
  .filter((p) => !state[p.id]?.postUrn && (state[p.id]?.attempts || 0) < MAX_ATTEMPTS)
log(`${due.length} post(s) vencido(s) para publicar.`)
if (!due.length) process.exit(0)
if (!TOKEN && !DRY) { log('LINKEDIN_TOKEN não definido: nada publicado.'); process.exit(0) }

let author = 'urn:li:person:DRYRUN'
if (!DRY) author = `urn:li:person:${(await api('GET', '/v2/userinfo')).data.sub}`

let failed = 0
for (const p of due) {
  try {
    const body = {
      author,
      commentary: escape(p.text),
      visibility: 'PUBLIC',
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }
    if (p.type === 'document') {
      const pdf = await readFile(path.join(ROOT, p.document))
      if (DRY) { log(`[dry-run] ${p.id}: PDF ${Math.round(pdf.length / 1e3)} KB`) }
      else {
        const init = await api('POST', '/rest/documents?action=initializeUpload', { initializeUploadRequest: { owner: author } })
        await api('PUT', init.data.value.uploadUrl, pdf, { 'Content-Type': 'application/octet-stream' })
        body.content = { media: { title: p.title, id: init.data.value.document } }
        await new Promise((r) => setTimeout(r, 5000)) // o LinkedIn processa o PDF antes do post
      }
    }
    if (DRY) { log(`[dry-run] ${p.id}: publicaria (${p.text.length} caracteres)`); continue }
    const { res } = await api('POST', '/rest/posts', body)
    const urn = res.headers.get('x-restli-id')
    state[p.id] = { postUrn: urn, url: `https://www.linkedin.com/feed/update/${urn}/`, publishedAt: new Date().toISOString() }
    log(`✅ ${p.id}: ${state[p.id].url} (API ${VERSION})`)
  } catch (e) {
    failed++
    state[p.id] = { attempts: (state[p.id]?.attempts || 0) + 1, lastError: e.message, lastAttemptAt: new Date().toISOString() }
    log(`❌ ${p.id}: ${e.message}`)
  }
  if (!DRY) await writeFile(STATE, JSON.stringify(state, null, 2) + '\n')
}
if (failed) process.exitCode = 1
