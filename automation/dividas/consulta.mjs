#!/usr/bin/env node
// Agente de consulta de dívidas por CPF/CNPJ.
// Uso: node automation/dividas/consulta.mjs <cpf|cnpj> [--nome "NOME COMPLETO"]
//
// Cada fonte é um conector. O relatório SEMPRE termina com o checklist de cobertura:
// uma fonte que falhou ou não está contratada aparece como tal, nunca como "sem dívida".
//
// Fontes ativas hoje:
//   - PGFN (Dívida Ativa da União: tributos federais, previdenciário, FGTS) via dados abertos.
//     CNPJ vem completo; CPF vem mascarado (XXX123.456XX), então para CPF o nome é usado para confirmar.
import { spawn } from 'node:child_process'
import { mkdir, writeFile, stat } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

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
  identificador: r.NUMERO_INSCRICAO,
  devedor: `${r.NOME_DEVEDOR} (${r.CPF_CNPJ}, ${r.TIPO_DEVEDOR})`,
  situacao: `${r.TIPO_SITUACAO_INSCRICAO} / ${r.SITUACAO_INSCRICAO}${r.INDICADOR_AJUIZADO === 'SIM' ? ' / ajuizada' : ''}`,
  data: /\/1[0-8]\d\d$/.test(r.DATA_INSCRICAO ?? '') ? 'sem data' : r.DATA_INSCRICAO,
  valor: Number(r.VALOR_CONSOLIDADO) || 0,
})

// ---------- fontes ainda não contratadas / sem acesso automatizado ----------
// Ficam no relatório para o checklist mostrar exatamente o que NÃO foi verificado.
const PENDENTES = [
  { nome: 'Birôs de crédito (Serasa, Boa Vista/SCPC, SPC, Quod)', motivo: 'precisa de contrato B2B com o birô', manual: 'O titular consulta grátis em serasa.com.br / consumidorpositivo.com.br' },
  { nome: 'Protestos em cartório (CENPROT)', motivo: 'site bloqueia acesso automatizado; precisa de API paga', manual: 'https://www.pesquisaprotesto.com.br' },
  { nome: 'Dívida ativa estadual (ICMS, IPVA, ITCMD)', motivo: 'um sistema por estado; precisa de agregador pago', manual: 'Site da SEFAZ/PGE do estado' },
  { nome: 'Dívida ativa municipal (IPTU, ISS, taxas)', motivo: 'um sistema por prefeitura; precisa de agregador pago', manual: 'Site da prefeitura' },
  { nome: 'Débitos trabalhistas (CNDT/TST)', motivo: 'site exige captcha; precisa de agregador pago', manual: 'https://cndt-certidao.tst.jus.br' },
  { nome: 'FGTS – regularidade do empregador (CRF/Caixa)', motivo: 'site exige captcha; precisa de agregador pago', manual: 'https://consulta-crf.caixa.gov.br', so: 'CNPJ' },
  { nome: 'Processos de execução/cobrança na Justiça', motivo: 'precisa de agregador pago', manual: 'Sites dos tribunais' },
  { nome: 'SCR/Registrato (empréstimos e cartões em bancos)', motivo: 'o Banco Central só libera ao próprio titular (gov.br) ou a banco autorizado pelo titular', manual: 'https://registrato.bcb.gov.br (titular)' },
]

// ---------- main ----------
const args = process.argv.slice(2)
const iNome = args.indexOf('--nome')
const nome = iNome >= 0 ? args[iNome + 1] : undefined
const raw = args.find((a, i) => !a.startsWith('--') && (iNome < 0 || i !== iNome + 1))
const doc = digits(raw ?? '')
const tipo = doc.length === 11 ? 'CPF' : doc.length === 14 ? 'CNPJ' : null
if (!tipo) { console.error('Uso: consulta.mjs <cpf|cnpj> [--nome "NOME"]'); process.exit(2) }
if (!(tipo === 'CPF' ? cpfValido(doc) : cnpjValido(doc))) { console.error(`${tipo} inválido (dígito verificador não confere): ${raw}`); process.exit(2) }

const FONTES = [{ nome: 'Dívida Ativa da União (PGFN): tributos federais, previdenciário e FGTS', run: fontePgfn }]
const resultados = await Promise.all(FONTES.map(async (f) => {
  try { return { ...f, ok: true, ...(await f.run({ tipo, doc, nome })) } }
  catch (e) { return { ...f, ok: false, erro: e.message, dividas: [], avisos: [] } }
}))

const dividas = resultados.flatMap((r) => r.dividas)
const total = dividas.reduce((a, d) => a + d.valor, 0)
const docFmt = tipo === 'CPF' ? fmtCpf(doc) : fmtCnpj(doc)
const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
const L = []
L.push(`# Consulta de dívidas: ${tipo} ${docFmt}${nome ? ` (${nome})` : ''}`, '', `Gerado em ${agora}.`, '')
const naoConfirmado = tipo === 'CPF' && !nome && dividas.length > 0
L.push(`## ${naoConfirmado ? 'POSSÍVEIS dívidas (CPF não confirmado, veja os avisos)' : 'Dívidas encontradas'}: ${dividas.length} · total ${brl(total)}`, '')
if (dividas.length) {
  L.push('| Fonte | Credor / natureza | Inscrição | Devedor | Situação | Data | Valor |', '|---|---|---|---|---|---|---:|')
  for (const d of dividas.sort((a, b) => b.valor - a.valor)) L.push(`| ${d.fonte} | ${d.credor} | ${d.identificador} | ${d.devedor} | ${d.situacao} | ${d.data} | ${brl(d.valor)} |`)
  L.push('')
}
const avisos = resultados.flatMap((r) => r.avisos)
if (avisos.length) L.push('## Avisos', '', ...avisos.map((a) => `- ${a}`), '')
L.push('## Cobertura (o que foi e o que NÃO foi verificado)', '')
for (const r of resultados) L.push(r.ok ? `- ✅ ${r.nome}: consultada (${r.dividas.length} registro(s))` : `- ❌ ${r.nome}: FALHOU (${r.erro}). Resultado desta fonte é desconhecido.`)
for (const p of PENDENTES.filter((p) => !p.so || p.so === tipo)) L.push(`- ⚠️ ${p.nome}: NÃO verificada (${p.motivo}). Consulta manual: ${p.manual}`)
L.push('', '> "Nenhuma dívida" só vale para as fontes marcadas com ✅. As marcadas com ⚠️ ou ❌ podem ter dívidas.')

const out = L.join('\n')
console.log(out)
await mkdir(REPORTS, { recursive: true })
await writeFile(path.join(REPORTS, `${doc}-${new Date().toISOString().slice(0, 10)}.md`), out + '\n')
process.exit(resultados.every((r) => r.ok) ? 0 : 1)
