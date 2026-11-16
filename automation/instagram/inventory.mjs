#!/usr/bin/env node
// Lista todos os posts/reels das contas configuradas em accounts.json via API oficial.
// Não imprime tokens. Saída: JSON entre as linhas ===INVENTORY-BEGIN=== e ===INVENTORY-END===
// e também grava em inventory.json (ou IG_INVENTORY_FILE).

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const API = `${process.env.GRAPH_API_HOST || 'https://graph.facebook.com'}/${process.env.GRAPH_API_VERSION || 'v23.0'}`
const OUT = process.env.IG_INVENTORY_FILE || path.join(DIR, 'inventory.json')

async function get(endpoint, token, params = {}) {
  const url = new URL(endpoint.startsWith('http') ? endpoint : `${API}/${endpoint}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
  if (!url.searchParams.has('access_token')) url.searchParams.set('access_token', token)
  const res = await fetch(url)
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) throw new Error(data.error?.message || res.statusText)
  return data
}

const accounts = JSON.parse(await readFile(path.join(DIR, 'accounts.json'), 'utf8'))
const result = { generatedAt: new Date().toISOString(), accounts: {} }
let failed = false

for (const [alias, cfg] of Object.entries(accounts)) {
  const token = process.env[`IG_${cfg.env}_TOKEN`]
  const entry = (result.accounts[alias] = { handle: cfg.handle })
  if (!token) {
    entry.error = `IG_${cfg.env}_TOKEN não definido`
    failed = true
    continue
  }
  try {
    let userId = process.env[`IG_${cfg.env}_USER_ID`]
    if (!userId) {
      const pages = await get('me/accounts', token, { fields: 'name,instagram_business_account{id,username}', limit: 100 })
      const visible = (pages.data || []).map((p) => p.instagram_business_account?.username).filter(Boolean)
      entry.visibleAccounts = visible
      userId = (pages.data || []).find(
        (p) => p.instagram_business_account?.username?.toLowerCase() === cfg.handle.toLowerCase(),
      )?.instagram_business_account?.id
      if (!userId) throw new Error(`token não enxerga @${cfg.handle} (enxerga: ${visible.join(', ') || 'nenhuma'})`)
    }
    entry.userId = userId
    const profile = await get(userId, token, { fields: 'username,media_count,followers_count' })
    Object.assign(entry, profile)
    const fields =
      'id,caption,media_type,media_product_type,timestamp,permalink,media_url,thumbnail_url,like_count,comments_count,' +
      'children{media_type,media_url,thumbnail_url}'
    const media = []
    let page = await get(`${userId}/media`, token, { fields, limit: 50 })
    while (true) {
      media.push(...(page.data || []))
      const next = page.paging?.next
      if (!next) break
      page = await get(next, token)
    }
    entry.media = media
    console.error(`@${cfg.handle}: ${media.length} posts`)
  } catch (err) {
    entry.error = err.message
    failed = true
    console.error(`@${cfg.handle}: ERRO ${err.message}`)
  }
}

const json = JSON.stringify(result)
await writeFile(OUT, json)
console.log('===INVENTORY-BEGIN===')
console.log(json)
console.log('===INVENTORY-END===')
if (failed) process.exitCode = 1
