#!/usr/bin/env node
// LinkedIn Ads (Campaign Manager) pela Marketing API oficial.
// Uso:
//   node automation/linkedin/ads.mjs accounts                      lista as contas de anúncio
//   node automation/linkedin/ads.mjs lookup <faceta> "<texto>"     acha a URN de um filtro (locations, titles, industries, seniorities, jobFunctions, skills, staffCountRanges)
//   node automation/linkedin/ads.mjs validate <plano.json>         confere o plano (não precisa de token)
//   node automation/linkedin/ads.mjs create <plano.json>           cria grupo + campanhas SEMPRE em rascunho (DRAFT)
//   node automation/linkedin/ads.mjs report [dias=7]               métricas por campanha (salva em marketing/linkedin-ads/relatorios/)
//   node automation/linkedin/ads.mjs status <campanhaId> PAUSED    pausa uma campanha
//   node automation/linkedin/ads.mjs status <campanhaId> ACTIVE --confirm-spend   ativa (gasta dinheiro: só com aprovação do Yousef)
// Env: LINKEDIN_ADS_TOKEN (escopos r_ads, rw_ads, r_ads_reporting), LINKEDIN_AD_ACCOUNT (id numérico), LINKEDIN_VERSION (YYYYMM, opcional).
// Flag --dry-run: mostra o que faria sem chamar a API de escrita. Não imprime o token.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(DIR, '..', '..')
const TOKEN = process.env.LINKEDIN_ADS_TOKEN
const ACCOUNT = process.env.LINKEDIN_AD_ACCOUNT
const DRY = process.argv.includes('--dry-run')
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const [cmd, ...rest] = args
const log = (...a) => console.log(...a)

let VERSION = process.env.LINKEDIN_VERSION || (() => { const d = new Date(); return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}` })()
const prevVersion = (v) => { let y = +v.slice(0, 4), m = +v.slice(4, 6) - 1; if (!m) { y--; m = 12 } return `${y}${String(m).padStart(2, '0')}` }

async function api(method, url, body, extra = {}, tries = 0) {
  if (!TOKEN) throw new Error('LINKEDIN_ADS_TOKEN não definido.')
  const res = await fetch(`https://api.linkedin.com${url}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'LinkedIn-Version': VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...extra,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (res.status === 426 && /NONEXISTENT_VERSION/.test(text) && tries < 12) { VERSION = prevVersion(VERSION); return api(method, url, body, extra, tries + 1) }
  if (!res.ok) throw new Error(`${method} ${url.split('?')[0]}: HTTP ${res.status} ${text.slice(0, 400)}`)
  return { id: res.headers.get('x-restli-id') || res.headers.get('x-linkedin-id'), data: text ? JSON.parse(text) : {} }
}

const enc = encodeURIComponent
const accountUrn = (id) => `urn:li:sponsoredAccount:${id}`
const needAccount = () => { if (!ACCOUNT && DRY) return 'DRYRUN'; if (!ACCOUNT) throw new Error('LINKEDIN_AD_ACCOUNT não definido (rode "accounts" para ver o id).'); return ACCOUNT }

const OBJECTIVES = ['BRAND_AWARENESS', 'WEBSITE_VISIT', 'ENGAGEMENT', 'VIDEO_VIEW', 'LEAD_GENERATION', 'WEBSITE_CONVERSION', 'JOB_APPLICANT']
const FACETS = ['locations', 'profileLocations', 'titles', 'industries', 'seniorities', 'jobFunctions', 'skills', 'staffCountRanges', 'interfaceLocales', 'employers', 'degrees', 'fieldsOfStudy', 'yearsOfExperienceRanges', 'memberBehaviors', 'interests', 'audienceMatchingSegments']

function validatePlan(plan) {
  const errs = []
  if (!plan.grupo?.nome) errs.push('grupo.nome obrigatório')
  if (!plan.moeda) errs.push('moeda obrigatória (BRL)')
  if (!Array.isArray(plan.campanhas) || !plan.campanhas.length) errs.push('campanhas vazias')
  let total = 0
  for (const c of plan.campanhas || []) {
    const p = `campanha "${c.nome}"`
    if (!c.nome) errs.push('campanha sem nome')
    if (!OBJECTIVES.includes(c.objetivo)) errs.push(`${p}: objetivo inválido (${OBJECTIVES.join(', ')})`)
    if (!(c.orcamentoDiario > 0)) errs.push(`${p}: orcamentoDiario obrigatório`)
    total += c.orcamentoDiario || 0
    if (!c.publico?.incluir || !Object.keys(c.publico.incluir).length) errs.push(`${p}: publico.incluir vazio`)
    for (const f of [...Object.keys(c.publico?.incluir || {}), ...Object.keys(c.publico?.excluir || {})])
      if (!FACETS.includes(f)) errs.push(`${p}: faceta desconhecida "${f}"`)
    if (!c.publico?.incluir?.locations && !c.publico?.incluir?.profileLocations) errs.push(`${p}: falta localização`)
  }
  if (plan.tetoDiario && total > plan.tetoDiario) errs.push(`soma dos orçamentos diários (${total}) passa do teto (${plan.tetoDiario})`)
  return { errs, total }
}

// Cada faceta aceita URNs prontas ou nomes ("Brasil"), que são resolvidos pelo typeahead e mostrados para conferência.
async function resolve(facet, values) {
  const out = []
  for (const v of values) {
    if (String(v).startsWith('urn:li:')) { out.push(v); continue }
    const facetUrn = `urn:li:adTargetingFacet:${facet}`
    const { data } = await api('GET', `/rest/adTargetingEntities?q=typeahead&facet=${enc(facetUrn)}&query=${enc(v)}&queryVersion=QUERY_USES_URNS`)
    const hit = data.elements?.[0]
    if (!hit) throw new Error(`Nada encontrado para ${facet}="${v}"`)
    log(`  ${facet}: "${v}" -> ${hit.name} (${hit.urn})`)
    out.push(hit.urn)
  }
  return out
}

async function targeting(publico) {
  const block = async (obj) => {
    const parts = []
    for (const [facet, vals] of Object.entries(obj || {})) parts.push({ or: { [`urn:li:adTargetingFacet:${facet}`]: await resolve(facet, vals) } })
    return parts
  }
  const t = { include: { and: await block(publico.incluir) } }
  const ex = await block(publico.excluir)
  if (ex.length) t.exclude = { or: Object.assign({}, ...ex.map((e) => e.or)) }
  return t
}

const cmds = {
  async accounts() {
    const { data } = await api('GET', '/rest/adAccounts?q=search&search=(status:(values:List(ACTIVE,DRAFT)))')
    for (const a of data.elements || []) log(`${a.id}\t${a.name}\t${a.currency}\t${a.status}`)
    if (!data.elements?.length) log('Nenhuma conta de anúncio visível para este token.')
  },

  async lookup(facet, ...q) {
    const facetUrn = `urn:li:adTargetingFacet:${facet}`
    const { data } = await api('GET', `/rest/adTargetingEntities?q=typeahead&facet=${enc(facetUrn)}&query=${enc(q.join(' '))}&queryVersion=QUERY_USES_URNS`)
    for (const e of data.elements || []) log(`${e.urn}\t${e.name}`)
  },

  async validate(file) {
    const plan = JSON.parse(await readFile(path.resolve(file), 'utf8'))
    const { errs, total } = validatePlan(plan)
    if (errs.length) { errs.forEach((e) => log('ERRO:', e)); process.exit(1) }
    log(`Plano OK: ${plan.campanhas.length} campanha(s), ${plan.moeda} ${total}/dia no total (~${plan.moeda} ${total * 30}/mês).`)
  },

  async create(file) {
    const plan = JSON.parse(await readFile(path.resolve(file), 'utf8'))
    const { errs } = validatePlan(plan)
    if (errs.length) { errs.forEach((e) => log('ERRO:', e)); process.exit(1) }
    const acc = needAccount()
    const start = plan.inicio ? new Date(plan.inicio).getTime() : Date.now() + 86400000
    const group = { account: accountUrn(acc), name: plan.grupo.nome, status: 'DRAFT', runSchedule: { start } }
    if (plan.grupo.orcamentoTotal) group.totalBudget = { amount: String(plan.grupo.orcamentoTotal), currencyCode: plan.moeda }
    if (DRY) { log('[dry-run] grupo:', JSON.stringify(group)) }
    const groupId = DRY ? 'DRYRUN' : (await api('POST', `/rest/adAccounts/${acc}/adCampaignGroups`, group)).id
    log(`Grupo criado em rascunho: ${groupId}`)
    const created = []
    for (const c of plan.campanhas) {
      log(`Campanha "${c.nome}"`)
      const body = {
        account: accountUrn(acc),
        campaignGroup: `urn:li:sponsoredCampaignGroup:${groupId}`,
        name: c.nome,
        type: 'SPONSORED_UPDATES',
        objectiveType: c.objetivo,
        costType: c.cobranca || 'CPM',
        dailyBudget: { amount: String(c.orcamentoDiario), currencyCode: plan.moeda },
        locale: { country: 'BR', language: 'pt' },
        targetingCriteria: DRY && !TOKEN ? { naoResolvido: c.publico } : await targeting(c.publico),
        offsiteDeliveryEnabled: false,
        audienceExpansionEnabled: !!c.expansaoDePublico,
        politicalIntent: 'NOT_POLITICAL',
        status: 'DRAFT',
        runSchedule: { start, ...(c.fim ? { end: new Date(c.fim).getTime() } : {}) },
      }
      if (c.lanceMaximo) body.unitCost = { amount: String(c.lanceMaximo), currencyCode: plan.moeda }
      if (DRY) { log('[dry-run]', JSON.stringify(body, null, 2)); continue }
      const { id } = await api('POST', `/rest/adAccounts/${acc}/adCampaigns`, body)
      created.push({ nome: c.nome, id })
      log(`  criada em rascunho: ${id}`)
    }
    if (!DRY) {
      const out = path.join(ROOT, 'marketing/linkedin-ads', `criado-${path.basename(file)}`)
      await writeFile(out, JSON.stringify({ criadoEm: new Date().toISOString(), grupo: groupId, campanhas: created }, null, 2) + '\n')
      log(`IDs salvos em ${path.relative(ROOT, out)}. Nada foi ativado: os anúncios (criativos) e a ativação são feitos depois da aprovação.`)
    }
  },

  async report(days = '7') {
    const acc = needAccount()
    const end = new Date(), start = new Date(Date.now() - (+days - 1) * 86400000)
    const d = (x) => `(year:${x.getUTCFullYear()},month:${x.getUTCMonth() + 1},day:${x.getUTCDate()})`
    const fields = 'pivotValues,impressions,clicks,landingPageClicks,costInLocalCurrency,oneClickLeads,oneClickLeadFormOpens,externalWebsiteConversions,videoViews,totalEngagements'
    const { data } = await api('GET', `/rest/adAnalytics?q=analytics&pivot=CAMPAIGN&timeGranularity=ALL&dateRange=(start:${d(start)},end:${d(end)})&accounts=List(${enc(accountUrn(acc))})&fields=${fields}`)
    const camps = (await api('GET', `/rest/adAccounts/${acc}/adCampaigns?q=search&search=(status:(values:List(ACTIVE,PAUSED,DRAFT)))`)).data.elements || []
    const name = Object.fromEntries(camps.map((c) => [`urn:li:sponsoredCampaign:${c.id}`, `${c.name} [${c.status}]`]))
    const rows = (data.elements || []).map((e) => {
      const cost = +e.costInLocalCurrency || 0, leads = (e.oneClickLeads || 0) + (e.externalWebsiteConversions || 0)
      return {
        campanha: name[e.pivotValues?.[0]] || e.pivotValues?.[0], impressoes: e.impressions, cliques: e.clicks,
        ctr: e.impressions ? +(100 * e.clicks / e.impressions).toFixed(2) : 0, gasto: +cost.toFixed(2),
        cpc: e.clicks ? +(cost / e.clicks).toFixed(2) : null, cpm: e.impressions ? +(1000 * cost / e.impressions).toFixed(2) : null,
        leads, cpl: leads ? +(cost / leads).toFixed(2) : null,
        taxaFormulario: e.oneClickLeadFormOpens ? +(100 * (e.oneClickLeads || 0) / e.oneClickLeadFormOpens).toFixed(1) : null,
      }
    })
    console.table(rows)
    const dir = path.join(ROOT, 'marketing/linkedin-ads/relatorios')
    await mkdir(dir, { recursive: true })
    const out = path.join(dir, `${end.toISOString().slice(0, 10)}-${days}d.json`)
    await writeFile(out, JSON.stringify({ periodo: { inicio: start.toISOString().slice(0, 10), fim: end.toISOString().slice(0, 10) }, linhas: rows }, null, 2) + '\n')
    log(`Salvo em ${path.relative(ROOT, out)}`)
  },

  async status(id, st) {
    if (!['ACTIVE', 'PAUSED', 'ARCHIVED'].includes(st)) throw new Error('status deve ser ACTIVE, PAUSED ou ARCHIVED')
    if (st === 'ACTIVE' && !process.argv.includes('--confirm-spend'))
      throw new Error('Ativar gasta dinheiro. Só com aprovação do Yousef, e com a flag --confirm-spend.')
    const acc = needAccount()
    if (DRY) return log(`[dry-run] campanha ${id} -> ${st}`)
    await api('POST', `/rest/adAccounts/${acc}/adCampaigns/${id}`, { patch: { $set: { status: st } } }, { 'X-RestLi-Method': 'PARTIAL_UPDATE' })
    log(`Campanha ${id} -> ${st}`)
  },
}

if (!cmds[cmd]) { log('Comandos: accounts | lookup <faceta> <texto> | validate <plano> | create <plano> | report [dias] | status <id> <ACTIVE|PAUSED|ARCHIVED>'); process.exit(cmd ? 1 : 0) }
try { await cmds[cmd](...rest) } catch (e) { console.error('Falhou:', e.message); process.exit(1) }
