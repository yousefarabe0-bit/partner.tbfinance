"""Gera o modelo de gestão financeira (DRE, Fluxo 13 semanas, Balanço, DFC,
Ciclo, KPIs, Orçado x Realizado, Dashboard e aba _API) com dados da Loja Exemplo.
Uso: python3 gerar_modelo.py [saida.xlsx]"""
import sys, datetime as dt
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as L
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule, CellIsRule
from openpyxl.chart import BarChart, LineChart, Reference

OUT = sys.argv[1] if len(sys.argv) > 1 else "Modelo_Gestao_Financeira_TB.xlsx"
ANO = 2026
MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
CANAIS = ["Site Próprio","Mercado Livre","Shopee","Amazon/Outros","Geral"]

NAVY = "1F2A44"; GOLD = "C9A227"
F_HEAD = PatternFill("solid", fgColor=NAVY)
F_SUB = PatternFill("solid", fgColor="E8ECF4")
F_INPUT = PatternFill("solid", fgColor="FFF7D6")
F_RES = PatternFill("solid", fgColor="DDE7F7")
WHITE_B = Font(bold=True, color="FFFFFF")
B = Font(bold=True)
TITLE = Font(bold=True, size=16, color=NAVY)
GRAY = Font(size=9, color="888888", italic=True)
NUM = '#,##0;(#,##0);"-"'
PCT = '0.0%;(0.0%);"-"'
DEC = '#,##0.0;(#,##0.0);"-"'
MOEDA = 'R$ #,##0;(R$ #,##0);"-"'
thin = Side(style="thin", color="D0D5DD")
BOT = Border(bottom=thin)

wb = Workbook()

def sheet(name, title, subtitle=None, first=False):
    ws = wb.active if first else wb.create_sheet(name)
    ws.title = name
    ws["A1"] = title; ws["A1"].font = TITLE
    if subtitle:
        ws["A2"] = subtitle; ws["A2"].font = GRAY
    ws.sheet_view.showGridLines = False
    return ws

def header(ws, row, values, start_col=1):
    for i, v in enumerate(values):
        c = ws.cell(row=row, column=start_col + i, value=v)
        c.fill = F_HEAD; c.font = WHITE_B
        c.alignment = Alignment(horizontal="center" if i else "left", vertical="center")

def style_row(ws, row, c1, c2, fill=None, font=None, fmt=None):
    for c in range(c1, c2 + 1):
        cell = ws.cell(row=row, column=c)
        if fill: cell.fill = fill
        if font: cell.font = font
        if fmt: cell.number_format = fmt
        cell.border = BOT

MC = lambda m: L(1 + m)   # coluna do mês m (B..M)

# ------------------------------------------------------------------ LEIA-ME
ws = sheet("LEIA-ME", "Modelo de Gestão Financeira — TB Finance",
           "Modelo para e-commerce. Preenchido com a empresa fictícia 'Loja Exemplo' (set e out/2026).", first=True)
txt = [
 ("COMO FUNCIONA", None),
 ("1. Células AMARELAS são para digitar. Todas as outras são calculadas — não sobrescreva.", None),
 ("2. Config: nome da empresa, ano, MÊS DE ANÁLISE (muda todos os relatórios), caixa mínimo e início do fluxo.", None),
 ("3. Plano de Contas: categorias gerenciais. Cada categoria aponta para um grupo da DRE.", None),
 ("4. Lançamentos: a BASE de tudo. Uma linha por receita/despesa (ou totais por categoria/canal no mês).", None),
 ("   Data de competência = quando o fato aconteceu (é a que vale para a DRE).", None),
 ("5. DRE, DRE por Canal, DFC, KPIs e Dashboard são automáticos a partir dos Lançamentos.", None),
 ("6. Balanço: digite os saldos do último dia de cada mês (extratos, ERP, contas a pagar/receber).", None),
 ("7. Fluxo 13 Semanas: projeção de caixa — atualize toda semana com agenda de recebíveis e contas a pagar.", None),
 ("8. KPIs: digite pedidos, clientes novos, sessões etc. O resto é calculado.", None),
 ("9. Orçamento: metas mensais. Orçado x Realizado compara com o mês de análise.", None),
 ("10. _API: tabela limpa (uma linha por mês) para o sistema/app ler os dados. Não altere a estrutura.", None),
 ("", None),
 ("REGRAS DE OURO", None),
 ("• Compra de estoque NÃO é despesa: vai para a DRE como CMV só quando vende.", None),
 ("• Parcela de empréstimo: só os JUROS entram na DRE. O principal é 'Amortização de empréstimos' (fora da DRE).", None),
 ("• Retirada de sócio além do pró-labore = 'Distribuição de lucros' (fora da DRE).", None),
 ("• Concilie com o extrato bancário antes de apresentar qualquer número.", None),
 ("• Para criar categoria nova: inclua no Plano de Contas E adicione a linha correspondente na aba DRE.", None),
 ("", None),
 ("Guia completo de como preencher e analisar: docs/gestao-financeira/guia-relatorios.md", None),
]
for i, (t, _) in enumerate(txt, start=4):
    c = ws.cell(row=i, column=1, value=t)
    if t.isupper() and t: c.font = Font(bold=True, color=NAVY, size=12)
ws["A27"] = "Legenda:"; ws["A27"].font = B
ws["A28"] = "Digitar"; ws["A28"].fill = F_INPUT
ws["A29"] = "Resultado / subtotal"; ws["A29"].fill = F_RES
ws.column_dimensions["A"].width = 110

# ------------------------------------------------------------------ CONFIG
ws = sheet("Config", "Configurações")
cfg = [("Empresa", "Loja Exemplo Ltda."), ("Ano", ANO), ("Mês de análise (1-12)", 10),
       ("Caixa mínimo de segurança (R$)", 100000), ("Início do fluxo 13 semanas (segunda-feira)", dt.date(2026, 11, 2)),
       ("Saldo bancário no início do fluxo (R$)", 150000)]
for i, (k, v) in enumerate(cfg, start=3):
    ws.cell(row=i, column=1, value=k).font = B
    c = ws.cell(row=i, column=2, value=v); c.fill = F_INPUT
    if isinstance(v, dt.date): c.number_format = "dd/mm/yyyy"
    elif isinstance(v, int) and v > 100: c.number_format = MOEDA
ws["C5"] = '=INDEX({"Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"},B5)'
ws["C5"].font = GRAY
header(ws, 11, ["Canais de venda"]); [ws.cell(row=12 + i, column=1, value=c) for i, c in enumerate(CANAIS)]
header(ws, 11, ["Meses"], start_col=3)
for i, m in enumerate(MESES): ws.cell(row=12 + i, column=3, value=m); ws.cell(row=12 + i, column=4, value=i + 1)
dv = DataValidation(type="whole", operator="between", formula1="1", formula2="12"); ws.add_data_validation(dv); dv.add("B5")
ws.column_dimensions["A"].width = 44; ws.column_dimensions["B"].width = 22; ws.column_dimensions["C"].width = 12
CFG_ANO, CFG_MES, CFG_CXMIN, CFG_INI, CFG_SALDO = "Config!$B$4", "Config!$B$5", "Config!$B$6", "Config!$B$7", "Config!$B$8"

# ------------------------------------------------------------------ PLANO DE CONTAS
PLANO = [
 ("1.1","Vendas de mercadorias","Receita Bruta",1,"Receita"),
 ("2.1","Devoluções e cancelamentos","Deduções",-1,"Variável"),
 ("2.2","Impostos sobre vendas","Deduções",-1,"Variável"),
 ("3.1","CMV - Custo das mercadorias vendidas","CMV",-1,"Variável"),
 ("4.1","Comissões de marketplace","Despesas Variáveis",-1,"Variável"),
 ("4.2","Taxas de gateway/adquirente","Despesas Variáveis",-1,"Variável"),
 ("4.3","Custo de antecipação","Despesas Variáveis",-1,"Variável"),
 ("4.4","Frete de envio","Despesas Variáveis",-1,"Variável"),
 ("4.5","Logística reversa","Despesas Variáveis",-1,"Variável"),
 ("4.6","Embalagens","Despesas Variáveis",-1,"Variável"),
 ("5.1","Meta Ads","Marketing",-1,"Semi-variável"),
 ("5.2","Google Ads","Marketing",-1,"Semi-variável"),
 ("5.3","Ads de marketplace","Marketing",-1,"Semi-variável"),
 ("5.4","Influenciadores/afiliados","Marketing",-1,"Semi-variável"),
 ("5.5","Ferramentas de marketing","Marketing",-1,"Fixo"),
 ("6.1","Folha + encargos + benefícios","Despesas Fixas",-1,"Fixo"),
 ("6.2","Pró-labore","Despesas Fixas",-1,"Fixo"),
 ("6.3","Aluguel / CD","Despesas Fixas",-1,"Fixo"),
 ("6.4","Sistemas (ERP, plataforma)","Despesas Fixas",-1,"Fixo"),
 ("6.5","Contabilidade / jurídico","Despesas Fixas",-1,"Fixo"),
 ("6.6","Outras despesas administrativas","Despesas Fixas",-1,"Fixo"),
 ("7.1","Depreciação","Depreciação",-1,"Fixo"),
 ("8.1","Juros de empréstimos","Resultado Financeiro",-1,"Financeiro"),
 ("8.2","Tarifas bancárias","Resultado Financeiro",-1,"Financeiro"),
 ("8.3","Rendimentos de aplicações","Resultado Financeiro",1,"Financeiro"),
 ("9.1","IRPJ / CSLL","IR/CSLL",-1,"Imposto s/ lucro"),
 ("10.1","Compra de mercadorias (estoque)","Fora da DRE - Operacional",-1,"Caixa"),
 ("11.1","Compra de imobilizado","Investimento",-1,"Caixa"),
 ("11.2","Venda de ativos","Investimento",1,"Caixa"),
 ("12.1","Empréstimos captados","Financiamento",1,"Caixa"),
 ("12.2","Amortização de empréstimos","Financiamento",-1,"Caixa"),
 ("12.3","Aporte de sócios","Financiamento",1,"Caixa"),
 ("12.4","Distribuição de lucros","Financiamento",-1,"Caixa"),
]
ws = sheet("Plano de Contas", "Plano de Contas Gerencial",
           "Sinal: +1 soma no resultado, -1 subtrai. Grupos 'Investimento'/'Financiamento'/'Fora da DRE' não entram na DRE (vão para a DFC).")
header(ws, 4, ["Código", "Categoria", "Grupo", "Sinal", "Natureza"])
for i, r in enumerate(PLANO, start=5):
    for j, v in enumerate(r, start=1): ws.cell(row=i, column=j, value=v)
for col, w in zip("ABCDE", [8, 40, 28, 7, 16]): ws.column_dimensions[col].width = w
PC_LAST = 4 + len(PLANO) + 40  # espaço para novas categorias

# ------------------------------------------------------------------ LANÇAMENTOS
ws = sheet("Lançamentos", "Lançamentos (base de dados)",
           "Valores SEMPRE positivos — o sinal vem do Plano de Contas. Colunas cinza (I-L) são automáticas.")
header(ws, 4, ["Data competência", "Data caixa", "Descrição", "Categoria", "Canal", "Valor (R$)", "Status", "Conta bancária",
               "Mês", "Grupo", "Valor DRE", "Ano"])
def d(m): return dt.date(ANO, m, 30 if m in (4, 6, 9, 11) else 31)
lan = []
def add(m, cat, canal, v, desc=""):
    lan.append((d(m), d(m), desc or f"{cat} — {canal}", cat, canal, round(v * 1000, 2), "Realizado", "Banco principal"))
# --- Setembro (R$ mil)
for canal, rb, cmv, com, gw, fr, emb in [("Site Próprio",437.5,133,0,10.5,21,3.5),("Mercado Livre",275,83.6,39.6,0,16,2.2),("Shopee",162.5,49.4,26,0,12.9,1.3)]:
    add(9,"Vendas de mercadorias",canal,rb); add(9,"Devoluções e cancelamentos",canal,rb*0.04); add(9,"Impostos sobre vendas",canal,rb*0.16)
    add(9,"CMV - Custo das mercadorias vendidas",canal,cmv)
    if com: add(9,"Comissões de marketplace",canal,com)
    if gw: add(9,"Taxas de gateway/adquirente",canal,gw)
    add(9,"Frete de envio",canal,fr); add(9,"Embalagens",canal,emb)
add(9,"Meta Ads","Site Próprio",50); add(9,"Google Ads","Site Próprio",23)
add(9,"Ads de marketplace","Mercado Livre",10); add(9,"Ads de marketplace","Shopee",15)
for cat, v in [("Folha + encargos + benefícios",80),("Pró-labore",20),("Aluguel / CD",15),("Sistemas (ERP, plataforma)",8),("Contabilidade / jurídico",5),
               ("Depreciação",4),("Juros de empréstimos",11),("IRPJ / CSLL",15)]:
    add(9,cat,"Geral",v)
# --- Outubro
for canal, rb, cmv, com, gw, fr, emb in [("Site Próprio",500,160,0,12,20,4),("Mercado Livre",312.5,100,45,0,15,2.5),("Shopee",187.5,66,30,0,13,1.5)]:
    add(10,"Vendas de mercadorias",canal,rb); add(10,"Devoluções e cancelamentos",canal,rb*0.04); add(10,"Impostos sobre vendas",canal,rb*0.16)
    add(10,"CMV - Custo das mercadorias vendidas",canal,cmv)
    if com: add(10,"Comissões de marketplace",canal,com)
    if gw: add(10,"Taxas de gateway/adquirente",canal,gw)
    add(10,"Frete de envio",canal,fr); add(10,"Embalagens",canal,emb)
add(10,"Meta Ads","Site Próprio",60); add(10,"Google Ads","Site Próprio",30)
add(10,"Ads de marketplace","Mercado Livre",15); add(10,"Ads de marketplace","Shopee",25)
for cat, v in [("Folha + encargos + benefícios",80),("Pró-labore",20),("Aluguel / CD",15),("Sistemas (ERP, plataforma)",9),("Contabilidade / jurídico",6),
               ("Depreciação",4),("Juros de empréstimos",12),("IRPJ / CSLL",15),
               ("Compra de imobilizado",20),("Empréstimos captados",80),("Amortização de empréstimos",25),("Distribuição de lucros",30)]:
    add(10,cat,"Geral",v)
N_ROWS = 2000
for i in range(5, 5 + N_ROWS):
    if i - 5 < len(lan):
        for j, v in enumerate(lan[i - 5], start=1):
            c = ws.cell(row=i, column=j, value=v)
            if j <= 2: c.number_format = "dd/mm/yyyy"
            if j == 6: c.number_format = '#,##0.00'
    ws.cell(row=i, column=9, value=f'=IF(A{i}="","",MONTH(A{i}))')
    ws.cell(row=i, column=10, value=f'=IF(D{i}="","",IFERROR(INDEX(\'Plano de Contas\'!$C$5:$C${PC_LAST},MATCH(D{i},\'Plano de Contas\'!$B$5:$B${PC_LAST},0)),"⚠ categoria inválida"))')
    ws.cell(row=i, column=11, value=f'=IF(D{i}="","",F{i}*IFERROR(INDEX(\'Plano de Contas\'!$D$5:$D${PC_LAST},MATCH(D{i},\'Plano de Contas\'!$B$5:$B${PC_LAST},0)),0))')
    ws.cell(row=i, column=12, value=f'=IF(A{i}="","",YEAR(A{i}))')
    ws.cell(row=i, column=11).number_format = '#,##0.00;(#,##0.00)'
    for j in range(9, 13): ws.cell(row=i, column=j).font = Font(color="777777")
LAST = 4 + N_ROWS
dv_cat = DataValidation(type="list", formula1=f"='Plano de Contas'!$B$5:$B${PC_LAST}", allow_blank=True)
dv_can = DataValidation(type="list", formula1=f"=Config!$A$12:$A$16", allow_blank=True)
dv_st = DataValidation(type="list", formula1='"Realizado,Previsto"', allow_blank=True)
for v, rng in [(dv_cat, f"D5:D{LAST}"), (dv_can, f"E5:E{LAST}"), (dv_st, f"G5:G{LAST}")]:
    ws.add_data_validation(v); v.add(rng)
for col, w in zip("ABCDEFGHIJKL", [14, 12, 44, 36, 16, 14, 11, 16, 6, 24, 14, 7]): ws.column_dimensions[col].width = w
ws.freeze_panes = "A5"
ws.auto_filter.ref = f"A4:L{LAST}"
R = lambda col: f"Lançamentos!${col}$5:${col}${LAST}"
LK, LD, LE, LI, LJ, LL = R("K"), R("D"), R("E"), R("I"), R("J"), R("L")

# ------------------------------------------------------------------ DRE
ws = sheet("DRE", "DRE Gerencial — regime de competência", "Valores em R$. Colunas P–S mostram o mês de análise (Config) com análise vertical e horizontal.")
ws["B3"] = "mês nº"; ws["B3"].font = GRAY
for m in range(1, 13): ws.cell(row=3, column=1 + m, value=m).font = GRAY
header(ws, 4, ["Linha"] + MESES + ["Total ano", "", "Mês análise", "% RL", "Mês anterior", "Var %"])
ws.cell(row=4, column=15).fill = PatternFill(None)
row = 5; ROW = {}
def dre_line(label, kind, arg=None, bold=False, fill=None, pct=False, key=None):
    global row
    ws.cell(row=row, column=1, value=label)
    for m in range(1, 13):
        col = MC(m)
        if kind == "cat":
            f = f"=SUMIFS({LK},{LD},$A{row},{LI},{col}$3,{LL},{CFG_ANO})"
        elif kind == "canal":
            f = f'=SUMIFS({LK},{LJ},"Receita Bruta",{LE},"{arg}",{LI},{col}$3,{LL},{CFG_ANO})'
        elif kind == "sum":
            f = "=" + "+".join(f"{col}{r}" for r in arg)
        elif kind == "range":
            f = f"=SUM({col}{arg[0]}:{col}{arg[1]})"
        elif kind == "pct":
            f = f"=IFERROR({col}{arg[0]}/{col}{arg[1]},0)"
        elif kind == "raw":
            f = "=" + arg.replace("#", col)
        ws.cell(row=row, column=1 + m, value=f)
    if kind == "pct":
        ws.cell(row=row, column=14, value=f"=IFERROR(N{arg[0]}/N{arg[1]},0)")
    elif kind == "raw":
        ws.cell(row=row, column=14, value="")
    else:
        ws.cell(row=row, column=14, value=f"=SUM(B{row}:M{row})")
    ws.cell(row=row, column=16, value=f"=INDEX(B{row}:M{row},{CFG_MES})")
    ws.cell(row=row, column=18, value=f'=IF({CFG_MES}>1,INDEX(B{row}:M{row},{CFG_MES}-1),"")')
    if not pct and kind != "raw":
        ws.cell(row=row, column=17, value=f"=IFERROR(P{row}/P$RLROW,0)")
        ws.cell(row=row, column=19, value=f'=IFERROR(IF(R{row}=0,"",P{row}/R{row}-1),"")')
    fmt = PCT if pct else NUM
    style_row(ws, row, 1, 14, fill=fill, font=B if bold else None, fmt=fmt)
    style_row(ws, row, 16, 19, fill=fill, font=B if bold else None, fmt=fmt)
    ws.cell(row=row, column=17).number_format = PCT; ws.cell(row=row, column=19).number_format = PCT
    if kind in ("cat", "canal"): ws.cell(row=row, column=1).alignment = Alignment(indent=2)
    if pct: ws.cell(row=row, column=1).font = Font(italic=True, color="555555")
    if key: ROW[key] = row
    r0 = row; row += 1; return r0

def group(label, cats, key):
    global row
    g = row; row += 1
    rows = [dre_line(c, "cat") for c in cats]
    saved = row; row = g
    dre_line(label, "range", (rows[0], rows[-1]), bold=True, fill=F_SUB, key=key)
    row = saved
    return g

cats_of = lambda grp: [p[1] for p in PLANO if p[2] == grp]
g_rb = row; row += 1
rb_rows = [dre_line(c, "canal", c) for c in CANAIS[:4]]
saved = row; row = g_rb; dre_line("RECEITA BRUTA", "range", (rb_rows[0], rb_rows[-1]), bold=True, fill=F_SUB, key="RB"); row = saved
group("(−) DEDUÇÕES", cats_of("Deduções"), "DED")
dre_line("(=) RECEITA LÍQUIDA", "sum", (ROW["RB"], ROW["DED"]), bold=True, fill=F_RES, key="RL")
group("(−) CMV", cats_of("CMV"), "CMV")
dre_line("(=) LUCRO BRUTO", "sum", (ROW["RL"], ROW["CMV"]), bold=True, fill=F_RES, key="LB")
dre_line("Margem bruta %", "pct", (ROW["LB"], ROW["RL"]), pct=True, key="MB%")
group("(−) DESPESAS VARIÁVEIS DE VENDA", cats_of("Despesas Variáveis"), "VAR")
dre_line("(=) MARGEM DE CONTRIBUIÇÃO", "sum", (ROW["LB"], ROW["VAR"]), bold=True, fill=F_RES, key="MC")
dre_line("Margem de contribuição %", "pct", (ROW["MC"], ROW["RL"]), pct=True, key="MC%")
group("(−) MARKETING", cats_of("Marketing"), "MKT")
dre_line("(=) MARGEM APÓS MARKETING", "sum", (ROW["MC"], ROW["MKT"]), bold=True, fill=F_RES, key="MAM")
dre_line("Margem após marketing %", "pct", (ROW["MAM"], ROW["RL"]), pct=True, key="MAM%")
group("(−) DESPESAS FIXAS", cats_of("Despesas Fixas"), "FIX")
dre_line("(=) EBITDA", "sum", (ROW["MAM"], ROW["FIX"]), bold=True, fill=F_RES, key="EBITDA")
dre_line("Margem EBITDA %", "pct", (ROW["EBITDA"], ROW["RL"]), pct=True, key="EBITDA%")
group("(−) DEPRECIAÇÃO", cats_of("Depreciação"), "DEP")
group("(±) RESULTADO FINANCEIRO", cats_of("Resultado Financeiro"), "FIN")
dre_line("(=) LUCRO ANTES DO IR", "sum", (ROW["EBITDA"], ROW["DEP"], ROW["FIN"]), bold=True, fill=F_RES, key="LAIR")
group("(−) IR/CSLL", cats_of("IR/CSLL"), "IR")
dre_line("(=) LUCRO LÍQUIDO", "sum", (ROW["LAIR"], ROW["IR"]), bold=True, fill=F_RES, key="LL")
dre_line("Margem líquida %", "pct", (ROW["LL"], ROW["RL"]), pct=True, key="ML%")
row += 1
ws.cell(row=row, column=1, value="PONTO DE EQUILÍBRIO").font = Font(bold=True, color=NAVY); row += 1
dre_line("Ponto de equilíbrio (Receita Líquida)", "raw", f'IFERROR(-#{ROW["FIX"]}/#{ROW["MAM%"]},0)', key="PE")
dre_line("Margem de segurança %", "raw", f'IFERROR(1-#{ROW["PE"]}/#{ROW["RL"]},0)', key="MS")
for m in range(1, 13): ws.cell(row=ROW["MS"], column=1 + m).number_format = PCT
for k in ("PE", "MS"):
    ws.cell(row=ROW[k], column=16).number_format = PCT if k == "MS" else NUM
    ws.cell(row=ROW[k], column=18).number_format = PCT if k == "MS" else NUM
# troca placeholder RLROW
for r in ws.iter_rows(min_row=5, max_row=row):
    for c in r:
        if isinstance(c.value, str) and "RLROW" in c.value: c.value = c.value.replace("RLROW", str(ROW["RL"]))
ws.column_dimensions["A"].width = 40
for c in range(2, 20): ws.column_dimensions[L(c)].width = 12
ws.column_dimensions["O"].width = 2
ws.freeze_panes = "B5"
DRE = lambda key, col: f"DRE!{col}{ROW[key]}"
DRE_SEL = lambda key: f"DRE!$P${ROW[key]}"

# ------------------------------------------------------------------ DRE POR CANAL
ws = sheet("DRE por Canal", "DRE por Canal — mês de análise", "Compare canais pela MARGEM DE CONTRIBUIÇÃO e MARGEM APÓS MARKETING. Não rateie despesas fixas.")
ws["A3"] = "Mês:"; ws["B3"] = f'=Config!C5&"/"&{CFG_ANO}'; ws["B3"].font = B
chs = CANAIS[:4]
header(ws, 5, ["Linha"] + chs + ["Total"])
rows_c = {}
def crow(label, key, by, crit=None, bold=False, fill=None, formula=None, pct=False):
    r = 6 + len(rows_c); rows_c[key] = r
    ws.cell(row=r, column=1, value=label)
    for j, ch in enumerate(chs, start=2):
        col = L(j)
        if formula:
            f = "=" + formula.replace("#", col)
        else:
            critcol = LJ if by == "grupo" else LD
            f = f'=SUMIFS({LK},{critcol},"{crit}",{LE},"{ch}",{LI},{CFG_MES},{LL},{CFG_ANO})'
        ws.cell(row=r, column=j, value=f)
    tcol = L(2 + len(chs))
    if pct and formula:
        ws.cell(row=r, column=2 + len(chs), value="=" + formula.replace("#", tcol))
    else:
        ws.cell(row=r, column=2 + len(chs), value=f"=SUM(B{r}:{L(1+len(chs))}{r})")
    style_row(ws, r, 1, 2 + len(chs), fill=fill, font=B if bold else None, fmt=PCT if pct else NUM)
    if not bold and not pct: ws.cell(row=r, column=1).alignment = Alignment(indent=2)
    if pct: ws.cell(row=r, column=1).font = Font(italic=True, color="555555")
crow("Receita Bruta", "rb", "grupo", "Receita Bruta", bold=True)
crow("(−) Devoluções", "dev", "cat", "Devoluções e cancelamentos")
crow("(−) Impostos sobre vendas", "imp", "cat", "Impostos sobre vendas")
crow("(=) Receita Líquida", "rl", None, formula="#{rb}+#{dev}+#{imp}".format(**{k: v for k, v in [("rb", 6), ("dev", 7), ("imp", 8)]}), bold=True, fill=F_RES)
crow("(−) CMV", "cmv", "grupo", "CMV")
crow("CMV % da RL", "cmv%", None, formula="IFERROR(-#10/#9,0)", pct=True)
for i, c in enumerate(cats_of("Despesas Variáveis")): crow(f"(−) {c}", f"v{i}", "cat", c)
r_v0, r_v1 = rows_c["v0"], rows_c[f"v{len(cats_of('Despesas Variáveis'))-1}"]
crow("(=) MARGEM DE CONTRIBUIÇÃO", "mc", None, formula=f"#9+#10+SUM(#{r_v0}:#{r_v1})", bold=True, fill=F_RES)
crow("Margem de contribuição %", "mc%", None, formula=f"IFERROR(#{rows_c['mc']}/#9,0)", pct=True)
crow("(−) Marketing", "mkt", "grupo", "Marketing")
crow("(=) MARGEM APÓS MARKETING", "mam", None, formula=f"#{rows_c['mc']}+#{rows_c['mkt']}", bold=True, fill=F_RES)
crow("Margem após marketing %", "mam%", None, formula=f"IFERROR(#{rows_c['mam']}/#9,0)", pct=True)
tot = L(2 + len(chs))
crow("Participação na receita líquida", "pr", None, formula=f"IFERROR(#9/${tot}$9,0)", pct=True)
crow("Participação na margem após mkt", "pm", None, formula=f"IFERROR(#{rows_c['mam']}/${tot}${rows_c['mam']},0)", pct=True)
ws.column_dimensions["A"].width = 38
for c in range(2, 7): ws.column_dimensions[L(c)].width = 16

# ------------------------------------------------------------------ FLUXO 13 SEMANAS
ws = sheet("Fluxo 13 Semanas", "Fluxo de Caixa Projetado — 13 semanas (regime de caixa)",
           "Atualize toda semana. Entradas pela agenda de recebíveis/repasses; saídas pelas contas a pagar já conhecidas.")
header(ws, 4, ["Linha"] + [f"Sem {i}" for i in range(1, 14)] + ["Total"])
ws.cell(row=5, column=1, value="Semana começando em").font = GRAY
for w in range(13):
    c = ws.cell(row=5, column=2 + w, value=f"={CFG_INI}+{7*w}"); c.number_format = "dd/mm"; c.font = GRAY
ENT = ["Repasses de marketplace", "Recebíveis de cartão", "Pix / boleto", "Antecipação de recebíveis", "Empréstimos / aportes"]
SAI = ["Fornecedores (estoque)", "Folha + pró-labore", "Impostos", "Marketing", "Frete / logística", "Aluguel e outras fixas", "Parcelas de empréstimo"]
data_ent = [[90,85,85,95,110,130,140,150,140,110,100,95,95],[70,70,65,70,90,100,110,110,100,90,85,80,80],[30,30,30,30,40,45,45,50,45,35,30,30,30],[0]*13,[0]*13]
data_sai = [[120,90,40,150,60,80,60,100,80,70,60,50,80],[0,100,0,0,0,100,0,0,160,0,0,100,0],[0,0,160,0,0,0,190,0,0,0,200,0,0],
            [30,30,35,35,40,40,40,45,40,30,30,30,30],[12,12,12,12,15,16,16,18,16,12,12,12,12],[15,10,10,10,10,10,10,10,15,10,10,10,10],[0,0,0,25,0,0,0,25,0,0,0,25,0]]
r = 6
ws.cell(row=r, column=1, value="SALDO INICIAL").font = B
for w in range(13):
    col = L(2 + w)
    ws.cell(row=r, column=2 + w, value=f"={CFG_SALDO}" if w == 0 else f"={L(1+w)}{{FIM}}")
style_row(ws, r, 1, 15, fill=F_SUB, font=B, fmt=NUM); R_INI = r; r += 1
ws.cell(row=r, column=1, value="(+) ENTRADAS").font = Font(bold=True, color="1A7F37"); r += 1
e0 = r
for name, vals in zip(ENT, data_ent):
    ws.cell(row=r, column=1, value=name).alignment = Alignment(indent=2)
    for w, v in enumerate(vals): c = ws.cell(row=r, column=2 + w, value=v * 1000); c.fill = F_INPUT
    ws.cell(row=r, column=15, value=f"=SUM(B{r}:N{r})"); style_row(ws, r, 2, 15, fmt=NUM); r += 1
ws.cell(row=r, column=1, value="Total entradas")
for w in range(14): col = L(2 + w); ws.cell(row=r, column=2 + w, value=f"=SUM({col}{e0}:{col}{r-1})")
style_row(ws, r, 1, 15, font=B, fmt=NUM); R_TE = r; r += 1
ws.cell(row=r, column=1, value="(−) SAÍDAS").font = Font(bold=True, color="B42318"); r += 1
s0 = r
for name, vals in zip(SAI, data_sai):
    ws.cell(row=r, column=1, value=name).alignment = Alignment(indent=2)
    for w, v in enumerate(vals): c = ws.cell(row=r, column=2 + w, value=v * 1000); c.fill = F_INPUT
    ws.cell(row=r, column=15, value=f"=SUM(B{r}:N{r})"); style_row(ws, r, 2, 15, fmt=NUM); r += 1
ws.cell(row=r, column=1, value="Total saídas")
for w in range(14): col = L(2 + w); ws.cell(row=r, column=2 + w, value=f"=SUM({col}{s0}:{col}{r-1})")
style_row(ws, r, 1, 15, font=B, fmt=NUM); R_TS = r; r += 1
ws.cell(row=r, column=1, value="SALDO FINAL")
for w in range(13): col = L(2 + w); ws.cell(row=r, column=2 + w, value=f"={col}{R_INI}+{col}{R_TE}-{col}{R_TS}")
style_row(ws, r, 1, 15, fill=F_RES, font=B, fmt=NUM); R_FIM = r; r += 1
ws.cell(row=r, column=1, value="Caixa mínimo")
for w in range(13): ws.cell(row=r, column=2 + w, value=f"={CFG_CXMIN}")
style_row(ws, r, 1, 15, fmt=NUM); R_MIN = r; r += 1
ws.cell(row=r, column=1, value="Folga / (falta) de caixa")
for w in range(13): col = L(2 + w); ws.cell(row=r, column=2 + w, value=f"={col}{R_FIM}-{col}{R_MIN}")
style_row(ws, r, 1, 15, font=B, fmt=NUM); R_FOLGA = r; r += 1
ws.cell(row=r, column=1, value="Status")
for w in range(13):
    col = L(2 + w)
    ws.cell(row=r, column=2 + w, value=f'=IF({col}{R_FIM}<0,"🚨 NEGATIVO",IF({col}{R_FIM}<{col}{R_MIN},"⚠ abaixo","ok"))')
    ws.cell(row=r, column=2 + w).alignment = Alignment(horizontal="center")
R_ST = r; r += 2
for w in range(1, 13):
    ws.cell(row=R_INI, column=2 + w).value = ws.cell(row=R_INI, column=2 + w).value.replace("{FIM}", str(R_FIM))
ws.cell(row=r, column=1, value="Menor saldo nas 13 semanas").font = B
ws.cell(row=r, column=2, value=f"=MIN(B{R_FIM}:N{R_FIM})").number_format = NUM; R_MENOR = r; r += 1
ws.cell(row=r, column=1, value="Semana do menor saldo").font = B
ws.cell(row=r, column=2, value=f'="Sem "&MATCH(B{R_MENOR},B{R_FIM}:N{R_FIM},0)'); R_SEMMENOR = r; r += 1
ws.cell(row=r, column=1, value="1ª semana abaixo do mínimo").font = B
ws.cell(row=r, column=2, value=f'=IFERROR("Sem "&MATCH(TRUE,INDEX(B{R_FIM}:N{R_FIM}<B{R_MIN}:N{R_MIN},0),0),"nenhuma")'); R_PRIM = r
ws.conditional_formatting.add(f"B{R_FIM}:N{R_FIM}", CellIsRule(operator="lessThan", formula=["0"], fill=PatternFill("solid", fgColor="F8D7DA"), font=Font(bold=True, color="B42318")))
ws.conditional_formatting.add(f"B{R_FOLGA}:N{R_FOLGA}", CellIsRule(operator="lessThan", formula=["0"], font=Font(bold=True, color="B42318")))
ws.column_dimensions["A"].width = 30
for c in range(2, 16): ws.column_dimensions[L(c)].width = 11
ws.freeze_panes = "B6"
FLX_MENOR, FLX_SEM, FLX_PRIM = f"'Fluxo 13 Semanas'!B{R_MENOR}", f"'Fluxo 13 Semanas'!B{R_SEMMENOR}", f"'Fluxo 13 Semanas'!B{R_PRIM}"

# ------------------------------------------------------------------ BALANÇO
ws = sheet("Balanço", "Balanço Patrimonial gerencial — saldo no último dia do mês",
           "Digite os saldos (amarelo). Fontes: extrato (caixa), agenda de recebíveis (receber), ERP (estoque), contas a pagar.")
header(ws, 4, ["Conta"] + MESES)
BAL = {}
bal_data = {
 "Caixa e bancos": {9: 150, 10: 105}, "Contas a receber": {9: 500, 10: 560}, "Estoque": {9: 810, 10: 900},
 "Impostos a recuperar": {9: 30, 10: 30}, "Outros ativos circulantes": {},
 "Imobilizado líquido": {9: 180, 10: 196}, "Outros ativos não circulantes": {},
 "Fornecedores": {9: 400, 10: 450}, "Impostos a pagar": {9: 100, 10: 106}, "Salários e encargos a pagar": {9: 60, 10: 60},
 "Empréstimos de curto prazo": {9: 130, 10: 150}, "Outras contas a pagar": {},
 "Empréstimos de longo prazo": {9: 170, 10: 205}, "Outros passivos não circulantes": {},
 "Patrimônio Líquido": {9: 810, 10: 820},
}
r = 5
def bline(label, key=None, inp=True, formula=None, bold=False, fill=None, fmt=NUM):
    global r
    ws.cell(row=r, column=1, value=label)
    for m in range(1, 13):
        col = MC(m)
        if inp:
            v = bal_data.get(label, {}).get(m)
            c = ws.cell(row=r, column=1 + m, value=v * 1000 if v is not None else None); c.fill = F_INPUT
        else:
            ws.cell(row=r, column=1 + m, value="=" + formula.replace("#", col))
    style_row(ws, r, 1, 13, fill=fill if not inp else None, font=B if bold else None, fmt=fmt)
    if inp:
        ws.cell(row=r, column=1).alignment = Alignment(indent=2)
        for m in range(1, 13): ws.cell(row=r, column=1 + m).fill = F_INPUT
    BAL[key or label] = r; r += 1
def sect(t):
    global r
    ws.cell(row=r, column=1, value=t).font = Font(bold=True, color=NAVY); r += 1
sect("ATIVO")
for k in ["Caixa e bancos", "Contas a receber", "Estoque", "Impostos a recuperar", "Outros ativos circulantes"]: bline(k)
bline("(=) Ativo Circulante", "AC", False, f"SUM(#{BAL['Caixa e bancos']}:#{BAL['Outros ativos circulantes']})", True, F_SUB)
for k in ["Imobilizado líquido", "Outros ativos não circulantes"]: bline(k)
bline("(=) Ativo Não Circulante", "ANC", False, f"#{BAL['Imobilizado líquido']}+#{BAL['Outros ativos não circulantes']}", True, F_SUB)
bline("TOTAL DO ATIVO", "AT", False, f"#{BAL['AC']}+#{BAL['ANC']}", True, F_RES)
r += 1; sect("PASSIVO E PATRIMÔNIO LÍQUIDO")
for k in ["Fornecedores", "Impostos a pagar", "Salários e encargos a pagar", "Empréstimos de curto prazo", "Outras contas a pagar"]: bline(k)
bline("(=) Passivo Circulante", "PC", False, f"SUM(#{BAL['Fornecedores']}:#{BAL['Outras contas a pagar']})", True, F_SUB)
for k in ["Empréstimos de longo prazo", "Outros passivos não circulantes"]: bline(k)
bline("(=) Passivo Não Circulante", "PNC", False, f"#{BAL['Empréstimos de longo prazo']}+#{BAL['Outros passivos não circulantes']}", True, F_SUB)
bline("Patrimônio Líquido")
bline("TOTAL PASSIVO + PL", "TP", False, f"#{BAL['PC']}+#{BAL['PNC']}+#{BAL['Patrimônio Líquido']}", True, F_RES)
bline("Conferência (deve ser zero)", "CHK", False, f"#{BAL['AT']}-#{BAL['TP']}", True)
ws.conditional_formatting.add(f"B{BAL['CHK']}:M{BAL['CHK']}", FormulaRule(formula=[f"ABS(B{BAL['CHK']})>1"], fill=PatternFill("solid", fgColor="F8D7DA")))
r += 1; sect("INDICADORES")
G = lambda k: f"#{BAL[k]}"
ATIVO_OK = lambda expr: f'IF({G("AT")}=0,"",IFERROR({expr},""))'
bline("Liquidez corrente (AC ÷ PC)", "LC", False, ATIVO_OK(f"{G('AC')}/{G('PC')}"), fmt='0.00')
bline("Liquidez seca ((AC − Estoque) ÷ PC)", "LS", False, ATIVO_OK(f"({G('AC')}-{G('Estoque')})/{G('PC')}"), fmt='0.00')
bline("Liquidez imediata (Caixa ÷ PC)", "LI", False, ATIVO_OK(f"{G('Caixa e bancos')}/{G('PC')}"), fmt='0.00')
bline("Dívida bruta (empréstimos)", "DB", False, ATIVO_OK(f"{G('Empréstimos de curto prazo')}+{G('Empréstimos de longo prazo')}"))
bline("Dívida líquida (dívida − caixa)", "DL", False, ATIVO_OK(f"{G('DB')}-{G('Caixa e bancos')}"))
bline("Dívida líquida ÷ EBITDA anualizado", "DLE", False, ATIVO_OK(f"{G('DL')}/(DRE!#{ROW['EBITDA']}*12)"), fmt='0.00"x"')
bline("NCG — Necessidade de Capital de Giro", "NCG", False,
      ATIVO_OK(f"{G('Contas a receber')}+{G('Estoque')}-{G('Fornecedores')}-{G('Impostos a pagar')}-{G('Salários e encargos a pagar')}"))
ws.column_dimensions["A"].width = 42
for c in range(2, 14): ws.column_dimensions[L(c)].width = 12
ws.freeze_panes = "B5"
BB = lambda k, col: f"Balanço!{col}{BAL[k]}"

# ------------------------------------------------------------------ DFC
ws = sheet("DFC", "DFC — Demonstração do Fluxo de Caixa (método indireto)",
           "Calculada da DRE + variação do Balanço (mês atual vs anterior) + lançamentos de investimento/financiamento.")
header(ws, 4, ["Linha"] + MESES)
DF = {}; r = 5
def prev(col): return L(max(2, (ord(col) - 64) - 1)) if len(col) == 1 else col
def dline(label, key, fn, bold=False, fill=None, indent=False):
    global r
    ws.cell(row=r, column=1, value=label)
    for m in range(1, 13):
        col = MC(m); pc = MC(m - 1) if m > 1 else None
        if m == 1:
            ws.cell(row=r, column=1 + m, value='=""')
        else:
            guard = f'IF(OR(Balanço!{col}{BAL["AT"]}=0,Balanço!{pc}{BAL["AT"]}=0),"",'
            ws.cell(row=r, column=1 + m, value="=" + guard + fn(col, pc) + ")")
    style_row(ws, r, 1, 13, fill=fill, font=B if bold else None, fmt=NUM)
    if indent: ws.cell(row=r, column=1).alignment = Alignment(indent=2)
    DF[key] = r; r += 1
def delta(k, sign):  # sign -1 para ativo, +1 para passivo
    return lambda c, p: f"{'-' if sign < 0 else ''}({BB(k, c)}-{BB(k, p)})"
ws.cell(row=r, column=1, value="OPERACIONAL").font = Font(bold=True, color=NAVY); r += 1
dline("Lucro líquido (DRE)", "LL", lambda c, p: f"DRE!{c}{ROW['LL']}", indent=True)
dline("(+) Depreciação", "DEP", lambda c, p: f"-DRE!{c}{ROW['DEP']}", indent=True)
dline("(±) Variação contas a receber", "dREC", delta("Contas a receber", -1), indent=True)
dline("(±) Variação estoque", "dEST", delta("Estoque", -1), indent=True)
dline("(±) Variação impostos a recuperar / outros AC", "dOAC", lambda c, p: f"-({BB('Impostos a recuperar', c)}+{BB('Outros ativos circulantes', c)}-{BB('Impostos a recuperar', p)}-{BB('Outros ativos circulantes', p)})", indent=True)
dline("(±) Variação fornecedores", "dFOR", delta("Fornecedores", 1), indent=True)
dline("(±) Variação impostos a pagar", "dIMP", delta("Impostos a pagar", 1), indent=True)
dline("(±) Variação salários / outras contas a pagar", "dOUT", lambda c, p: f"({BB('Salários e encargos a pagar', c)}+{BB('Outras contas a pagar', c)}-{BB('Salários e encargos a pagar', p)}-{BB('Outras contas a pagar', p)})", indent=True)
dline("(=) FLUXO DE CAIXA OPERACIONAL (FCO)", "FCO", lambda c, p: f"SUM({c}{DF['LL']}:{c}{DF['dOUT']})", True, F_RES)
r += 1
ws.cell(row=r, column=1, value="INVESTIMENTO").font = Font(bold=True, color=NAVY); r += 1
dline("(=) FLUXO DE CAIXA DE INVESTIMENTO (FCI)", "FCI", lambda c, p: f'SUMIFS({LK},{LJ},"Investimento",{LI},DRE!{c}$3,{LL},{CFG_ANO})', True, F_RES)
ws.cell(row=r, column=1, value="FINANCIAMENTO").font = Font(bold=True, color=NAVY); r += 1
dline("(=) FLUXO DE CAIXA DE FINANCIAMENTO (FCF)", "FCF", lambda c, p: f'SUMIFS({LK},{LJ},"Financiamento",{LI},DRE!{c}$3,{LL},{CFG_ANO})', True, F_RES)
r += 1
dline("(=) VARIAÇÃO DO CAIXA", "VAR", lambda c, p: f"{c}{DF['FCO']}+{c}{DF['FCI']}+{c}{DF['FCF']}", True, F_SUB)
dline("Caixa inicial (balanço anterior)", "CI", lambda c, p: BB("Caixa e bancos", p), indent=True)
dline("Caixa final calculado", "CF", lambda c, p: f"{c}{DF['CI']}+{c}{DF['VAR']}", indent=True)
dline("Caixa final no balanço", "CB", lambda c, p: BB("Caixa e bancos", c), indent=True)
dline("Diferença (deve ser zero)", "DIF", lambda c, p: f"{c}{DF['CF']}-{c}{DF['CB']}", True)
ws.conditional_formatting.add(f"C{DF['DIF']}:M{DF['DIF']}", FormulaRule(formula=[f'AND(C{DF["DIF"]}<>"",ABS(C{DF["DIF"]})>1)'], fill=PatternFill("solid", fgColor="F8D7DA")))
r += 1
ws.cell(row=r, column=1, value="Leitura do padrão").font = B
for m in range(2, 13):
    c = MC(m)
    ws.cell(row=r, column=1 + m, value=f'=IF({c}{DF["FCO"]}="","",IF({c}{DF["FCO"]}>=0,IF({c}{DF["FCF"]}<=0,"✅ Saudável","Cresce c/ dívida"),IF({c}{DF["FCF"]}>0,"⚠ Dívida financia operação","🚨 Queimando caixa")))')
    ws.cell(row=r, column=1 + m).alignment = Alignment(wrap_text=True, horizontal="center")
DF["LEIT"] = r
ws.column_dimensions["A"].width = 46
for c in range(2, 14): ws.column_dimensions[L(c)].width = 13
ws.freeze_panes = "B5"

# ------------------------------------------------------------------ CICLO FINANCEIRO
ws = sheet("Ciclo Financeiro", "Ciclo Financeiro e Capital de Giro (base 30 dias)",
           "PMR = Receber ÷ Receita Bruta × 30 | PME = Estoque ÷ CMV × 30 | PMP = Fornecedores ÷ Compras × 30")
header(ws, 4, ["Indicador"] + MESES)
CY = {}; r = 5
def cline(label, key, fn, fmt='0', bold=False, fill=None):
    global r
    ws.cell(row=r, column=1, value=label)
    for m in range(1, 13):
        c = MC(m); p = MC(m - 1) if m > 1 else None
        ws.cell(row=r, column=1 + m, value=f'=IF(Balanço!{c}{BAL["AT"]}=0,"",IFERROR({fn(c, p, m)},""))')
    style_row(ws, r, 1, 13, fill=fill, font=B if bold else None, fmt=fmt)
    CY[key] = r; r += 1
cline("Receita bruta do mês", "RB", lambda c, p, m: f"DRE!{c}{ROW['RB']}", NUM)
cline("CMV do mês", "CMV", lambda c, p, m: f"-DRE!{c}{ROW['CMV']}", NUM)
cline("Compras do mês (CMV + Δ estoque)", "COMP", lambda c, p, m: f"IF(Balanço!{p}{BAL['AT']}=0,\"\",{c}{CY['CMV']}+(Balanço!{c}{BAL['Estoque']}-Balanço!{p}{BAL['Estoque']}))" if m > 1 else '""', NUM)
cline("PMR — prazo médio de recebimento (dias)", "PMR", lambda c, p, m: f"Balanço!{c}{BAL['Contas a receber']}/{c}{CY['RB']}*30")
cline("PME — prazo médio de estoque (dias)", "PME", lambda c, p, m: f"Balanço!{c}{BAL['Estoque']}/{c}{CY['CMV']}*30")
cline("PMP — prazo médio de pagamento (dias)", "PMP", lambda c, p, m: f"Balanço!{c}{BAL['Fornecedores']}/{c}{CY['COMP']}*30")
cline("(=) Ciclo operacional (PMR + PME)", "CO", lambda c, p, m: f"{c}{CY['PMR']}+{c}{CY['PME']}", bold=True, fill=F_SUB)
cline("(=) CICLO FINANCEIRO (PMR + PME − PMP)", "CF", lambda c, p, m: f"{c}{CY['CO']}-{c}{CY['PMP']}", bold=True, fill=F_RES)
cline("Giro de estoque (vezes/ano)", "GIRO", lambda c, p, m: f"365/{c}{CY['PME']}", '0.0')
cline("Caixa liberado por 1 dia a menos de estoque (R$)", "DIA", lambda c, p, m: f"{c}{CY['CMV']}/30", NUM)
cline("NCG — Necessidade de Capital de Giro (R$)", "NCG", lambda c, p, m: f"Balanço!{c}{BAL['NCG']}", NUM)
ws.column_dimensions["A"].width = 48
for c in range(2, 14): ws.column_dimensions[L(c)].width = 12

# ------------------------------------------------------------------ KPIs
ws = sheet("KPIs", "Dashboard de KPIs de e-commerce", "Amarelo = dados operacionais (ERP, plataforma, Analytics). O resto vem da DRE/Balanço.")
header(ws, 4, ["KPI"] + MESES + ["Referência"])
K = {}; r = 5
kin = {"Pedidos": {9: 4400, 10: 5000}, "Clientes novos": {9: 1600, 10: 2000}, "Sessões do site": {9: 90000, 10: 100000},
       "Pedidos do site": {9: 1800, 10: 2000}, "Compras por cliente em 12 meses": {9: 2.5, 10: 2.5}, "Estoque parado 90+ dias (R$)": {9: 150000, 10: 180000}}
ws.cell(row=r, column=1, value="DADOS DE ENTRADA").font = Font(bold=True, color=NAVY); r += 1
for k, vals in kin.items():
    ws.cell(row=r, column=1, value=k).alignment = Alignment(indent=2)
    for m in range(1, 13):
        c = ws.cell(row=r, column=1 + m, value=vals.get(m)); c.fill = F_INPUT
        c.number_format = '0.0' if "Compras" in k else NUM
    K[k] = r; r += 1
r += 1; ws.cell(row=r, column=1, value="INDICADORES").font = Font(bold=True, color=NAVY); r += 1
def kline(label, key, fn, fmt, ref=""):
    global r
    ws.cell(row=r, column=1, value=label)
    for m in range(1, 13):
        c = MC(m)
        ws.cell(row=r, column=1 + m, value=f'=IF(OR({c}{K["Pedidos"]}="",{c}{K["Pedidos"]}=0),"",IFERROR({fn(c)},""))')
    style_row(ws, r, 1, 14, fmt=fmt); ws.cell(row=r, column=14, value=ref).font = GRAY
    K[key] = r; r += 1
D = lambda k, c: f"DRE!{c}{ROW[k]}"
kline("Ticket médio (R$)", "TM", lambda c: f"{D('RB', c)}/{c}{K['Pedidos']}", MOEDA)
kline("Taxa de devolução", "DEV", lambda c: f"-DRE!{c}{ROW['DED']+1}/{D('RB', c)}", PCT, "< 5–8% (moda)")
kline("CAC — custo de aquisição (R$)", "CAC", lambda c: f"-{D('MKT', c)}/{c}{K['Clientes novos']}", MOEDA, "tendência estável/queda")
kline("MER — receita bruta ÷ marketing", "MER", lambda c: f"{D('RB', c)}/-{D('MKT', c)}", '0.0"x"', "> ROAS de equilíbrio")
kline("ROAS de equilíbrio", "ROASEQ", lambda c: f"1/({D('MC', c)}/{D('RB', c)})", '0.0"x"', "abaixo disso = prejuízo")
kline("Margem de contribuição por pedido (R$)", "MCP", lambda c: f"{D('MC', c)}/{c}{K['Pedidos']}", MOEDA)
kline("LTV em margem (R$)", "LTV", lambda c: f"{c}{K['MCP']}*{c}{K['Compras por cliente em 12 meses']}", MOEDA)
kline("LTV ÷ CAC", "LTVCAC", lambda c: f"{c}{K['LTV']}/{c}{K['CAC']}", '0.0"x"', "≥ 3x")
kline("Payback do CAC (nº de pedidos)", "PAY", lambda c: f"{c}{K['CAC']}/{c}{K['MCP']}", '0.0', "≤ 1 ideal")
kline("% pedidos de recompra", "REC", lambda c: f"({c}{K['Pedidos']}-{c}{K['Clientes novos']})/{c}{K['Pedidos']}", PCT)
kline("Taxa de conversão do site", "CONV", lambda c: f"{c}{K['Pedidos do site']}/{c}{K['Sessões do site']}", '0.00%', "1–2% moda")
kline("Giro de estoque (vezes/ano)", "GIRO", lambda c: f"'Ciclo Financeiro'!{c}{CY['GIRO']}", '0.0')
kline("% estoque parado 90+ dias", "PAR", lambda c: f"{c}{K['Estoque parado 90+ dias (R$)']}/Balanço!{c}{BAL['Estoque']}", PCT, "< 20%")
ws.conditional_formatting.add(f"B{K['LTVCAC']}:M{K['LTVCAC']}", FormulaRule(formula=[f'AND(B{K["LTVCAC"]}<>"",B{K["LTVCAC"]}<3)'], font=Font(bold=True, color="B42318")))
ws.column_dimensions["A"].width = 42
for c in range(2, 14): ws.column_dimensions[L(c)].width = 11
ws.column_dimensions["N"].width = 24

# ------------------------------------------------------------------ ORÇAMENTO
ws = sheet("Orçamento", "Orçamento anual (metas)", "Digite em R$ (custos positivos). Revise a cada trimestre (forecast).")
header(ws, 4, ["Linha"] + MESES + ["Total"])
orc = {"Receita Líquida": {9: 720, 10: 850, 11: 1100, 12: 1000},
       "CMV": {9: 280.8, 10: 340, 11: 440, 12: 400},
       "Despesas variáveis": {9: 129.6, 10: 153, 11: 198, 12: 180},
       "Marketing": {9: 100.8, 10: 119, 11: 165, 12: 140},
       "Despesas fixas": {9: 125, 10: 125, 11: 130, 12: 130}}
O = {}; r = 5
for k, vals in orc.items():
    ws.cell(row=r, column=1, value=k)
    for m in range(1, 13):
        v = vals.get(m); c = ws.cell(row=r, column=1 + m, value=v * 1000 if v else None); c.fill = F_INPUT; c.number_format = NUM
    ws.cell(row=r, column=14, value=f"=SUM(B{r}:M{r})").number_format = NUM
    O[k] = r; r += 1
for label, key, f, fmt in [("(=) Margem de contribuição", "MC", "#5-#6-#7", NUM), ("Margem de contribuição %", "MC%", "IFERROR(#{MC}/#5,0)", PCT),
                           ("(=) EBITDA", "EBITDA", "#{MC}-#8-#9", NUM), ("Margem EBITDA %", "EB%", "IFERROR(#{EBITDA}/#5,0)", PCT)]:
    ws.cell(row=r, column=1, value=label)
    O[key] = r
    for m in range(1, 14):
        col = L(1 + m)
        ff = f.replace("{MC}", str(O.get("MC", 0))).replace("{EBITDA}", str(O.get("EBITDA", 0)))
        ws.cell(row=r, column=1 + m, value="=" + ff.replace("#", col))
    style_row(ws, r, 1, 14, fill=F_RES if fmt == NUM else None, font=B if fmt == NUM else Font(italic=True), fmt=fmt); r += 1
ws.column_dimensions["A"].width = 30
for c in range(2, 15): ws.column_dimensions[L(c)].width = 12

# ------------------------------------------------------------------ ORÇADO X REALIZADO
ws = sheet("Orçado x Realizado", "Orçado x Realizado — mês de análise", "Variação favorável em verde, desfavorável em vermelho.")
ws["A3"] = "Mês:"; ws["B3"] = f'=Config!C5&"/"&{CFG_ANO}'; ws["B3"].font = B
header(ws, 5, ["Linha", "Orçado", "Realizado", "Variação R$", "Variação %", "Leitura"])
OI = lambda k: f"INDEX(Orçamento!$B${O[k]}:$M${O[k]},{CFG_MES})"
lines = [("Receita Líquida", OI("Receita Líquida"), DRE_SEL("RL"), 1),
         ("CMV", OI("CMV"), f"-{DRE_SEL('CMV')}", -1),
         ("Despesas variáveis", OI("Despesas variáveis"), f"-{DRE_SEL('VAR')}", -1),
         ("Margem de contribuição", OI("MC"), DRE_SEL("MC"), 1),
         ("Marketing", OI("Marketing"), f"-{DRE_SEL('MKT')}", -1),
         ("Despesas fixas", OI("Despesas fixas"), f"-{DRE_SEL('FIX')}", -1),
         ("EBITDA", OI("EBITDA"), DRE_SEL("EBITDA"), 1)]
OX = {}
for i, (lab, o, rr, sg) in enumerate(lines, start=6):
    ws.cell(row=i, column=1, value=lab)
    ws.cell(row=i, column=2, value="=" + o); ws.cell(row=i, column=3, value="=" + rr)
    ws.cell(row=i, column=4, value=f"=C{i}-B{i}"); ws.cell(row=i, column=5, value=f'=IFERROR(C{i}/B{i}-1,"")')
    fav = f"D{i}>=0" if sg > 0 else f"D{i}<=0"
    ws.cell(row=i, column=6, value=f'=IF(B{i}=0,"sem orçamento",IF({fav},"🟢 favorável","🔴 desfavorável"))')
    bold = lab in ("Margem de contribuição", "EBITDA", "Receita Líquida")
    style_row(ws, i, 1, 6, fill=F_RES if bold else None, font=B if bold else None, fmt=NUM)
    ws.cell(row=i, column=5).number_format = PCT
    OX[lab] = i
i = 6 + len(lines) + 1
ws.cell(row=i, column=1, value="% sobre a receita").font = Font(bold=True, color=NAVY); i += 1
for lab in ["CMV", "Despesas variáveis", "Margem de contribuição", "Marketing", "Despesas fixas", "EBITDA"]:
    ws.cell(row=i, column=1, value=f"{lab} %")
    ws.cell(row=i, column=2, value=f"=IFERROR(B{OX[lab]}/B{OX['Receita Líquida']},0)")
    ws.cell(row=i, column=3, value=f"=IFERROR(C{OX[lab]}/C{OX['Receita Líquida']},0)")
    ws.cell(row=i, column=4, value=f"=C{i}-B{i}")
    style_row(ws, i, 1, 4, fmt=PCT); OX[lab + "%"] = i; i += 1
i += 1
ws.cell(row=i, column=1, value="DECOMPOSIÇÃO DA VARIAÇÃO DO EBITDA").font = Font(bold=True, color=NAVY); i += 1
header(ws, i, ["Efeito", "R$", "Como ler"]); i += 1
RLr, MCr = OX["Receita Líquida"], OX["Margem de contribuição%"]
dec = [("Volume (vendeu mais/menos)", f"=(C{RLr}-B{RLr})*B{MCr}", "diferença de receita × MC% orçada"),
       ("Margem (MC% melhor/pior)", f"=C{RLr}*(C{MCr}-B{MCr})", "receita real × diferença de MC%"),
       ("Marketing", f"=B{OX['Marketing']}-C{OX['Marketing']}", "gastou menos = positivo"),
       ("Despesas fixas", f"=B{OX['Despesas fixas']}-C{OX['Despesas fixas']}", "gastou menos = positivo")]
d0 = i
for lab, f, h in dec:
    ws.cell(row=i, column=1, value=lab); ws.cell(row=i, column=2, value=f); ws.cell(row=i, column=3, value=h).font = GRAY
    style_row(ws, i, 1, 2, fmt=NUM); i += 1
ws.cell(row=i, column=1, value="(=) Variação total do EBITDA"); ws.cell(row=i, column=2, value=f"=SUM(B{d0}:B{i-1})")
style_row(ws, i, 1, 2, fill=F_RES, font=B, fmt=NUM); i += 1
ws.cell(row=i, column=1, value="Conferência (deve ser zero)"); ws.cell(row=i, column=2, value=f"=B{i-1}-D{OX['EBITDA']}")
ws.cell(row=i, column=2).number_format = NUM
ws.column_dimensions["A"].width = 34
for c, w in zip("BCDEF", [16, 16, 16, 12, 18]): ws.column_dimensions[c].width = w

# ------------------------------------------------------------------ DASHBOARD
ws = sheet("Dashboard", "Painel do mês", None)
ws["A2"] = f'=Config!B3&" — "&Config!C5&"/"&{CFG_ANO}'; ws["A2"].font = Font(bold=True, size=12, color="555555")
def colsel(sheetname, rowno):
    return f"INDEX('{sheetname}'!$B${rowno}:$M${rowno},{CFG_MES})" if " " in sheetname else f"INDEX({sheetname}!$B${rowno}:$M${rowno},{CFG_MES})"
cards = [
 ("Receita líquida", DRE_SEL("RL"), MOEDA), ("Margem de contribuição", DRE_SEL("MC%"), PCT),
 ("EBITDA", DRE_SEL("EBITDA"), MOEDA), ("Margem EBITDA", DRE_SEL("EBITDA%"), PCT),
 ("Lucro líquido", DRE_SEL("LL"), MOEDA), ("Caixa no fim do mês", colsel("Balanço", BAL["Caixa e bancos"]), MOEDA),
 ("Menor saldo 13 semanas", FLX_MENOR, MOEDA), ("Ciclo financeiro (dias)", colsel("Ciclo Financeiro", CY["CF"]), '0'),
 ("CAC", colsel("KPIs", K["CAC"]), MOEDA), ("LTV ÷ CAC", colsel("KPIs", K["LTVCAC"]), '0.0"x"'),
 ("MER", colsel("KPIs", K["MER"]), '0.0"x"'), ("Ponto de equilíbrio (RL)", DRE_SEL("PE"), MOEDA),
]
for idx, (lab, f, fmt) in enumerate(cards):
    rr = 4 + (idx // 4) * 3; cc = 1 + (idx % 4) * 2
    a = ws.cell(row=rr, column=cc, value=lab); a.font = Font(size=9, color="FFFFFF", bold=True); a.fill = F_HEAD
    v = ws.cell(row=rr + 1, column=cc, value=f"=IFERROR({f},\"-\")"); v.font = Font(size=16, bold=True, color=NAVY); v.number_format = fmt; v.fill = F_SUB
    ws.merge_cells(start_row=rr, start_column=cc, end_row=rr, end_column=cc + 1)
    ws.merge_cells(start_row=rr + 1, start_column=cc, end_row=rr + 1, end_column=cc + 1)
r = 14
ws.cell(row=r, column=1, value="ALERTAS AUTOMÁTICOS").font = Font(bold=True, color=NAVY, size=12); r += 1
prevsel = lambda key: f"INDEX(DRE!$B${ROW[key]}:$M${ROW[key]},{CFG_MES}-1)"
alerts = [
 f'IF({FLX_MENOR}<{CFG_CXMIN},"🚨 Caixa: saldo projetado abaixo do mínimo a partir da "&{FLX_PRIM}&" (menor saldo na "&{FLX_SEM}&"). Agir agora: negociar fornecedores / rever compras.","✅ Caixa: projeção de 13 semanas acima do mínimo.")',
 f'IF({CFG_MES}=1,"",IF(-{DRE_SEL("CMV")}/{DRE_SEL("RL")}>-{prevsel("CMV")}/{prevsel("RL")}+0.01,"⚠ CMV subiu de "&TEXT(-{prevsel("CMV")}/{prevsel("RL")},"0.0%")&" para "&TEXT(-{DRE_SEL("CMV")}/{DRE_SEL("RL")},"0.0%")&" da receita. Verificar descontos, mix e custo de compra.","✅ CMV estável."))',
 f'IF({CFG_MES}=1,"",IF(-{DRE_SEL("MKT")}/{DRE_SEL("RL")}>-{prevsel("MKT")}/{prevsel("RL")}+0.01,"⚠ Marketing subiu de "&TEXT(-{prevsel("MKT")}/{prevsel("RL")},"0.0%")&" para "&TEXT(-{DRE_SEL("MKT")}/{DRE_SEL("RL")},"0.0%")&" da receita. Eficiência caindo.","✅ Marketing estável em % da receita."))',
 f'IF({CFG_MES}=1,"",IF(AND({DRE_SEL("RL")}>{prevsel("RL")},{DRE_SEL("EBITDA")}<{prevsel("EBITDA")}),"⚠ Receita cresceu mas o EBITDA caiu: crescimento comprado com margem.",""))',
 f'IFERROR(IF({colsel("KPIs", K["LTVCAC"])}<3,"⚠ LTV/CAC em "&TEXT({colsel("KPIs", K["LTVCAC"])},"0.0")&"x (referência ≥ 3x).","✅ LTV/CAC saudável."),"")',
 f'IFERROR(IF({colsel("KPIs", K["MER"])}<{colsel("KPIs", K["ROASEQ"])},"🚨 MER abaixo do ROAS de equilíbrio: marketing dando prejuízo.","✅ MER acima do ROAS de equilíbrio ("&TEXT({colsel("KPIs", K["ROASEQ"])},"0.0")&"x)."),"")',
 f'IFERROR(IF({colsel("Ciclo Financeiro", CY["CF"])}>60,"⚠ Ciclo financeiro de "&TEXT({colsel("Ciclo Financeiro", CY["CF"])},"0")&" dias — estoque de "&TEXT({colsel("Ciclo Financeiro", CY["PME"])},"0")&" dias é o principal vilão.","✅ Ciclo financeiro sob controle."),"")',
 f'IFERROR(IF({colsel("DFC", DF["FCO"])}<0,"⚠ Operação consumiu caixa no mês (FCO negativo) apesar do lucro na DRE.","✅ Operação gerou caixa."),"")',
 f'IFERROR(IF(ABS({colsel("Balanço", BAL["CHK"])})>1,"🚨 Balanço não fecha — revisar saldos.","✅ Balanço fechado."),"")',
]
for a in alerts:
    ws.cell(row=r, column=1, value="=" + a); ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=8); r += 1
r += 1
ws.cell(row=r, column=1, value="EVOLUÇÃO MENSAL").font = Font(bold=True, color=NAVY, size=12); r += 1
header(ws, r, ["Mês", "Receita líquida", "Margem contrib. %", "EBITDA", "EBITDA %", "Lucro líquido", "Caixa"]); r += 1
T0 = r
for m in range(1, 13):
    c = MC(m)
    vals = [MESES[m - 1], f"=DRE!{c}{ROW['RL']}", f"=DRE!{c}{ROW['MC%']}", f"=DRE!{c}{ROW['EBITDA']}", f"=DRE!{c}{ROW['EBITDA%']}",
            f"=DRE!{c}{ROW['LL']}", f"=Balanço!{c}{BAL['Caixa e bancos']}"]
    for j, v in enumerate(vals, start=1):
        cell = ws.cell(row=r, column=j, value=v); cell.number_format = PCT if j in (3, 5) else NUM; cell.border = BOT
    r += 1
ch = BarChart(); ch.title = "Receita líquida x EBITDA"; ch.height = 8; ch.width = 22
ch.add_data(Reference(ws, min_col=2, min_row=T0 - 1, max_row=T0 + 11), titles_from_data=True)
ch.add_data(Reference(ws, min_col=4, min_row=T0 - 1, max_row=T0 + 11), titles_from_data=True)
ch.set_categories(Reference(ws, min_col=1, min_row=T0, max_row=T0 + 11))
ws.add_chart(ch, f"J{T0 - 2}")
for c in range(1, 9): ws.column_dimensions[L(c)].width = 15

# ------------------------------------------------------------------ _API
ws = sheet("_API", "Dados para o sistema (não editar estrutura)", "Uma linha por mês. O app lê esta aba.")
cols = [("mes", None), ("receita_bruta", ("DRE", ROW["RB"])), ("receita_liquida", ("DRE", ROW["RL"])), ("cmv", ("DRE", ROW["CMV"])),
        ("lucro_bruto", ("DRE", ROW["LB"])), ("margem_contribuicao", ("DRE", ROW["MC"])), ("margem_contribuicao_pct", ("DRE", ROW["MC%"])),
        ("marketing", ("DRE", ROW["MKT"])), ("despesas_fixas", ("DRE", ROW["FIX"])), ("ebitda", ("DRE", ROW["EBITDA"])),
        ("ebitda_pct", ("DRE", ROW["EBITDA%"])), ("lucro_liquido", ("DRE", ROW["LL"])), ("ponto_equilibrio", ("DRE", ROW["PE"])),
        ("caixa", ("Balanço", BAL["Caixa e bancos"])), ("estoque", ("Balanço", BAL["Estoque"])), ("fco", ("DFC", DF["FCO"])),
        ("ciclo_financeiro_dias", ("'Ciclo Financeiro'", CY["CF"])), ("pedidos", ("KPIs", K["Pedidos"])), ("ticket_medio", ("KPIs", K["TM"])),
        ("cac", ("KPIs", K["CAC"])), ("ltv_cac", ("KPIs", K["LTVCAC"])), ("mer", ("KPIs", K["MER"]))]
for j, (name, _) in enumerate(cols, start=1):
    c = ws.cell(row=4, column=j, value=name); c.fill = F_HEAD; c.font = WHITE_B
for m in range(1, 13):
    ws.cell(row=4 + m, column=1, value=m)
    for j, (name, ref) in enumerate(cols[1:], start=2):
        ws.cell(row=4 + m, column=j, value=f"={ref[0]}!{MC(m)}{ref[1]}")
for j in range(1, len(cols) + 1): ws.column_dimensions[L(j)].width = 16

wb.move_sheet("Dashboard", offset=-(len(wb.sheetnames) - 2))
wb.active = 1
wb.save(OUT)
print("ok", OUT, ROW["RL"], ROW["EBITDA"])
