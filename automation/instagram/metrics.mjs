#!/usr/bin/env node
// Métricas dos posts recentes (API oficial). Não imprime tokens.
// Uso: METRICS_SINCE=2026-11-17 node automation/instagram/metrics.mjs
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const API = `${process.env.GRAPH_API_HOST || 'https://graph.facebook.com'}/${process.env.GRAPH_API_VERSION || 'v23.0'}`
const SINCE = new Date(process.env.METRICS_SINCE || Date.now() - 14 * 864e5)

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
const out = { generatedAt: new Date().toISOString(), since: SINCE.toISOString(), accounts: {} }
for (const [alias, cfg] of Object.entries(accounts)) {
  const token = process.env[`IG_${cfg.env}_TOKEN`]
  let userId = process.env[`IG_${cfg.env}_USER_ID`]
  const acc = (out.accounts[alias] = { handle: cfg.handle, posts: [] })
  if (!token) { acc.error = 'token ausente'; continue }
  try {
    if (!userId) {
      const pages = await get('me/accounts', token, { fields: 'instagram_business_account{id,username}', limit: 100 })
      userId = (pages.data || []).find((p) => p.instagram_business_account?.username?.toLowerCase() === cfg.handle.toLowerCase())?.instagram_business_account?.id
      if (!userId) throw new Error('token não enxerga a conta')
    }
    Object.assign(acc, await get(userId, token, { fields: 'followers_count,media_count' }))
    let page = await get(`${userId}/media`, token, { fields: 'id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count', limit: 50 })
    const media = []
    while (true) {
      const items = page.data || []
      media.push(...items.filter((m) => new Date(m.timestamp) >= SINCE))
      if (!page.paging?.next || items.some((m) => new Date(m.timestamp) < SINCE)) break
      page = await get(page.paging.next, token)
    }
    for (const m of media) {
      const p = { id: m.id, type: m.media_product_type === 'REELS' ? 'reel' : m.media_type.toLowerCase(), date: m.timestamp, permalink: m.permalink,
        caption: (m.caption || '').split('\n')[0].slice(0, 90), likes: m.like_count, comments: m.comments_count }
      const metrics = p.type === 'reel'
        ? 'views,reach,saved,shares,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time'
        : 'views,reach,saved,shares,total_interactions'
      try {
        const ins = await get(`${m.id}/insights`, token, { metric: metrics })
        for (const d of ins.data || []) p[d.name] = d.values?.[0]?.value ?? d.total_value?.value
      } catch (e) { p.insightsError = e.message }
      acc.posts.push(p)
    }
  } catch (e) { acc.error = e.message }
}
console.log('===METRICS-BEGIN===')
console.log(JSON.stringify(out))
console.log('===METRICS-END===')
