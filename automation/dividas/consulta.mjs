#!/usr/bin/env node
// Agente de consulta de dívidas por CPF/CNPJ.
// Uso: node automation/dividas/consulta.mjs <cpf|cnpj> [--nome "NOME COMPLETO"] [--pagas] [--atualizar]
//
// Cada fonte é um conector. O relatório SEMPRE termina com o checklist de cobertura:
// uma fonte que falhou ou não está contratada aparece como tal, nunca como "sem dívida".
//
// Fontes ativas hoje:
//   - PGFN (Dívida Ativa da União: tributos federais, previdenciário, FGTS) via dados abertos.
//     CNPJ vem completo; CPF vem mascarado (XXX123.456XX), então para CPF o nome é usado para confirmar.
//   - Protestos em cartório de todo o país (Direct Data, pago por consulta; só roda com --pagas).
import { spawn } from 'node:child_process'
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { fontesInfosimples } from './infosimples.mjs'

// O fetch do Node só usa o HTTPS_PROXY (onde o token é injetado) com NODE_USE_ENV_PROXY=1.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const { spawnSync } = await import('node:child_process')
  const r = spawnSync(process.execPath, [...process.execArgv, '--disable-warning=UNDICI-EHPA', ...process.argv.slice(1)], { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } })
  process.exit(r.status ?? 1)
}

const DIR = path.dirname(fileURLToPath(import.meta.url))
const CACHE = path.join(DIR, '.cache')
const REPORTS = path.join(DIR, 'relatorios')
const PGFN_BASE = 'https://dadosabertos.pgfn.gov.br'
const PGFN_FILES = process.env.PGFN_FILES?.split(',') ?? ['Sistema_SIDA', 'Previdenciario', 'FGTS']
const MAX_CACHE_AGE_DAYS = 30

// ---------- documento ----------
const digits = (s) => String(s).replace(/\D/g, '')
function cpfValido(c) {
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false
  for (const n of [9, 10]) {
    let s = 0
    for (let i = 0; i < n; i++) s += +c[i] * (n + 1 - i)
    if (((s * 10) % 11) % 10 !== +c[n]) return false
  }
  return true
}
function cnpjValido(c) {
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false
  for (const n of [12, 13]) {
    const w = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const s = w.reduce((a, p, i) => a + p * +c[i], 0)
    const d = s % 11 < 2 ? 0 : 11 - (s % 11)
    if (d !== +c[n]) return false
  }
  return true
}
const fmtCnpj = (c) => `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`
const fmtCpf = (c) => `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim()
const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// ---------- PGFN ----------
async function latestPgfnDir() {
  const html = await (await fetch(`${PGFN_BASE}/`)).text()
  const dirs = [...html.matchAll(/href="(\d{4}_trimestre_\d{2})\/"/g)].map((m) => m[1]).sort()
  if (!dirs.length) throw new Error('não encontrei a pasta trimestral nos dados abertos da PGFN')
  return dirs.at(-1)
}

async function ensurePgfnFiles() {
  await mkdir(CACHE, { recursive: true })
  const files = []
  let dir
  for (const name of PGFN_FILES) {
    const file = path.join(CACHE, `${name}.zip`)
    const st = await stat(file).catch(() => null)
    const old = !st || (Date.now() - st.mtimeMs) / 864e5 > MAX_CACHE_AGE_DAYS
    if (old) {
      dir ??= await latestPgfnDir()
      const url = `${PGFN_BASE}/${dir}/Dados_abertos_${name}.zip`
      console.error(`baixando ${url} ...`)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`PGFN ${name}: HTTP ${res.status}`)
      await pipeline(Readable.fromWeb(res.body), createWriteStream(file))
    }
    files.push({ name, file })
  }
  return files
}

// Procura `needle` em todos os CSVs do zip, vários CSVs em paralelo.
function sh(script, ...args) {
  return new Promise((resolve, reject) => {
    const p = spawn('sh', ['-c', script, 'sh', ...args])
    const chunks = []
    let err = ''
    p.stdout.on('data', (c) => chunks.push(c))
    p.stderr.on('data', (c) => (err += c))
    p.on('error', reject)
    p.on('close', (code) => {
      if (code !== 0 || /error|cannot find/i.test(err)) return reject(new Error(`falha ao ler ${args[0]}: ${err.trim() || `código ${code}`}`))
      // Os CSVs da PGFN são latin1.
      resolve(new TextDecoder('latin1').decode(Buffer.concat(chunks)).split('\n').filter(Boolean))
    })
  })
}
const grepZip = (zip, needle) => sh(
  'unzip -Z1 "$1" | grep -i "\\.csv$" | xargs -P "$(nproc)" -I{} sh -c \'unzip -p "$1" "$3" | LC_ALL=C grep -F -- "$2"; true\' _ "$1" "$2" {}',
  zip, needle)

// Cada base (SIDA, Previdenciário, FGTS) tem colunas diferentes: lemos o cabeçalho de cada uma.
async function pgfnHeader(zip) {
  const [h] = await sh('unzip -p "$1" "$(unzip -Z1 "$1" | grep -i "\\.csv$" | head -1)" | head -1; true', zip)
  if (!h) throw new Error(`cabeçalho não encontrado em ${zip}`)
  return h.replace(/\r$/, '').split(';')
}

async function fontePgfn({ tipo, doc, nome }) {
  const files = await ensurePgfnFiles()
  // CNPJ: busca pela raiz (8 dígitos) para pegar matriz e TODAS as filiais.
  // CPF: a base mascara o CPF; usamos os 6 dígitos visíveis e confirmamos pelo nome.
  const needle = tipo === 'CNPJ' ? `${fmtCnpj(doc).slice(0, 10)}/` : `XXX${doc.slice(3, 6)}.${doc.slice(6, 9)}XX;`
  const rows = []
  const lidos = await Promise.all(files.map(async (f) => ({ ...f, cols: await pgfnHeader(f.file), linhas: await grepZip(f.file, needle) })))
  for (const { name, cols, linhas } of lidos) {
    if (cols[0] !== 'CPF_CNPJ') throw new Error(`layout inesperado na base ${name}: ${cols.join(';')}`)
    for (const line of linhas) {
      const v = line.replace(/\r$/, '').split(';')
      const r = Object.fromEntries(cols.map((c, i) => [c, v[i]]))
      if (!r.CPF_CNPJ?.startsWith(needle.replace(/;$/, ''))) continue
      r.BASE = name
      rows.push(r)
    }
  }
  if (tipo === 'CNPJ') return { dividas: rows.map(pgfnDivida), avisos: [] }

  const nomes = [...new Set(rows.map((r) => r.NOME_DEVEDOR))]
  if (!nome) {
    return {
      dividas: rows.map(pgfnDivida),
      avisos: rows.length
        ? [`CPF mascarado na base da PGFN: ${nomes.length} nome(s) compartilham os mesmos dígitos (${nomes.join(', ')}). Rode de novo com --nome para confirmar quais são deste CPF.`]
        : [],
    }
  }
  const alvo = norm(nome)
  const confirmadas = rows.filter((r) => norm(r.NOME_DEVEDOR) === alvo)
  const outros = nomes.filter((n) => norm(n) !== alvo)
  return {
    dividas: confirmadas.map(pgfnDivida),
    avisos: outros.length ? [`Também existem na PGFN, com os mesmos dígitos de CPF, os nomes: ${outros.join(', ')}. Se algum for grafia diferente do mesmo titular, confira.`] : [],
  }
}

const pgfnDivida = (r) => ({
  fonte: 'PGFN',
  credor: `União/PGFN ${r.BASE === 'FGTS' ? 'FGTS' : r.BASE === 'Previdenciario' ? 'previdenciário' : 'tributário'} – ${r.RECEITA_PRINCIPAL || r.TIPO_CREDITO || '?'}`,
  identificador: String(r.NUMERO_INSCRICAO ?? '').replace(/\.0$/, ''),
  devedor: `${r.NOME_DEVEDOR} (${r.CPF_CNPJ}, ${r.TIPO_DEVEDOR})`,
  situacao: `${r.TIPO_SITUACAO_INSCRICAO} / ${r.SITUACAO_INSCRICAO}${r.INDICADOR_AJUIZADO === 'SIM' ? ' / ajuizada' : ''}`,
  data: /\/1[0-8]\d\d$/.test(r.DATA_INSCRICAO ?? '') ? 'sem data' : r.DATA_INSCRICAO,
  valor: Number(r.VALOR_CONSOLIDADO) || 0,
})

// ---------- Protestos (Direct Data – Protestos Nacional IEPTB Completa, R$ 8,10/consulta) ----------
// Token: no ambiente cloud o proxy injeta o header Authorization; fora dele, use DIRECTD_TOKEN.
const DIRECTD = 'https://apiv3.directd.com.br/api/ProtestosCompleta'
// "R$ 31.500,00", "31.500,00", "31500.00" ou número -> 31500
function valorBR(v) {
  if (typeof v === 'number') return v
  const s = String(v ?? '').replace(/[^\d,.-]/g, '')
  if (!s) return 0
  return Number(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s) || 0
}

async function fonteProtestos({ tipo, doc }) {
  // Cada chamada custa: respostas com sucesso ficam guardadas 24h para não pagar duas vezes.
  const cacheFile = path.join(CACHE, 'protestos', `${doc}.json`)
  const st = await stat(cacheFile).catch(() => null)
  let body, avisoCache
  if (st && Date.now() - st.mtimeMs < 864e5 && !process.argv.includes('--atualizar')) {
    body = JSON.parse(await readFile(cacheFile, 'utf8'))
    avisoCache = `Protestos: resultado reaproveitado da consulta de ${body.metaDados?.data} (sem nova cobrança). Use --atualizar para consultar de novo.`
  } else {
    const url = `${DIRECTD}?${tipo === 'CPF' ? 'Cpf' : 'Cnpj'}=${doc}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.DIRECTD_TOKEN || 'proxy-injected'}` }, signal: AbortSignal.timeout(120_000) })
    body = await res.json().catch(() => null)
    const m = body?.metaDados ?? {}
    if (!res.ok || !body?.retorno) throw new Error(`Direct Data HTTP ${res.status}: ${m.resultado || m.mensagem || 'sem retorno'}`)
    await mkdir(path.dirname(cacheFile), { recursive: true })
    await writeFile(cacheFile, JSON.stringify(body))
  }
  const r = body.retorno
  const dividas = []
  for (const d of r.documentos ?? []) {
    for (const c of d.cartorios ?? []) {
      const cartorio = [c.nomeCartorio, `${c.cidade}/${c.estado}`, c.telefone && `tel. ${c.telefone}`, c.endereco].filter(Boolean).join(' – ')
      const titulos = c.titulos?.length ? c.titulos : [{ dataProtesto: '?', valorProtestado: c.valorTotalProtestosCartorio }]
      for (const t of titulos) dividas.push({
        fonte: 'Protesto',
        credor: `Cartório: ${cartorio}`,
        identificador: '—',
        devedor: d.documento || r.documentoConsultado,
        situacao: 'Protestado (credor só no cartório)',
        data: t.dataProtesto || '?',
        valor: valorBR(t.valorProtestado),
      })
    }
  }
  // Nunca aceitar "tem protesto" sem os títulos: seria uma dívida escondida.
  if (r.constamProtestos && !dividas.length) throw new Error(`a Direct Data indica ${r.numeroTotalProtestos} protesto(s) (${r.valorTotalProtestos}) mas não trouxe os detalhes`)
  const avisos = avisoCache ? [avisoCache] : []
  const totalApi = valorBR(r.valorTotalProtestos)
  const soma = dividas.reduce((a, x) => a + x.valor, 0)
  if (r.constamProtestos && Math.abs(totalApi - soma) > 0.01) avisos.push(`Protestos: soma dos títulos (${brl(soma)}) difere do total informado pela Direct Data (${brl(totalApi)}). Confira no cartório.`)
  if (r.observacoes && !/^a entidade (n[aã]o )?possui protestos$/i.test(r.observacoes.trim())) avisos.push(`Protestos: ${r.observacoes}`)
  return { dividas, avisos }
}

// ---------- fontes ainda não contratadas / sem acesso automatizado ----------
// Ficam no relatório para o checklist mostrar exatamente o que NÃO foi verificado.
const PENDENTES = [
  { nome: 'Birôs de crédito (Serasa, Boa Vista/SCPC, SPC, Quod)', motivo: 'precisa de contrato B2B com o birô', manual: 'O titular consulta grátis em serasa.com.br / consumidorpositivo.com.br' },
  { nome: 'FGTS – regularidade do empregador (CRF/Caixa)', motivo: 'site exige captcha; precisa de agregador pago', manual: 'https://consulta-crf.caixa.gov.br', so: 'CNPJ' },
  { nome: 'Tribunais de AC, AL, AM, AP, BA, CE, ES, MS, PA, PB, PE, PI, RN, RO, SE e TJRS', motivo: 'sem consulta automática sem login/dados extensos', manual: 'Sites dos tribunais' },
  { nome: 'Multas estaduais/municipais de trânsito (DETRAN)', motivo: 'a maioria dos DETRANs exige login do proprietário', manual: 'DETRAN do estado' },
  { nome: 'SCR/Registrato (empréstimos e cartões em bancos)', motivo: 'o Banco Central só libera ao próprio titular (gov.br) ou a banco autorizado pelo titular', manual: 'https://registrato.bcb.gov.br (titular)' },
]

// ---------- main ----------
const args = process.argv.slice(2)
// Opções com valor: --nome, --nascimento DD/MM/AAAA, --mae, --cidade "Cidade/UF", --placa, --renavam, --uf-veiculo
const COM_VALOR = ['--nome', '--nascimento', '--mae', '--cidade', '--placa', '--renavam', '--uf-veiculo']
const opt = {}
const soltos = []
for (let i = 0; i < args.length; i++) {
  if (COM_VALOR.includes(args[i])) opt[args[i].slice(2)] = args[++i]
  else if (!args[i].startsWith('--')) soltos.push(args[i])
}
const nome = opt.nome
const [cidadeNome, cidadeUf] = (opt.cidade ?? '').split(/\s*[/-]\s*(?=[A-Za-z]{2}$)/)
const extra = {
  nome, mae: opt.mae, nascimento: opt.nascimento,
  cidade: cidadeNome || undefined, uf: cidadeUf?.toUpperCase(),
  placa: opt.placa?.toUpperCase().replace(/[^A-Z0-9]/g, ''), renavam: opt.renavam && digits(opt.renavam),
  ufVeiculo: (opt['uf-veiculo'] ?? cidadeUf)?.toUpperCase(),
}
if (opt.nascimento && !/^\d{2}\/\d{2}\/\d{4}$/.test(opt.nascimento)) { console.error('--nascimento deve ser DD/MM/AAAA'); process.exit(2) }
if (opt.cidade && !extra.uf) { console.error('--cidade deve ser "Cidade/UF", ex.: "Pelotas/RS"'); process.exit(2) }
const raw = soltos[0]
const doc = digits(raw ?? '')
const tipo = doc.length === 11 ? 'CPF' : doc.length === 14 ? 'CNPJ' : null
if (!tipo) { console.error('Uso: consulta.mjs <cpf|cnpj> [--nome "NOME"] [--nascimento DD/MM/AAAA] [--mae "NOME"] [--cidade "Cidade/UF"] [--placa X] [--renavam N] [--uf-veiculo UF] [--pagas] [--atualizar]'); process.exit(2) }
if (!(tipo === 'CPF' ? cpfValido(doc) : cnpjValido(doc))) { console.error(`${tipo} inválido (dígito verificador não confere): ${raw}`); process.exit(2) }

// Fontes pagas só rodam com --pagas (pedido explícito do dono da conta). Sem a flag, nada é cobrado.
const SEM_PAGAS = !args.includes('--pagas')
const TODAS = [
  { nome: 'Dívida Ativa da União (PGFN): tributos federais, previdenciário e FGTS', run: fontePgfn },
  { nome: 'Protestos em cartório, todo o Brasil (IEPTB/CENPROT via Direct Data)', run: fonteProtestos, paga: true, custo: 'R$ 8,10' },
  ...fontesInfosimples({ cacheDir: CACHE, atualizar: args.includes('--atualizar') }),
]
if (SEM_PAGAS) for (const f of TODAS.filter((f) => f.paga).reverse()) PENDENTES.unshift({ nome: f.nome, motivo: `fonte paga (${f.custo}), só roda com --pagas`, manual: '—' })
const FONTES = TODAS.filter((f) => !(SEM_PAGAS && f.paga))
const resultados = await Promise.all(FONTES.map(async (f) => {
  try { return { ...f, ok: true, ...(await f.run({ tipo, doc, nome, extra })) } }
  catch (e) { return { ...f, ok: false, erro: e.message, dividas: e.parcial?.dividas ?? [], avisos: e.parcial?.avisos ?? [] } }
}))

const dividas = resultados.flatMap((r) => r.dividas)
// PGFN em tempo real repete o que a base aberta já trouxe: não soma duas vezes.
if (dividas.some((d) => d.fonte === 'PGFN')) for (const d of dividas) if (d.duplicataProvavel === 'PGFN') d.foraDoTotal = true
const total = dividas.filter((d) => !d.processo && !d.foraDoTotal).reduce((a, d) => a + d.valor, 0)
const semValor = dividas.filter((d) => d.valorDesconhecido && !d.processo)
const docFmt = tipo === 'CPF' ? fmtCpf(doc) : fmtCnpj(doc)
const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
const L = []
L.push(`# Consulta de dívidas: ${tipo} ${docFmt}${nome ? ` (${nome})` : ''}`, '', `Gerado em ${agora}.`, '')
const naoConfirmado = tipo === 'CPF' && !nome && dividas.length > 0
L.push(`## ${naoConfirmado ? 'POSSÍVEIS dívidas (CPF não confirmado, veja os avisos)' : 'Dívidas encontradas'}: ${dividas.length} · total ${brl(total)}`, '')
if (dividas.length) {
  L.push('| Fonte | Credor / natureza | Inscrição | Devedor | Situação | Data | Valor |', '|---|---|---|---|---|---|---:|')
  for (const d of dividas.sort((a, b) => b.valor - a.valor)) L.push(`| ${d.fonte} | ${d.credor} | ${d.identificador} | ${d.devedor} | ${d.situacao} | ${d.data} | ${d.valorDesconhecido ? 'não informado' : d.processo ? `${brl(d.valor)} (valor da ação)` : d.foraDoTotal ? `${brl(d.valor)} (já somado na PGFN)` : `${brl(d.valor)}${d.conferir ? ' (conferir)' : ''}`} |`)
  L.push('')
}
const avisos = [...new Set(resultados.flatMap((r) => r.avisos))]
if (semValor.length) avisos.unshift(`${semValor.length} débito(s) sem valor informado pela fonte (certidão positiva): o total acima NÃO inclui esses valores.`)
if (dividas.some((d) => d.processo)) avisos.unshift('Processos judiciais aparecem na lista mas NÃO entram no total (o valor da ação não é necessariamente dívida).')
if (avisos.length) L.push('## Avisos', '', ...avisos.map((a) => `- ${a}`), '')
L.push('## Cobertura (o que foi e o que NÃO foi verificado)', '')
for (const r of resultados) L.push(r.ok && r.pulados?.length ? `- 🟡 ${r.nome}: PARCIAL (${r.detalhe}; NÃO CONSULTADOS por falta de dado: ${r.pulados.join(', ')})` : r.ok ? `- ✅ ${r.nome}: consultada (${r.dividas.length} registro(s)${r.detalhe ? `; ${r.detalhe}` : ''})` : `- ❌ ${r.nome}: FALHOU (${r.erro}). O que falhou tem resultado desconhecido.`)
for (const p of PENDENTES.filter((p) => !p.so || p.so === tipo)) L.push(`- ⚠️ ${p.nome}: NÃO verificada (${p.motivo})${p.manual && p.manual !== '—' ? `. Consulta manual: ${p.manual}` : ''}`)
L.push('', '> "Nenhuma dívida" só vale para as fontes marcadas com ✅ (e para a parte consultada das 🟡). As marcadas com ⚠️ ou ❌ podem ter dívidas.')

const out = L.join('\n')
console.log(out)
await mkdir(REPORTS, { recursive: true })
await writeFile(path.join(REPORTS, `${doc}-${new Date().toISOString().slice(0, 10)}.md`), out + '\n')
process.exit(resultados.every((r) => r.ok) ? 0 : 1)
