#!/usr/bin/env node
// Publicador automático de posts no Instagram (Graph API oficial da Meta).
//
// Lê a fila em posts.json, publica tudo que já passou do horário `publishAt`
// em cada conta indicada e registra o resultado em published.json, para que
// nenhum post seja publicado duas vezes.
//
// Credenciais por conta (variáveis de ambiente), onde <CONTA> é o nome da
// conta em maiúsculas (ex.: PESSOAL, EMPRESA):
//   IG_<CONTA>_TOKEN     token do usuário do sistema (o ID da conta é descoberto sozinho;
//                        IG_<CONTA>_USER_ID é opcional)
//
// Uso:
//   node automation/instagram/publish.mjs              publica o que estiver vencido
//   node automation/instagram/publish.mjs --dry-run    só mostra o que faria
//   node automation/instagram/publish.mjs --validate   só valida posts.json
//   node automation/instagram/publish.mjs --only=<id>  restringe a um post
//   node automation/instagram/publish.mjs --now=<ISO>  simula outro "agora"

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const POSTS_FILE = process.env.IG_POSTS_FILE || path.join(DIR, 'posts.json')
const STATE_FILE = process.env.IG_STATE_FILE || path.join(DIR, 'published.json')
const ACCOUNTS_FILE = process.env.IG_ACCOUNTS_FILE || path.join(DIR, 'accounts.json')
const API_VERSION = process.env.GRAPH_API_VERSION || 'v23.0'
const API_HOST = process.env.GRAPH_API_HOST || 'https://graph.facebook.com'
const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || ''
const MAX_ATTEMPTS = Number(process.env.IG_MAX_ATTEMPTS || 3)
const POLL_INTERVAL_MS = 5_000
const POLL_TIMEOUT_MS = 10 * 60_000

const TYPES = new Set(['image', 'carousel', 'reel', 'story'])
const VIDEO_EXT = /\.(mp4|mov|m4v)(\?.*)?$/i

// ---------------------------------------------------------------- CLI

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)
const DRY_RUN = Boolean(args['dry-run']) || process.env.IG_DRY_RUN === 'true'
const VALIDATE_ONLY = Boolean(args.validate)
const ONLY = typeof args.only === 'string' ? args.only : null
const NOW = args.now ? new Date(args.now) : new Date()

// ---------------------------------------------------------------- helpers

const log = (...m) => console.log(new Date().toISOString(), ...m)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') return fallback
    throw new Error(`Não consegui ler ${path.basename(file)}: ${err.message}`)
  }
}

function resolveUrl(u) {
  if (/^https?:\/\//i.test(u)) return u
  if (!MEDIA_BASE_URL) {
    throw new Error(`Mídia "${u}" não é uma URL completa e MEDIA_BASE_URL não está definida`)
  }
  return MEDIA_BASE_URL.replace(/\/+$/, '') + '/' + u.replace(/^\/+/, '')
}

// Cada item de mídia pode ser "https://..." ou { "url": "...", "type": "video" }.
function normalizeMedia(media) {
  const list = Array.isArray(media) ? media : [media]
  return list.map((m) => {
    const item = typeof m === 'string' ? { url: m } : { ...m }
    item.url = resolveUrl(item.url)
    item.type = item.type || (VIDEO_EXT.test(item.url) ? 'video' : 'image')
    return item
  })
}

// accounts.json: { "<apelido>": { "handle": "<@ sem arroba>", "env": "<PREFIXO>" } }
// Nos posts, a conta pode ser citada pelo apelido ou pelo @.
let ACCOUNTS = {}

function resolveAccount(name) {
  const n = String(name).trim().replace(/^@/, '').toLowerCase()
  for (const [alias, cfg] of Object.entries(ACCOUNTS)) {
    if (alias.toLowerCase() === n || cfg.handle?.toLowerCase() === n) return alias
  }
  return null
}

function knownAccounts() {
  return Object.entries(ACCOUNTS)
    .map(([alias, cfg]) => `@${cfg.handle} (${alias})`)
    .join(', ')
}

function captionFor(post, account) {
  for (const [k, v] of Object.entries(post.captions ?? {})) {
    if (resolveAccount(k) === account) return v
  }
  return post.caption ?? ''
}

function credentials(account) {
  const key = (ACCOUNTS[account]?.env || account).toUpperCase().replace(/[^A-Z0-9]/g, '_')
  return {
    userId: process.env[`IG_${key}_USER_ID`],
    token: process.env[`IG_${key}_TOKEN`],
    envNames: [`IG_${key}_TOKEN`],
  }
}

// Sem IG_<CONTA>_USER_ID, descobre o ID pela lista de páginas que o token enxerga.
async function discoverUserId(account, token) {
  const handle = ACCOUNTS[account]?.handle
  if (!handle) return undefined
  const res = await graph('GET', 'me/accounts', token, {
    fields: 'name,instagram_business_account{id,username}',
    limit: 100,
  })
  const hit = (res.data || []).find(
    (p) => p.instagram_business_account?.username?.toLowerCase() === handle.toLowerCase(),
  )
  return hit?.instagram_business_account?.id
}

// ---------------------------------------------------------------- validação

function validatePosts(posts) {
  const errors = []
  if (!Array.isArray(posts)) return ['posts.json precisa ser uma lista ([ ... ])']
  const ids = new Set()
  posts.forEach((p, i) => {
    const where = `post #${i + 1}${p?.id ? ` (${p.id})` : ''}`
    if (!p || typeof p !== 'object') return errors.push(`${where}: precisa ser um objeto`)
    if (!p.id) errors.push(`${where}: falta "id"`)
    else if (ids.has(p.id)) errors.push(`${where}: "id" repetido`)
    else ids.add(p.id)
    if (!TYPES.has(p.type)) errors.push(`${where}: "type" deve ser um de ${[...TYPES].join(', ')}`)
    if (!Array.isArray(p.accounts) || p.accounts.length === 0) {
      errors.push(`${where}: "accounts" deve ser uma lista, ex.: ["@yousefameroficial", "@tbfinance_"]`)
    } else {
      for (const a of p.accounts) {
        if (!resolveAccount(a)) errors.push(`${where}: conta "${a}" desconhecida. Use: ${knownAccounts()}`)
      }
    }
    for (const a of Object.keys(p.captions ?? {})) {
      if (!resolveAccount(a)) errors.push(`${where}: "captions" cita conta desconhecida "${a}"`)
    }
    if (!p.publishAt || Number.isNaN(Date.parse(p.publishAt))) {
      errors.push(`${where}: "publishAt" inválido (use ex.: "2026-11-20T12:00:00-03:00")`)
    }
    let media = []
    try {
      media = normalizeMedia(p.media ?? [])
    } catch (err) {
      return errors.push(`${where}: ${err.message}`)
    }
    if (media.length === 0) errors.push(`${where}: falta "media"`)
    if (p.type === 'carousel' && (media.length < 2 || media.length > 10)) {
      errors.push(`${where}: carrossel precisa de 2 a 10 mídias`)
    }
    if (['image', 'reel', 'story'].includes(p.type) && media.length !== 1) {
      errors.push(`${where}: "${p.type}" aceita exatamente 1 mídia`)
    }
    if (p.type === 'image' && media[0]?.type === 'video') {
      errors.push(`${where}: para vídeo use "type": "reel"`)
    }
    if (p.type === 'reel' && media[0] && media[0].type !== 'video') {
      errors.push(`${where}: reel precisa de um vídeo (.mp4/.mov)`)
    }
    const caption = p.caption ?? ''
    const all = [caption, ...Object.values(p.captions ?? {})]
    if (all.some((c) => c.length > 2200)) errors.push(`${where}: legenda passa de 2.200 caracteres`)
    if (all.some((c) => (c.match(/#[\p{L}\p{N}_]+/gu) || []).length > 30)) {
      errors.push(`${where}: legenda tem mais de 30 hashtags`)
    }
  })
  return errors
}

// ---------------------------------------------------------------- Graph API

async function graph(method, endpoint, token, params = {}) {
  const url = new URL(`${API_HOST}/${API_VERSION}/${endpoint}`)
  const body = new URLSearchParams()
  const target = method === 'GET' ? url.searchParams : body
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) target.set(k, String(v))
  }
  target.set('access_token', token)
  const res = await fetch(url, method === 'GET' ? {} : { method, body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) {
    const e = data.error || {}
    throw new Error(`Graph API ${endpoint}: ${e.message || res.statusText} (code ${e.code ?? res.status})`)
  }
  return data
}

async function waitUntilReady(containerId, token) {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    const { status_code: code, status: detail } = await graph('GET', containerId, token, {
      fields: 'status_code,status',
    })
    if (code === 'FINISHED') return
    if (code === 'ERROR' || code === 'EXPIRED') {
      throw new Error(`Container ${containerId} falhou: ${code} ${detail || ''}`.trim())
    }
    await sleep(POLL_INTERVAL_MS)
  }
  throw new Error(`Container ${containerId} não ficou pronto em ${POLL_TIMEOUT_MS / 60000} min`)
}

function mediaParams(item, extra = {}) {
  return item.type === 'video'
    ? { video_url: item.url, media_type: extra.media_type || 'VIDEO', ...extra }
    : { image_url: item.url, ...extra }
}

async function createContainer(post, account, { userId, token }) {
  const media = normalizeMedia(post.media)
  const caption = captionFor(post, account)

  switch (post.type) {
    case 'image':
      return graph('POST', `${userId}/media`, token, { image_url: media[0].url, caption })

    case 'reel':
      return graph('POST', `${userId}/media`, token, {
        media_type: 'REELS',
        video_url: media[0].url,
        caption,
        share_to_feed: post.shareToFeed ?? true,
        thumb_offset: post.thumbOffsetMs,
      })

    case 'story':
      return graph('POST', `${userId}/media`, token, mediaParams(media[0], { media_type: 'STORIES' }))

    case 'carousel': {
      const children = []
      for (const item of media) {
        const child = await graph('POST', `${userId}/media`, token, mediaParams(item, { is_carousel_item: true }))
        await waitUntilReady(child.id, token)
        children.push(child.id)
      }
      return graph('POST', `${userId}/media`, token, {
        media_type: 'CAROUSEL',
        children: children.join(','),
        caption,
      })
    }
  }
  throw new Error(`Tipo desconhecido: ${post.type}`)
}

async function publish(post, account, creds) {
  const container = await createContainer(post, account, creds)
  await waitUntilReady(container.id, creds.token)
  const published = await graph('POST', `${creds.userId}/media_publish`, creds.token, {
    creation_id: container.id,
  })
  let permalink
  try {
    ;({ permalink } = await graph('GET', published.id, creds.token, { fields: 'permalink' }))
  } catch {
    // permalink é só informativo
  }
  return { mediaId: published.id, permalink }
}

// ---------------------------------------------------------------- main

// Confere se o token realmente pertence ao @ esperado (evita postar no perfil errado).
const verified = new Map()
async function verifyAccount(account, creds) {
  if (!verified.has(account)) {
    verified.set(
      account,
      (async () => {
        const expected = ACCOUNTS[account]?.handle
        if (!expected) return
        const { username } = await graph('GET', creds.userId, creds.token, { fields: 'username' })
        if (username?.toLowerCase() !== expected.toLowerCase()) {
          throw new Error(`as credenciais de "${account}" são de @${username}, mas deveriam ser de @${expected}. Confira os secrets.`)
        }
      })(),
    )
  }
  return verified.get(account)
}

async function main() {
  ACCOUNTS = await readJson(ACCOUNTS_FILE, {})
  const posts = await readJson(POSTS_FILE, [])
  const errors = validatePosts(posts)
  if (errors.length) {
    console.error('Erros em posts.json:\n  - ' + errors.join('\n  - '))
    process.exit(1)
  }
  if (VALIDATE_ONLY) {
    log(`posts.json OK (${posts.length} post(s))`)
    return
  }

  const state = await readJson(STATE_FILE, {})
  let published = 0
  let failed = 0

  const due = posts
    .filter((p) => !ONLY || p.id === ONLY)
    .filter((p) => p.enabled !== false)
    .filter((p) => new Date(p.publishAt) <= NOW)
    .sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt))

  for (const post of due) {
    for (const account of [...new Set(post.accounts.map(resolveAccount))]) {
      const handle = ACCOUNTS[account]?.handle ? `@${ACCOUNTS[account].handle}` : account
      const key = `${post.id}:${account}`
      const entry = state[key] || {}
      if (entry.mediaId) continue
      if ((entry.attempts || 0) >= MAX_ATTEMPTS) {
        log(`⏭  ${key}: desistindo após ${entry.attempts} tentativas (último erro: ${entry.lastError})`)
        continue
      }

      const creds = credentials(account)
      if (creds.token && !creds.userId && !DRY_RUN) {
        try {
          creds.userId = await discoverUserId(account, creds.token)
        } catch (err) {
          log(`⚠️  ${key}: não consegui descobrir o ID da conta: ${err.message}`)
        }
        if (!creds.userId) {
          log(`⚠️  ${key}: o token não dá acesso a @${ACCOUNTS[account]?.handle}. Confira os ativos do usuário do sistema.`)
          failed++
          continue
        }
      }
      if (!creds.token || (!creds.userId && !DRY_RUN)) {
        log(`⚠️  ${key}: faltam as variáveis ${creds.envNames.join(' e ')}`)
        failed++
        continue
      }

      if (DRY_RUN) {
        log(`[dry-run] publicaria ${post.type} "${post.id}" em ${handle}`)
        continue
      }

      log(`→ publicando ${post.type} "${post.id}" em ${handle}...`)
      try {
        await verifyAccount(account, creds)
        const result = await publish(post, account, creds)
        state[key] = { ...result, publishedAt: new Date().toISOString() }
        published++
        log(`✅ ${key} publicado${result.permalink ? `: ${result.permalink}` : ''}`)
      } catch (err) {
        state[key] = {
          attempts: (entry.attempts || 0) + 1,
          lastError: err.message,
          lastAttemptAt: new Date().toISOString(),
        }
        failed++
        log(`❌ ${key}: ${err.message}`)
      }
      // grava a cada post para não perder progresso se o job cair
      await writeFile(STATE_FILE, JSON.stringify(state, null, 2) + '\n')
    }
  }

  log(`Fim: ${published} publicado(s), ${failed} falha(s), ${due.length} post(s) vencido(s) na fila.`)
  if (failed) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
