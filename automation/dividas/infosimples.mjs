// Conectores Infosimples (pagos, só rodam com --pagas).
// API: POST https://api.infosimples.com/api/v2/consultas/<servico> (form-urlencoded), token no corpo.
// Respostas: code 200 = sucesso; 612 = a fonte não retornou dados (tratado como "nada encontrado");
// qualquer outro código = falha daquela consulta (aparece como ❌, nunca como "sem dívida").
// Não há retentativa automática: várias respostas de erro também são cobradas.
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const API = 'https://api.infosimples.com/api/v2/consultas/'
const TIMEOUT_S = 300
const PARALELO = 6

// ---------- catálogo escolhido (um serviço por estado; dívida ativa com valores onde existe) ----------
// tipo: 'cnd' = certidão (diz se há débito, sem valor); 'lista' = lista de dívidas com valores.
// cnpjParam: nome do parâmetro para CNPJ ('cnpj' ou 'cnpj_base' = 8 dígitos, pega todas as filiais).
export const ESTADOS = {
  AC: { servico: 'sefaz/ac/certidao-debitos', tipo: 'cnd' },
  AL: { servico: 'sefaz/al/certidao-debitos', tipo: 'cnd' },
  AM: { servico: 'sefaz/am/certidao-debitos', tipo: 'cnd' },
  AP: { servico: 'sefaz/ap/certidao-debitos', tipo: 'cnd' },
  BA: { servico: 'sefaz/ba/certidao-debitos', tipo: 'cnd' },
  CE: { servico: 'pge/ce/divida-ativa', tipo: 'lista', cnpjParam: 'cnpj_base', lista: ['dados.dividas', 'dividas'] },
  DF: { servico: 'sefaz/df/certidao-divida-ativa', tipo: 'cnd' },
  ES: { servico: 'sefaz/es/certidao-debitos', tipo: 'cnd' },
  GO: { servico: 'sefaz/go/certidao-debitos', tipo: 'cnd' },
  MA: { servico: 'sefaz/ma/certidao-divida-ativa', tipo: 'cnd' },
  MG: { servico: 'sefaz/mg/divida-ativa', tipo: 'lista', lista: ['detalhes_parcelas'], obs: 'MG: a fonte mostra parcelamentos de dívida ativa; a certidão completa de MG exige login do contribuinte' },
  MS: { servico: 'sefaz/ms/certidao-debitos', tipo: 'cnd' },
  MT: { servico: 'sefaz/mt/certidao-debitos', tipo: 'cnd' },
  PA: { servico: 'sefaz/pa/certidao-debitos', tipo: 'cnd' },
  PB: { servico: 'sefaz/pb/certidao-debitos', tipo: 'cnd' },
  PE: { servico: 'sefaz/pe/crf-movel', tipo: 'cnd', lista: ['debitos'] },
  PI: { servico: 'sefaz/pi/certidao-debitos', tipo: 'cnd' },
  PR: { servico: 'sefaz/pr/certidao-debitos', tipo: 'cnd' },
  RJ: { servico: 'pge/rj/divida-ativa', tipo: 'lista', lista: ['debitos'] },
  RN: { servico: 'sefaz/rn/certidao-debitos', tipo: 'cnd' },
  RO: { servico: 'sefaz/ro/certidao-debitos', tipo: 'cnd' },
  RR: { servico: 'sefaz/rr/certidao-debitos', tipo: 'cnd' },
  RS: { servico: 'sefaz/rs/certidao-debitos', tipo: 'cnd' },
  SC: { servico: 'sefaz/sc/certidao-debitos', tipo: 'cnd' },
  SE: { servico: 'sefaz/se/certidao-debitos', tipo: 'cnd' },
  SP: { servico: 'pge/sp/divida-ativa', tipo: 'lista', cnpjParam: 'cnpj_base', lista: ['cdas_lista'], obs: 'SP: a PGE-SP detalha só a 1ª CDA por chamada; as demais aparecem na lista com valor' },
  TO: { servico: 'sefaz/to/certidao-debitos', tipo: 'cnd' },
}

export const TRIBUNAIS = {
  'TJSP 1º grau': { servico: 'tribunal/tjsp/primeiro-grau', lista: ['processos'] },
  'TJSP 2º grau': { servico: 'tribunal/tjsp/segundo-grau', lista: ['lista_processos'] },
  'TJSP eproc': { servico: 'tribunal/tjsp/eproc-lista', lista: ['lista_processos'] },
  TJRJ: { servico: 'tribunal/tjrj/processo', lista: ['lista_processos_encontrados'] },
  'TJRJ eproc': { servico: 'tribunal/tjrj/processo-eproc', lista: ['lista_processos'] },
  TJMG: { servico: 'tribunal/tjmg/processo', lista: ['lista_processos'] },
  TJPR: { servico: 'tribunal/tjpr/processo', lista: ['processos'] },
  TJSC: { servico: 'tribunal/tjsc/processo', lista: ['lista_processos'] },
  TRF1: { servico: 'tribunal/trf1/processo', lista: ['lista_processos_encontrados'] },
  TRF2: { servico: 'tribunal/trf2/processo', lista: ['processos_lista'] },
  'TRF2 eproc': { servico: 'tribunal/trf2/processo-eproc', lista: ['processos_lista'] },
  TRF3: { servico: 'tribunal/trf3/processo', lista: ['processo_lista'] },
  TRF5: { servico: 'tribunal/trf5/processo', lista: ['lista_processos_encontrados'] },
  TRF6: { servico: 'tribunal/trf6/processo', lista: ['lista_processos'] },
}

// ---------- utilidades ----------
const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o)
const valorBR = (v) => {
  if (typeof v === 'number') return v
  const s = String(v ?? '').replace(/[^\d,.-]/g, '')
  if (!s) return 0
  return Number(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s) || 0
}
// Primeiro campo de valor do item: prefere os normalizados (numéricos) e os de saldo/total atualizado.
const ORDEM_VALOR = [/^normalizado_(saldo|valor_atualizado|valor_total|valor_a_pagar|valor_devido|valor)/, /^(saldo|valor_atualizado|valor_total|valor_a_pagar|valor_devido|valor_debito|valor)/, /valor/]
function valorDoItem(it) {
  for (const re of ORDEM_VALOR) for (const [k, v] of Object.entries(it ?? {})) if (re.test(k) && v != null && v !== '') return valorBR(v)
  return null
}
const texto = (it, ks) => ks.map((k) => it?.[k]).find((v) => v != null && v !== '' && typeof v !== 'object')
function primeiraLista(data, nomes) {
  for (const n of nomes) { const l = get(data, n); if (Array.isArray(l)) return l }
  return null
}
async function emLotes(itens, n, fn) {
  const out = new Array(itens.length)
  let i = 0
  await Promise.all(Array.from({ length: Math.min(n, itens.length) }, async () => { while (i < itens.length) { const k = i++; out[k] = await fn(itens[k]) } }))
  return out
}

// ---------- chamada (com cache de 24h por documento+serviço para nunca pagar duas vezes no dia) ----------
async function consultar({ servico, params, doc, cacheDir, atualizar }) {
  const cacheFile = path.join(cacheDir, 'infosimples', doc, `${servico.replace(/\//g, '_')}.json`)
  const st = await stat(cacheFile).catch(() => null)
  if (st && Date.now() - st.mtimeMs < 864e5 && !atualizar) return { ...JSON.parse(await readFile(cacheFile, 'utf8')), _cache: true }
  // Token: variável INFOSIMPLES_TOKEN ou o arquivo local .cache/infosimples.token (fora do git).
  const token = process.env.INFOSIMPLES_TOKEN || (await readFile(path.join(cacheDir, 'infosimples.token'), 'utf8').catch(() => '')).trim()
  if (!token) throw new Error('token da Infosimples não configurado (INFOSIMPLES_TOKEN ou .cache/infosimples.token)')
  const body = new URLSearchParams({ token, timeout: String(TIMEOUT_S), ignore_site_receipt: '1', ...params })
  const res = await fetch(API + servico, { method: 'POST', body, signal: AbortSignal.timeout((TIMEOUT_S + 30) * 1000) })
  const json = await res.json().catch(() => null)
  if (!json || typeof json.code !== 'number') throw new Error(`HTTP ${res.status} sem JSON válido`)
  // Só guarda respostas definitivas (200/612); erros não são reaproveitados.
  if (json.code === 200 || json.code === 612) {
    await mkdir(path.dirname(cacheFile), { recursive: true })
    await writeFile(cacheFile, JSON.stringify(json))
  }
  return json
}

const paramsDoc = (tipo, doc, cnpjParam = 'cnpj') => (tipo === 'CPF' ? { cpf: doc } : { [cnpjParam]: cnpjParam === 'cnpj' ? doc : doc.slice(0, 8) })

// Roda um grupo de serviços e consolida: quais deram certo, quais falharam e por quê.
async function rodarGrupo(entradas, ctx, interpretar) {
  const res = await emLotes(entradas, PARALELO, async ([rotulo, cfg]) => {
    try {
      const json = await consultar({ servico: cfg.servico, params: paramsDoc(ctx.tipo, ctx.doc, cfg.cnpjParam), doc: ctx.doc, cacheDir: ctx.cacheDir, atualizar: ctx.atualizar })
      if (json.code === 612) return { rotulo, ok: true, dividas: [], cache: json._cache }
      if (json.code !== 200) return { rotulo, ok: false, erro: `${json.code} ${json.code_message ?? ''}${json.errors?.length ? ` – ${json.errors.join('; ')}` : ''}`.trim() }
      const data = Array.isArray(json.data) ? json.data[0] ?? {} : json.data ?? {}
      return { rotulo, ok: true, dividas: interpretar(rotulo, cfg, data), cache: json._cache, price: json.header?.price }
    } catch (e) {
      return { rotulo, ok: false, erro: e.message }
    }
  })
  const falhas = res.filter((r) => !r.ok)
  const oks = res.filter((r) => r.ok)
  const avisos = []
  if (oks.some((r) => r.cache)) avisos.push(`Infosimples: parte dos resultados foi reaproveitada de consulta feita nas últimas 24h (sem nova cobrança).`)
  const resumo = `${oks.length} de ${res.length} consultados${falhas.length ? `; FALHARAM: ${falhas.map((f) => `${f.rotulo} (${f.erro})`).join(', ')}` : ''}`
  // Se algo falhou, a fonte inteira fica ❌ com a lista do que foi e do que não foi verificado.
  if (falhas.length) throw Object.assign(new Error(resumo), { parcial: { dividas: oks.flatMap((r) => r.dividas), avisos } })
  return { dividas: oks.flatMap((r) => r.dividas), avisos, detalhe: resumo }
}

// ---------- interpretação ----------
function interpretarEstado(uf, cfg, data) {
  const out = []
  const lista = cfg.lista ? primeiraLista(data, cfg.lista) : null
  if (lista?.length) {
    for (const it of lista) {
      const v = valorDoItem(it)
      out.push({
        fonte: `Estado ${uf}`,
        credor: `Fazenda estadual ${uf} – ${texto(it, ['natureza_divida', 'natureza', 'tipo_tributo', 'tributo', 'descricao']) ?? 'dívida ativa'}`,
        identificador: texto(it, ['cda', 'numero_cda', 'numero_inscricao', 'pta', 'numero_parcelamento', 'identificacao', 'auto_infracao']) ?? '—',
        devedor: texto(it, ['devedor', 'contribuinte', 'nome']) ?? '',
        situacao: texto(it, ['situacao', 'situacao_parcelamento']) ?? 'em dívida ativa',
        data: texto(it, ['data_inscricao', 'data_parcelamento', 'exercicio']) ?? '?',
        valor: v ?? 0,
        valorDesconhecido: v == null,
      })
    }
  }
  if (cfg.tipo === 'cnd' && data.conseguiu_emitir_certidao_negativa === false && !out.length) {
    out.push({
      fonte: `Estado ${uf}`,
      credor: `Fazenda estadual ${uf}`,
      identificador: data.certidao_codigo || '—',
      devedor: data.nome || '',
      situacao: `Certidão POSITIVA: existe débito estadual${data.mensagem ? ` (${String(data.mensagem).slice(0, 160)})` : ''}`,
      data: data.emissao_data || '?',
      valor: 0,
      valorDesconhecido: true,
    })
  }
  return out
}

function interpretarProcessos(trib, cfg, data) {
  const lista = primeiraLista(data, cfg.lista) ?? []
  return lista.map((p) => {
    const v = valorDoItem(p)
    return {
      fonte: `Processo ${trib}`,
      credor: [texto(p, ['classe', 'classe_judicial', 'classe_acao', 'classe_processual']), texto(p, ['assunto'])].filter(Boolean).join(' – ') || 'processo judicial',
      identificador: texto(p, ['numero_processo', 'processo', 'numero']) ?? '—',
      devedor: [texto(p, ['autor', 'reqte', 'polo_ativo']) && `autor: ${texto(p, ['autor', 'reqte', 'polo_ativo'])}`, texto(p, ['reu', 'reqdo', 'exectdo', 'polo_passivo']) && `réu: ${texto(p, ['reu', 'reqdo', 'exectdo', 'polo_passivo'])}`].filter(Boolean).join(' / '),
      situacao: texto(p, ['situacao', 'ultimo_evento_descricao', 'ultimo_movimento']) ?? 'em andamento?',
      data: texto(p, ['distribuicao', 'data_distribuicao', 'data_autuacao']) ?? '?',
      valor: v ?? 0,
      valorDesconhecido: v == null,
      processo: true,
    }
  })
}

function interpretarTst(_, __, data) {
  if (data.conseguiu_emitir_certidao_negativa !== false && data.consta !== true && !(Number(data.total_de_processos) > 0)) return []
  return [{
    fonte: 'Trabalhista (TST)',
    credor: 'Banco Nacional de Devedores Trabalhistas',
    identificador: data.certidao_codigo || '—',
    devedor: data.nome || '',
    situacao: `CNDT POSITIVA: ${data.total_de_processos ?? '?'} processo(s) com débito trabalhista${data.processos_encontrados ? `: ${[].concat(data.processos_encontrados).join(', ').slice(0, 300)}` : ''}`,
    data: data.emissao_data || '?',
    valor: 0,
    valorDesconhecido: true,
  }]
}

// ---------- fontes exportadas para o consulta.mjs ----------
export function fontesInfosimples({ cacheDir, atualizar }) {
  const ctx = (a) => ({ ...a, cacheDir, atualizar })
  return [
    { nome: 'Dívida ativa / débitos estaduais, 27 estados (Infosimples)', paga: true, custo: '~R$ 7', run: (a) => rodarGrupo(Object.entries(ESTADOS), ctx(a), interpretarEstado).then((r) => ({ ...r, avisos: [...r.avisos, ...Object.values(ESTADOS).filter((c) => c.obs).map((c) => c.obs)] })) },
    { nome: 'Débitos trabalhistas – CNDT do TST (Infosimples)', paga: true, custo: '~R$ 0,26', run: (a) => rodarGrupo([['TST', { servico: 'tribunal/tst/cndt' }]], ctx(a), interpretarTst) },
    { nome: 'Processos na Justiça: TJ SP/RJ/MG/PR/SC + TRF1/2/3/5/6 (Infosimples)', paga: true, custo: '~R$ 4', run: (a) => rodarGrupo(Object.entries(TRIBUNAIS), ctx(a), interpretarProcessos).then((r) => ({ ...r, avisos: [...r.avisos, 'Processos: cobertos TJ de SP, RJ, MG, PR e SC e a Justiça Federal (exceto TRF4). Demais TJs ainda não.'] })) },
  ]
}
