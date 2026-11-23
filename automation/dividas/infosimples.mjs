// Conectores Infosimples (pagos, só rodam com --pagas).
// API: POST https://api.infosimples.com/api/v2/consultas/<servico> (form-urlencoded), token no corpo.
// Respostas: code 200 = sucesso; 612 = a fonte não retornou dados (tratado como "nada encontrado");
// qualquer outro código = falha daquela consulta (aparece como ❌, nunca como "sem dívida").
// Não há retentativa automática: várias respostas de erro também são cobradas.
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

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
  const h = createHash('sha1').update(JSON.stringify(params)).digest('hex').slice(0, 10)
  const cacheFile = path.join(cacheDir, 'infosimples', doc, `${servico.replace(/\//g, '_')}-${h}.json`)
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
    // cfg.params(ctx) pode devolver { pular: 'motivo' } quando falta um dado do cliente (nascimento, placa...).
    const params = cfg.params ? cfg.params(ctx) : paramsDoc(ctx.tipo, ctx.doc, cfg.cnpjParam)
    if (params?.naoAplica) return { rotulo, ok: true, naoAplica: true, dividas: [] }
    if (params?.pular) return { rotulo, ok: true, pulado: params.pular, dividas: [] }
    try {
      const json = await consultar({ servico: cfg.servico, params, doc: ctx.doc, cacheDir: ctx.cacheDir, atualizar: ctx.atualizar })
      if (json.code === 612) return { rotulo, ok: true, dividas: [], cache: json._cache }
      if (json.code !== 200) return { rotulo, ok: false, erro: `${json.code} ${json.code_message ?? ''}${json.errors?.length ? ` – ${json.errors.join('; ')}` : ''}`.trim() }
      const data = Array.isArray(json.data) ? json.data[0] ?? {} : json.data ?? {}
      return { rotulo, ok: true, dividas: interpretar(rotulo, cfg, data), cache: json._cache, price: json.header?.price }
    } catch (e) {
      return { rotulo, ok: false, erro: e.message }
    }
  })
  const falhas = res.filter((r) => !r.ok)
  const pulados = res.filter((r) => r.pulado).map((r) => `${r.rotulo} (${r.pulado})`)
  const oks = res.filter((r) => r.ok && !r.pulado && !r.naoAplica)
  const avisos = []
  if (oks.some((r) => r.cache)) avisos.push(`Infosimples: parte dos resultados foi reaproveitada de consulta feita nas últimas 24h (sem nova cobrança).`)
  if (!oks.length && !falhas.length) return { dividas: [], avisos, detalhe: 'nada consultado', pulados }
  const resumo = `${oks.length} de ${res.filter((r) => !r.naoAplica).length} consultados${falhas.length ? `; FALHARAM: ${falhas.map((f) => `${f.rotulo} (${f.erro})`).join(', ')}` : ''}`
  // Se algo falhou, a fonte inteira fica ❌ com a lista do que foi e do que não foi verificado.
  if (falhas.length) throw Object.assign(new Error(resumo + (pulados.length ? `; NÃO CONSULTADOS por falta de dado: ${pulados.join(', ')}` : '')), { parcial: { dividas: oks.flatMap((r) => r.dividas), avisos } })
  return { dividas: oks.flatMap((r) => r.dividas), avisos, detalhe: resumo, pulados }
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


// =====================================================================================
// Fontes que dependem de dados extras do cliente (nascimento, mãe, cidade, placa, RENAVAM)
// =====================================================================================
// ⚠️ A CONFIRMAR NO OPENAPI DA INFOSIMPLES: formato de datas e nomes de cidade. Tudo num lugar só.
export const FORMATOS = {
  nascimento: (d) => d, // recebido como DD/MM/AAAA; ajustar se a API pedir AAAA-MM-DD
  municipio: (c) => c, // nome da cidade como digitado (ex.: "Pelotas")
}
// Consulta que não se aplica ao tipo de documento (ex.: FGTS para CPF) some do relatório, não é "pulada".
const so = (tipo, alvo) => (t) => (t === alvo ? null : { naoAplica: true })
const doc = (c) => (c.tipo === 'CPF' ? { cpf: c.doc } : { cnpj: c.doc })
const precisa = (c, campos) => {
  const falta = campos.filter((k) => !c.extra?.[k])
  return falta.length ? { pular: `falta ${falta.join(', ')}` } : null
}

// ---------- Federal em tempo real (Receita + PGFN) e FGTS ----------
export const FEDERAL = {
  'PGFN lista de devedores (tempo real)': { servico: 'receita-federal/pgfn/devedores', params: doc },
  'Certidão federal Receita+PGFN': {
    servico: 'receita-federal/pgfn',
    params: (c) => (c.tipo === 'CPF' ? precisa(c, ['nascimento']) ?? { cpf: c.doc, birthdate: FORMATOS.nascimento(c.extra.nascimento) } : { cnpj: c.doc }),
  },
  'FGTS (certidão da Caixa)': { servico: 'caixa/regularidade', params: (c) => so(c.tipo, 'CNPJ')(c.tipo) ?? { cnpj: c.doc } },
}
function interpretarFederal(rotulo, _, data) {
  const base = { identificador: data.certidao_codigo || '—', devedor: data.nome || data.razao_social || '', data: data.emissao_data || '?', valor: 0, valorDesconhecido: true }
  if (rotulo.startsWith('PGFN lista')) {
    const v = valorBR(data.total_divida)
    if (!v) return []
    return [{ ...base, fonte: 'PGFN (tempo real)', credor: `União – ${[].concat(data.naturezas_debitos ?? []).join(', ') || 'dívida ativa'}`, situacao: `Inscrito na lista de devedores (tributário ${data.total_tributario ?? '?'}, não tributário ${data.total_nao_tributario ?? '?'})`, valor: v, valorDesconhecido: false, duplicataProvavel: 'PGFN' }]
  }
  if (rotulo.startsWith('FGTS')) {
    if (!/irregular/i.test(String(data.situacao ?? ''))) return []
    return [{ ...base, fonte: 'FGTS (Caixa)', credor: 'FGTS – Caixa', situacao: `Empregador IRREGULAR no FGTS: ${data.situacao}` }]
  }
  if (data.conseguiu_emitir_certidao_negativa !== false) return []
  const det = [['Receita', data.debitos_rfb], ['PGFN', data.debitos_pgfn]].filter(([, v]) => v && (!Array.isArray(v) || v.length)).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v).slice(0, 200) : v}`)
  return [{ ...base, fonte: 'Receita Federal', credor: 'Receita Federal / PGFN', situacao: `Certidão federal POSITIVA: há pendência com a Receita e/ou PGFN${det.length ? ` (${det.join('; ')})` : ''}${data.observacoes ? ` – ${String(data.observacoes).slice(0, 200)}` : ''}` }]
}

// ---------- IPVA: por CPF/CNPJ em 6 estados; nos demais por RENAVAM/placa do veículo ----------
const IPVA_DOC = { MG: 'sefaz/mg/debitos-ipva', MT: 'sefaz/mt/ipva', PA: 'sefaz/pa/ipva', PB: 'sefaz/pb/ipva', PI: 'sefaz/pi/ipva', TO: 'sefaz/to/ipva' }
const IPVA_VEICULO = { AM: ['sefaz/am/ipva', ['renavam']], BA: ['sefaz/ba/ipva', ['renavam']], DF: ['sefaz/df/ipva', ['renavam']], PR: ['sefaz/pr/ipva', ['renavam']], RO: ['sefaz/ro/ipva', ['renavam']], CE: ['sefaz/ce/ipva', ['placa', 'renavam']], GO: ['sefaz/go/ipva', ['placa', 'renavam']], MS: ['sefaz/ms/ipva', ['placa', 'renavam']] }
export function veiculos(c) {
  const e = {}
  for (const [uf, servico] of Object.entries(IPVA_DOC)) e[`IPVA ${uf} (por ${c.tipo})`] = { servico, params: doc }
  const ufv = c.extra?.ufVeiculo
  if (ufv && IPVA_VEICULO[ufv]) {
    const [servico, campos] = IPVA_VEICULO[ufv]
    e[`IPVA ${ufv} (veículo)`] = { servico, params: (ctx) => precisa(ctx, campos) ?? Object.fromEntries(campos.map((k) => [k, ctx.extra[k]])) }
  } else if (ufv && !IPVA_DOC[ufv]) e[`IPVA ${ufv} (veículo)`] = { params: () => ({ pular: `sem API de IPVA por veículo para ${ufv} sem login` }) }
  e['Multas PRF (rodovias federais)'] = { servico: 'dprf/nada-consta', params: (ctx) => precisa(ctx, ['placa', 'renavam']) ?? { placa: ctx.extra.placa, renavam: ctx.extra.renavam } }
  return e
}
// Procura, em qualquer nível, itens com campo de valor (IPVA/multas têm formatos diferentes por estado).
function coletarValores(obj, caminho = '', out = []) {
  if (Array.isArray(obj)) obj.forEach((x, i) => coletarValores(x, `${caminho}[${i}]`, out))
  else if (obj && typeof obj === 'object') {
    const v = valorDoItem(obj)
    const temFilhos = Object.values(obj).some((x) => x && typeof x === 'object')
    if (v != null && v > 0 && !temFilhos) out.push({ caminho, item: obj, valor: v })
    else for (const [k, x] of Object.entries(obj)) if (x && typeof x === 'object') coletarValores(x, caminho ? `${caminho}.${k}` : k, out)
  }
  return out
}
function interpretarVeiculo(rotulo, _, data) {
  if (data.nada_consta === true) return []
  return coletarValores(data).map(({ caminho, item, valor }) => ({
    fonte: rotulo.startsWith('Multas') ? 'Multas PRF' : rotulo.replace(/ \(.*/, ''),
    credor: rotulo.startsWith('Multas') ? `PRF – ${texto(item, ['descricao_infracao', 'enquadramento']) ?? 'multa'}` : `IPVA – ${caminho.replace(/\[\d+\]/g, '')}`,
    identificador: texto(item, ['ait', 'placa', 'renavam', 'exercicio', 'ano']) ?? (data.placa || '—'),
    devedor: texto(data, ['proprietario', 'nome_razao_social']) ?? '',
    situacao: texto(item, ['situacao', 'exigibilidade']) ?? 'em aberto?',
    data: texto(item, ['vencimento', 'data', 'ano', 'exercicio']) ?? '?',
    valor,
    conferir: true,
  }))
}

// ---------- Municipal: certidão unificada das prefeituras ----------
export const MUNICIPAL = {
  'Prefeitura (CND unificada)': { servico: 'pref/cnd', params: (c) => precisa(c, ['cidade', 'uf']) ?? { ...doc(c), uf: c.extra.uf, municipio: FORMATOS.municipio(c.extra.cidade) } },
}
function interpretarMunicipal(_, __, data) {
  if (data.conseguiu_emitir_certidao_negativa !== false) return []
  return [{ fonte: 'Prefeitura', credor: 'Fazenda municipal (IPTU/ISS/taxas)', identificador: data.numero_certidao || '—', devedor: '', situacao: `Certidão municipal POSITIVA${data.mensagem ? `: ${String(data.mensagem).slice(0, 200)}` : ''}`, data: data.data_emissao || '?', valor: 0, valorDesconhecido: true }]
}

// ---------- Outros tribunais (certidões que pedem nascimento / mãe / nome) ----------
export const OUTROS_TRIBUNAIS = {
  TRF4: { servico: 'tribunal/trf4/certidao', params: (c) => (c.tipo === 'CPF' ? precisa(c, ['nascimento']) ?? { cpf: c.doc, birthdate: FORMATOS.nascimento(c.extra.nascimento) } : { cnpj: c.doc }) },
  TJMT: { servico: 'tribunal/tjmt/primeiro-grau-pf', params: (c) => so(c.tipo, 'CPF')(c.tipo) ?? precisa(c, ['nascimento']) ?? { cpf: c.doc, birthdate: FORMATOS.nascimento(c.extra.nascimento) } },
  TJGO: { servico: 'tribunal/tjgo/nada-consta', params: (c) => (c.tipo === 'CPF' ? precisa(c, ['nome', 'mae', 'nascimento']) ?? { cpf: c.doc, nome: c.extra.nome, nome_mae: c.extra.mae, birthdate: FORMATOS.nascimento(c.extra.nascimento) } : precisa(c, ['nome']) ?? { cnpj: c.doc, razao_social: c.extra.nome }) },
  TJDF: { servico: 'tribunal/tjdf/nada-consta', params: (c) => (c.tipo === 'CPF' ? precisa(c, ['nome', 'mae']) ?? { cpf: c.doc, primeiro_nome: c.extra.nome.split(' ')[0], nome_mae: c.extra.mae } : { cnpj: c.doc }) },
  TJRR: { servico: 'tribunal/tjrr/cert-negativa', params: (c) => precisa(c, ['nome']) ?? { ...doc(c), nome: c.extra.nome } },
  TJTO: { servico: 'tribunal/tjto/cert-judicial', params: (c) => precisa(c, ['nome']) ?? { ...doc(c), nome: c.extra.nome } },
  TJMA: { servico: 'tribunal/tjma/nada-consta', params: (c) => so(c.tipo, 'CPF')(c.tipo) ?? precisa(c, ['nome', 'mae', 'nascimento']) ?? { cpf: c.doc, nome: c.extra.nome, nome_mae: c.extra.mae, birthdate: FORMATOS.nascimento(c.extra.nascimento) } },
}
function interpretarCertidaoJudicial(trib, _, data) {
  const negativa = data.nada_consta === true || data.conseguiu_emitir_certidao_negativa === true
  if (negativa) return []
  if (data.nada_consta == null && data.conseguiu_emitir_certidao_negativa == null) {
    return [{ fonte: `Processo ${trib}`, credor: 'Certidão judicial', identificador: data.numero_certidao || data.numero || '—', devedor: '', situacao: `Resultado não reconhecido, conferir: ${String(data.mensagem ?? '').slice(0, 200)}`, data: '?', valor: 0, valorDesconhecido: true, processo: true }]
  }
  return [{ fonte: `Processo ${trib}`, credor: 'Certidão judicial POSITIVA (constam processos)', identificador: data.numero_certidao || data.codigo_autenticacao || '—', devedor: data.nome || '', situacao: String(data.mensagem ?? data.observacoes ?? 'constam processos').slice(0, 250), data: data.data_emissao || data.datahora_emissao || '?', valor: 0, valorDesconhecido: true, processo: true }]
}

// ---------- fontes exportadas para o consulta.mjs ----------
export function fontesInfosimples({ cacheDir, atualizar }) {
  const ctx = (a) => ({ ...a, cacheDir, atualizar })
  return [
    { nome: 'Federal em tempo real: Receita + PGFN (lista de devedores e certidão) e FGTS (Infosimples)', paga: true, custo: '~R$ 1', run: (a) => rodarGrupo(Object.entries(FEDERAL), ctx(a), interpretarFederal) },
    { nome: 'Dívida ativa / débitos estaduais, 27 estados (Infosimples)', paga: true, custo: '~R$ 7', run: (a) => rodarGrupo(Object.entries(ESTADOS), ctx(a), interpretarEstado).then((r) => ({ ...r, avisos: [...r.avisos, ...Object.values(ESTADOS).filter((c) => c.obs).map((c) => c.obs)] })) },
    { nome: 'Débitos trabalhistas – CNDT do TST (Infosimples)', paga: true, custo: '~R$ 0,26', run: (a) => rodarGrupo([['TST', { servico: 'tribunal/tst/cndt' }]], ctx(a), interpretarTst) },
    { nome: 'IPVA (MG, MT, PA, PB, PI, TO por CPF/CNPJ; demais pelo veículo) e multas PRF (Infosimples)', paga: true, custo: '~R$ 2', run: (a) => rodarGrupo(Object.entries(veiculos(a)), ctx(a), interpretarVeiculo).then((r) => ({ ...r, avisos: [...r.avisos, ...(r.dividas.length ? ['IPVA/multas: valores lidos automaticamente de formatos diferentes por estado; confira os itens marcados.'] : [])] })) },
    { nome: 'Dívida municipal: IPTU, ISS e taxas (certidão da prefeitura, Infosimples)', paga: true, custo: '~R$ 0,30', run: (a) => rodarGrupo(Object.entries(MUNICIPAL), ctx(a), interpretarMunicipal) },
    { nome: 'Certidões judiciais: TRF4, TJMT, TJGO, TJDF, TJRR, TJTO, TJMA (Infosimples)', paga: true, custo: '~R$ 2', run: (a) => rodarGrupo(Object.entries(OUTROS_TRIBUNAIS), ctx(a), interpretarCertidaoJudicial) },
    { nome: 'Processos na Justiça: TJ SP/RJ/MG/PR/SC + TRF1/2/3/5/6 (Infosimples)', paga: true, custo: '~R$ 4', run: (a) => rodarGrupo(Object.entries(TRIBUNAIS), ctx(a), interpretarProcessos).then((r) => ({ ...r, avisos: [...r.avisos, 'Processos: cobertos TJ de SP, RJ, MG, PR e SC e a Justiça Federal (exceto TRF4). Demais TJs ainda não.'] })) },
  ]
}
