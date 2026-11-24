# Manual da Operação: como o serviço funciona na prática

> Que dados coletar, com que frequência, de onde vêm, quem faz o quê e **o que o cliente recebe** em cada etapa.
> Complementa: [README.md](README.md) (visão do serviço) e [guia-relatorios.md](guia-relatorios.md) (como preencher e analisar).

---

## 1. O princípio da operação

**Peça ACESSOS, não arquivos.**

Se o serviço depende de o cliente mandar planilhas e prints toda semana, ele atrasa, esquece, e o relatório chega tarde. O modelo que escala é este: o cliente dá **acesso de leitura** aos sistemas uma única vez, e a sua equipe busca os dados.

Assim o cliente só precisa responder poucas coisas, e quase todas são **decisões**, não dados:
- Confirmar pagamentos (aprovar no banco, se você não operar contas a pagar).
- Avisar sobre fatos novos: uma compra grande, uma contratação, um empréstimo, uma promoção.
- Participar da reunião mensal.

---

## 2. Implantação (onboarding): primeiros 30 a 45 dias

É o momento mais pesado e o mais importante. **Cobre por ele à parte** (taxa de implantação ou diagnóstico pago).

### 2.1 Acessos para solicitar no dia 1

| Sistema | Exemplos | Para quê | Tipo de acesso |
|---|---|---|---|
| **Banco(s)** | Itaú, Inter, BTG, Nubank PJ | Extratos, saldos, conciliação | Usuário só de consulta, ou envio de extrato OFX por integração/Open Finance |
| **ERP / gestão** | Bling, Tiny/Olist, Omie, Conta Azul | Vendas, notas fiscais, estoque, custo dos produtos, contas a pagar e receber | Usuário com perfil de consulta |
| **Plataforma do site** | Shopify, Nuvemshop, VTEX, Tray | Pedidos, sessões, conversão, cupons | Colaborador/consulta |
| **Marketplaces** | Mercado Livre, Shopee, Amazon, Magalu | Repasses, comissões, tarifas, devoluções, ads | Usuário secundário / colaborador |
| **Gateway / adquirente** | Pagar.me, Mercado Pago, PagBank, Stone, Cielo | Agenda de recebíveis, taxas, antecipações, chargebacks | Usuário de consulta |
| **Mídia paga** | Meta Ads, Google Ads, TikTok Ads | Investimento por canal e campanha | Acesso de analista ao gerenciador |
| **Analytics** | GA4 | Sessões, origem do tráfego | Leitor |
| **Contador** | Escritório contábil | Guias de impostos, folha, regime tributário, balancete | Contato direto + pasta compartilhada |
| **Logística** | Frenet, Melhor Envio, Intelipost, transportadoras | Custo de frete por pedido | Consulta |

> Faça um **termo de confidencialidade** e use acessos com permissão mínima (só leitura sempre que possível).

### 2.2 Informações para coletar uma vez (entrevista + documentos)

| Item | Por que importa |
|---|---|
| Contrato social, regime tributário (Simples, Presumido ou Real), CNPJs | Define como os impostos entram na DRE |
| Lista de contas bancárias e cartões corporativos | Para não faltar nenhuma movimentação |
| Empréstimos e financiamentos (contratos, taxas, parcelas, saldo devedor) | Balanço, DFC e fluxo de caixa |
| Contratos fixos (aluguel, sistemas, agências, fulfillment) | Despesas fixas e projeção |
| Folha: quantas pessoas, salários, benefícios, pró-labore | Despesas fixas |
| Política comercial: frete grátis, parcelamento, cupons, preços por canal | Explica a margem |
| Prazos com os fornecedores principais | Ciclo financeiro |
| Inventário de estoque atual (quantidade × custo) | Balanço e CMV inicial |
| **Histórico de 6 a 12 meses** (vendas, despesas, extratos) | DRE retroativa: é a base do diagnóstico |
| Metas do dono (crescimento, retirada desejada, plano de captação) | Orçamento e foco das análises |

### 2.3 Cronograma da implantação

| Semana | Atividade | Entrega ao cliente |
|---|---|---|
| **1** | Reunião de kickoff, acessos, entrevista com o dono, documentos | Checklist de acessos concluído |
| **2** | Montar o plano de contas sob medida, copiar o modelo da planilha, saldos iniciais | Plano de contas validado com o cliente |
| **3–4** | Reconstruir de 6 a 12 meses: DRE retroativa, DRE por canal, conciliação | — |
| **4** | Montar a primeira projeção de caixa de 13 semanas, o ciclo financeiro e os KPIs | **Alerta de caixa**, se houver risco |
| **5–6** | **Apresentação do diagnóstico**: onde o cliente ganha e onde perde dinheiro, e as 5 a 10 oportunidades encontradas | **Relatório de diagnóstico + plano de ação** |

> O diagnóstico é o "momento uau" que fecha o contrato mensal e justifica o preço. Exemplo de frase: "A Shopee responde por 19% da sua receita e só 7% do seu lucro" ou "Você vai ficar sem caixa na semana do dia 23".

---

## 3. A rotina recorrente: o que fazer em cada frequência

### Resumo

| Frequência | O que se coleta | O que se entrega | Esforço por cliente* |
|---|---|---|---|
| **Diária** | Saldos, extratos, vendas e recebimentos | Saldo consolidado, conciliação em dia | 15–30 min |
| **Semanal** | Contas a pagar e receber, agenda de recebíveis, compras previstas, ads | **Fluxo de caixa de 13 semanas atualizado + alerta** | 1–2 h |
| **Quinzenal** | Prévia da DRE do mês, marketing x vendas, estoque | **Prévia do mês** (curta, por mensagem) | 1–2 h |
| **Mensal** | Fechamento completo | **DRE, DRE por canal, balanço, DFC, KPIs, orçado x realizado + reunião** | 8–16 h |
| **Trimestral** | Inventário, revisão de metas | **Revisão estratégica + forecast** | 4–6 h |
| **Anual** | Orçamento do ano seguinte | **Orçamento anual + plano** | 10–20 h |

\* Estimativa para um e-commerce de porte médio (R$ 500 mil a R$ 3 milhões por mês), depois da implantação. Na prática, 1 analista atende de **6 a 10 clientes**, e 1 CFO (você) supervisiona de **10 a 20 clientes**, conduzindo as reuniões.

---

### 3.1 DIÁRIO: controle

| Dado | Fonte | Quem faz |
|---|---|---|
| Saldo e extrato de cada conta bancária | Banco | Analista |
| Vendas do dia por canal | ERP / plataforma | Analista (automático se houver integração) |
| Repasses que caíram dos marketplaces e do adquirente | Banco × relatório de repasse | Analista |
| Pagamentos feitos | Banco | Analista |
| Lançamentos novos na planilha (aba Lançamentos) | Classificação no plano de contas | Analista |

**Resultado:**
- Saldo de caixa **consolidado e conciliado** (o dono sabe exatamente quanto tem).
- Nenhum lançamento acumulado para o fim do mês, o que deixa o fechamento rápido.
- Identificação imediata de anomalias: repasse que não caiu, cobrança duplicada, chargeback.

> No começo, pode ser feito **3 vezes por semana** em vez de todos os dias. O importante é não acumular.

### 3.2 SEMANAL: caixa (a rotina mais valiosa do dia a dia)

| Dado | Fonte | Quem fornece |
|---|---|---|
| Agenda de recebíveis (cartão) | Adquirente/gateway | Analista |
| Repasses previstos dos marketplaces | Painel de cada marketplace | Analista |
| Contas a pagar das próximas semanas (boletos, fornecedores) | ERP / e-mail / pasta de boletos | **Cliente envia ou lança no ERP** |
| **Pedidos de compra de estoque planejados** | Comprador / dono | **Cliente informa** (é o ponto mais crítico) |
| Gasto de ads da semana e o previsto | Meta / Google / marketplaces | Analista |
| Novos fatos: contratação, empréstimo, campanha, investimento | Dono | **Cliente informa** |

**Resultado (toda segunda ou terça-feira):**
- **Fluxo de caixa de 13 semanas atualizado.**
- Uma **mensagem curta para o dono** (WhatsApp ou e-mail), por exemplo:
  > "Caixa hoje: R$ 163 mil. Próximas 4 semanas: atenção na semana do dia 23, quando o pedido de Natal e o DAS caem juntos. O saldo fica negativo em R$ 8 mil. Sugestão: dividir o pedido do fornecedor X em 2 parcelas. Posso negociar?"
- Recomendação de **quando antecipar ou não** recebíveis, e quanto isso custa.

### 3.3 QUINZENAL: prévia do resultado

| Dado | Fonte |
|---|---|
| Vendas acumuladas do mês por canal | ERP / plataforma |
| CMV parcial (custo médio × itens vendidos) | ERP |
| Marketing acumulado × vendas (MER, CAC parcial) | Ads + ERP |
| Estoque: posição e itens parados | ERP |

**Resultado:**
- **Prévia do mês:** "A meta de receita está em 48% na metade do mês; a margem de contribuição está em 40% (meta: 42%)."
- Uma **correção de rota ainda dentro do mês**: segurar desconto, pausar campanha ruim, empurrar a venda de estoque parado.

> É isso que diferencia o "relatório que conta o passado" de uma gestão que muda o resultado.

### 3.4 MENSAL: fechamento e reunião (o coração do serviço)

**Do dia útil 1 ao 10 do mês seguinte.** Calendário detalhado no [guia, seção 8](guia-relatorios.md#8-rotina-mensal).

| Dado | Fonte | Quem fornece |
|---|---|---|
| Extratos completos do mês | Banco | Analista |
| Relatórios de liquidação dos marketplaces (comissões, tarifas, devoluções, ads) | Marketplaces | Analista |
| Extrato do adquirente (taxas, antecipações, chargebacks) | Gateway | Analista |
| Vendas faturadas, devoluções, custo do que foi vendido | ERP | Analista |
| Posição do estoque no último dia (valor a custo) | ERP | Analista (+ validação do cliente) |
| Guias de impostos e folha do mês | **Contador** | Contador (você cobra o prazo) |
| Saldos em aberto: a receber, a pagar, empréstimos | ERP / banco | Analista |
| Dados operacionais: pedidos, clientes novos, sessões | Plataforma / GA4 | Analista |
| Explicação de fatos atípicos | Dono | **Cliente**, em 15 minutos de conversa |

**Resultado:**
1. **Pacote de relatórios:** DRE, DRE por canal, balanço, DFC, ciclo financeiro, KPIs, orçado x realizado.
2. **Painel atualizado** (planilha ou sistema) com os alertas.
3. **Reunião mensal de resultado** (60 a 90 minutos) com o dono, seguindo o roteiro do guia.
4. **Plano de ação** com 3 a 5 ações, cada uma com responsável e prazo. Na reunião seguinte, você cobra a execução.
5. Um **resumo executivo de 1 página** (o que aconteceu, por quê e o que fazer).

### 3.5 TRIMESTRAL: revisão estratégica

| Dado | Fonte |
|---|---|
| Inventário físico (ou contagem por amostragem da curva A) | Cliente/estoque |
| Resultado acumulado do trimestre | Planilha |
| Margem por SKU (curva ABC) | ERP |
| Mudanças de mercado, concorrência, novos canais | Dono |

**Resultado:**
- **Forecast:** revisão do orçamento para o restante do ano.
- **Análise de catálogo e preço:** SKUs para cortar, reajustar ou impulsionar.
- **Revisão tributária** com o contador: o regime ainda é o melhor?
- **Revisão de dívida:** troca de dívida cara por barata, renegociação.

### 3.6 ANUAL: planejamento

**Resultado:**
- **Orçamento do ano seguinte:** receita por canal e por mês, margens, marketing, contratações e caixa.
- Metas e indicadores para acompanhar o ano.
- Plano de investimento e, se for o caso, preparação para **captação ou venda da empresa** (valuation, *data room*).

---

## 4. Quem faz o quê (cliente x TB Finance)

| Atividade | Cliente | TB Finance |
|---|---|---|
| Dar acessos aos sistemas | ✅ uma vez | Solicita e organiza |
| Lançar boletos e pedidos de compra no ERP (ou mandar para uma pasta) | ✅ contínuo | Cobra se faltar |
| Informar fatos novos (compras grandes, contratações, empréstimos) | ✅ quando houver | Pergunta na rotina semanal |
| Conciliação, classificação e lançamentos | — | ✅ |
| Todos os relatórios e análises | — | ✅ |
| Projeção de caixa e alertas | — | ✅ |
| Reunião mensal | ✅ participa e decide | ✅ conduz |
| Executar as ações do plano | ✅ (ou a equipe dele) | Acompanha e cobra |
| Pagar contas e operar o banco | ✅ (*) | — (*) |
| Impostos e folha (obrigações legais) | Contador | Cobra e confere |

(*) Se quiser, pode virar um serviço adicional de **BPO** (contas a pagar e receber), operado por você ou por um parceiro. O foco do produto continua sendo gerencial e estratégico.

---

## 5. O que o cliente ganha: os resultados

### 5.1 Entregáveis (o que ele recebe)

| Quando | Entregável |
|---|---|
| Implantação | Diagnóstico financeiro + plano de ação inicial |
| Toda semana | Posição de caixa + projeção de 13 semanas + alerta |
| A cada quinzena | Prévia do mês com correção de rota |
| Todo mês | Pacote de relatórios + painel + reunião + plano de ação |
| A cada trimestre | Revisão estratégica + forecast + análise de catálogo e preço |
| Todo ano | Orçamento e metas |

### 5.2 Resultados de negócio (é isso que se vende)

| Resultado | Como acontece | Exemplo de impacto (e-commerce de R$ 1 milhão por mês) |
|---|---|---|
| **Mais margem** | DRE por canal, revisão de preço, de frete e de desconto, corte de SKUs ruins | +2 pp de margem = **R$ 20 mil por mês** |
| **Marketing mais eficiente** | ROAS de equilíbrio, CAC e LTV por canal, corte de campanhas que dão prejuízo | Cortar 10% da verba que não se paga = **R$ 13 mil por mês** |
| **Caixa liberado** | Redução de estoque parado, prazo com fornecedores, menos antecipação | −20 dias de estoque = **R$ 220 mil liberados uma vez** |
| **Menos custo financeiro** | Planejamento de caixa evita antecipação e cheque especial | Evitar antecipar R$ 200 mil a 2% = **R$ 4 mil por mês** |
| **Zero susto de caixa** | Alerta com 3 semanas de antecedência | Evita uma crise e decisões caras de última hora |
| **Decisão com dados** | Reunião mensal + plano de ação | O dono para de "achar" e passa a saber |
| **Empresa pronta para crescer, captar ou vender** | Histórico organizado, números confiáveis | Valuation melhor, crédito mais barato |

> **A conta para o cliente:** se o serviço custa R$ 12 mil por mês e gera R$ 35 mil ou mais por mês em margem e eficiência (mais o caixa liberado), o retorno é de cerca de 3x. É esse o argumento da apresentação de venda.

---

## 6. Indicadores da própria operação (para você controlar a qualidade)

| Indicador | Meta |
|---|---|
| Fechamento mensal entregue até | Dia útil 10 |
| Fluxo de 13 semanas atualizado | Toda semana, até terça-feira |
| Diferença na conciliação bancária | Zero |
| Ações do plano executadas pelo cliente | > 70% |
| Horas por cliente por mês | Acompanhar (base do preço) |
| Satisfação do cliente / renovação | NPS trimestral |

---

## 7. Checklist do primeiro contato com o cliente

- [ ] Faturamento mensal e canais de venda
- [ ] ERP e plataforma usados
- [ ] Bancos e adquirentes
- [ ] Quem cuida do financeiro hoje (o dono, um funcionário, ninguém?)
- [ ] O contador entrega o quê e quando?
- [ ] Qual a maior dor? (caixa apertado, não sabe se lucra, cresce mas não sobra dinheiro, quer captar ou vender)
- [ ] Tem empréstimos? Antecipa recebíveis?
- [ ] Quanto de estoque tem hoje e quantos dias de venda isso cobre?
- [ ] Qual a meta para os próximos 12 meses?
