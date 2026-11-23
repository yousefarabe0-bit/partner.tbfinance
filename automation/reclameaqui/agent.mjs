#!/usr/bin/env node
// Robô diário do Reclame Aqui (conta da TB Finance). Não usa IA: as respostas são escritas pelo Claude
// na tarefa agendada diária (pela assinatura) e ficam em respostas.json. Este robô:
//  1. Entra no painel da empresa com RA_EMAIL / RA_PASSWORD (ou com a sessão salva em RA_STORAGE_STATE).
//  2. Publica as respostas de respostas.json que ainda não saíram (se a reclamação continuar sem resposta).
//  3. Confere o perfil (descrição, site, contato, foto e capa) e corrige o que estiver diferente de perfil.json.
//  4. Coleta as reclamações novas sem resposta e grava em saida/entrada.json (o workflow copia para
//     caixa/entrada.json) para o Claude ler e responder no dia. O repositório é público: CPF, telefone,
//     e-mail e números longos são apagados do texto antes de salvar.
//
// Modos (RA_MODE ou config.json -> modo):
//   auto      faz tudo acima
//   rascunho  só coleta (não publica resposta nem mexe no perfil)
//   explorar  só navega e salva capturas/HTML/mapa dos campos em saida/ para calibrar o config.json
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { chromium } from 'playwright'

const here = dirname(fileURLToPath(import.meta.url))
const readJson = (f, padrao) => (existsSync(join(here, f)) ? JSON.parse(readFileSync(join(here, f), 'utf8')) : padrao)
const config = readJson('config.json')
const perfil = readJson('perfil.json')
const respostas = readJson('respostas.json', [])
const respondidas = readJson('respondidas.json', [])
const escaladas = readJson('escaladas.json', [])
const MODE = process.env.RA_MODE || config.modo || 'auto'
const out = join(here, 'saida')
mkdirSync(out, { recursive: true })

const relatorio = { modo: MODE, data: new Date().toISOString(), publicadas: [], novas: [], perfil: [], erros: [] }
const log = (...a) => console.log('[reclameaqui]', ...a)
let shot = 0
async function capturar(page, nome, forcar = false) {
  // capturas só no modo explorar ou em erro (sem HTML: pode conter dados da sessão)
  if (MODE !== 'explorar' && !forcar) return
  const base = join(out, `${String(++shot).padStart(2, '0')}-${nome}`)
  await page.screenshot({ path: `${base}.png`, fullPage: true }).catch(() => {})
  const mapa = await page.evaluate(() => ({
    url: location.origin + location.pathname,
    links: [...document.querySelectorAll('a[href]')].map((a) => ({ texto: a.innerText.trim().slice(0, 80), href: a.href.split(/[?#]/)[0] })).slice(0, 300),
    campos: [...document.querySelectorAll('input, textarea, select')].map((e) => ({
      tag: e.tagName, type: e.type, name: e.name, id: e.id, placeholder: e.placeholder,
      label: e.labels?.[0]?.innerText?.trim() || e.getAttribute('aria-label') || '' })),
    botoes: [...document.querySelectorAll('button, [role=button]')].map((b) => b.innerText.trim().slice(0, 60)).filter(Boolean),
  })).catch(() => ({}))
  writeFileSync(`${base}.json`, JSON.stringify(mapa, null, 1))
}
// tira dados pessoais do texto (o repositório é público)
const limpar = (t) => t
  .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[e-mail removido]')
  .replace(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/g, '[documento removido]')
  .replace(/(\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[\s-]?\d{4}/g, '[telefone removido]')
  .replace(/\d{6,}/g, '[número removido]')
const semQuery = (u) => String(u).split(/[?#]/)[0]
const visivel = async (loc) => (await loc.count()) > 0 && (await loc.first().isVisible().catch(() => false))
const abrirPagina = async (page, url) => { await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(3000) }

// ---------- login ----------
async function entrar(page) {
  await abrirPagina(page, config.urls.login)
  await capturar(page, 'inicio')
  const s = config.seletores
  let email = page.locator(s.loginEmail)
  if (!(await visivel(email))) {
    // a página de entrada pode ter um botão "Entrar"/"Acessar" antes do formulário
    const botao = page.getByRole('link', { name: /entrar|acessar|login/i }).or(page.getByRole('button', { name: /entrar|acessar|login/i }))
    if (await visivel(botao)) { await botao.first().click(); await page.waitForTimeout(3000) }
    email = page.locator(s.loginEmail)
  }
  if (!(await visivel(email))) { log('formulário de login não apareceu: assumindo sessão já ativa'); return }
  if (!process.env.RA_EMAIL || !process.env.RA_PASSWORD) throw new Error('Faltam os secrets RA_EMAIL e RA_PASSWORD.')
  await email.first().fill(process.env.RA_EMAIL)
  await page.locator(s.loginSenha).first().fill(process.env.RA_PASSWORD)
  await page.locator(s.loginBotao).first().click()
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(4000)
  await capturar(page, 'apos-login')
  const bloqueio = page.locator('iframe[src*=captcha]').or(page.getByText(/código de verificação|verification code|não sou um robô/i))
  if (await visivel(bloqueio)) throw new Error('O Reclame Aqui pediu captcha ou código de verificação (ver README: RA_STORAGE_STATE).')
  if (await visivel(page.locator(s.loginSenha))) throw new Error('Login não passou (e-mail/senha errados ou tela diferente).')
}

const pendente = async (page) => visivel(page.locator(config.seletores.pendente))

// ---------- publicar respostas escritas pelo Claude ----------
async function publicarRespostas(page) {
  const feitas = new Set(respondidas.map((r) => r.url))
  const fila = respostas.filter((r) => r.url && r.resposta && !feitas.has(r.url)).slice(0, config.maxRespostasPorDia || 20)
  for (const r of fila) {
    try {
      await abrirPagina(page, r.url)
      if (!(await pendente(page))) {
        respondidas.push({ url: r.url, data: new Date().toISOString(), obs: 'já estava respondida' })
        continue
      }
      const campo = page.locator(config.seletores.campoResposta).first()
      if (!(await visivel(campo))) {
        const abrir = page.getByRole('button', { name: /responder|enviar resposta/i })
        if (await visivel(abrir)) { await abrir.first().click(); await page.waitForTimeout(1500) }
      }
      await campo.fill(r.resposta)
      await page.locator(config.seletores.botaoEnviarResposta).first().click()
      await page.waitForTimeout(4000)
      respondidas.push({ url: r.url, data: new Date().toISOString() })
      relatorio.publicadas.push(r.url)
    } catch (e) {
      relatorio.erros.push(`publicar ${r.url}: ${e.message}`)
      await capturar(page, 'erro-publicar', true)
    }
  }
  writeFileSync(join(here, 'respondidas.json'), JSON.stringify(respondidas, null, 1) + '\n')
}

// ---------- coletar reclamações novas ----------
async function coletarNovas(page) {
  await abrirPagina(page, config.urls.reclamacoes)
  await capturar(page, 'reclamacoes')
  const hrefs = await page.locator(config.seletores.linkReclamacao).evaluateAll((as) => [...new Set(as.map((a) => a.href))])
  const conhecidas = new Set([...respondidas, ...escaladas, ...respostas].map((r) => semQuery(r.url)))
  for (const url of hrefs.filter((h) => !conhecidas.has(semQuery(h)))) {
    try {
      await abrirPagina(page, url)
      if (!(await pendente(page))) continue
      const titulo = (await page.locator('h1').first().innerText().catch(() => '')).trim()
      const texto = (await page.locator(config.seletores.textoReclamacao).first().innerText()).slice(0, 15000)
      relatorio.novas.push({ url: semQuery(url), titulo: limpar(titulo), texto: limpar(texto), coletada_em: new Date().toISOString() })
    } catch (e) {
      relatorio.erros.push(`coletar ${url}: ${e.message}`)
      await capturar(page, 'erro-coletar', true)
    }
  }
}

// ---------- perfil ----------
async function sincronizarPerfil(page) {
  const sel = config.perfilCampos
  const calibrados = Object.keys(perfil).filter((k) => !k.startsWith('_') && sel[k])
  if (!calibrados.length) { relatorio.perfil.push('seletores do perfil ainda não calibrados (config.json -> perfilCampos)'); return }
  await abrirPagina(page, config.urls.perfil)
  const estadoPath = join(here, 'imagens-enviadas.txt')
  let mudou = false
  for (const campo of calibrados) {
    const valor = perfil[campo]
    if (!valor) continue
    const loc = page.locator(sel[campo]).first()
    if (campo === 'fotoPerfil' || campo === 'fotoCapa') {
      // imagem: só reenvia se o arquivo mudou desde o último envio
      const arquivo = join(here, valor)
      const assinatura = `${campo}:${createHash('sha1').update(readFileSync(arquivo)).digest('hex')}`
      if ((existsSync(estadoPath) ? readFileSync(estadoPath, 'utf8') : '').includes(assinatura)) continue
      await loc.setInputFiles(arquivo)
      appendFileSync(estadoPath, assinatura + '\n')
      relatorio.perfil.push(`${campo}: enviada`); mudou = true
      continue
    }
    const atual = (await loc.inputValue().catch(() => '')).trim()
    if (atual === valor.trim()) continue
    await loc.fill(valor)
    relatorio.perfil.push(`${campo}: atualizado`); mudou = true
  }
  if (mudou) {
    await page.locator(sel.botaoSalvar).first().click()
    await page.waitForTimeout(3000)
  } else relatorio.perfil.push('perfil já estava em dia')
}

// ---------- execução ----------
// No computador do Yousef (padrão fora do GitHub): usa o Google Chrome instalado, com janela, e um perfil
// próprio que guarda o login. Na primeira vez: `node automation/reclameaqui/agent.mjs --login` e entrar à mão.
const LOCAL = !process.env.GITHUB_ACTIONS
const contextOpts = { locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', viewport: { width: 1366, height: 900 } }
let browser, context
if (LOCAL) {
  const perfilDir = process.env.RA_PERFIL_DIR || join(homedir(), '.tbfinance-reclameaqui')
  context = await chromium.launchPersistentContext(perfilDir, { ...contextOpts, channel: process.env.RA_CANAL || 'chrome', headless: false })
} else {
  if (process.env.RA_STORAGE_STATE) contextOpts.storageState = JSON.parse(Buffer.from(process.env.RA_STORAGE_STATE, 'base64').toString('utf8'))
  browser = await chromium.launch()
  context = await browser.newContext(contextOpts)
}
const page = context.pages()[0] || await context.newPage()
if (process.argv.includes('--login')) {
  // abre o painel e espera a pessoa entrar (e passar pela verificação) e fechar a janela
  await page.goto(config.urls.login).catch(() => {})
  console.log('Faça o login no Reclame Aqui na janela do Chrome e depois feche a janela.')
  await new Promise((ok) => context.on('close', ok))
  process.exit(0)
}
page.setDefaultTimeout(20000)
let falhou = false
try {
  await entrar(page)
  if (MODE === 'explorar') {
    for (const [nome, url] of Object.entries(config.urls)) {
      await abrirPagina(page, url).catch(() => {})
      await capturar(page, `explorar-${nome}`)
    }
  } else {
    if (MODE === 'auto') {
      await publicarRespostas(page)
      try { await sincronizarPerfil(page) } catch (e) { relatorio.erros.push(`perfil: ${e.message}`); await capturar(page, 'erro-perfil', true) }
    }
    await coletarNovas(page)
  }
} catch (e) {
  falhou = true
  relatorio.erros.push(e.message)
  await capturar(page, 'erro-geral', true)
} finally {
  await context.close()
  if (browser) await browser.close()
  // entrada.json vai para caixa/ pelo workflow
  writeFileSync(join(out, 'entrada.json'), JSON.stringify(relatorio, null, 1))
  const resumo = [`## Reclame Aqui – ${relatorio.data.slice(0, 10)} (modo: ${MODE})`, '',
    `- Respostas publicadas: ${relatorio.publicadas.length}`, `- Reclamações novas coletadas: ${relatorio.novas.length}`,
    `- Perfil: ${relatorio.perfil.join('; ') || '-'}`, `- Erros: ${relatorio.erros.length}`].join('\n')
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, resumo + '\n')
  console.log(resumo)
}
if (falhou) process.exitCode = 1
