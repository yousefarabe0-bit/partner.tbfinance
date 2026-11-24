# Guia completo dos relatórios financeiros

> Como preencher, como analisar e onde ficar atento em cada relatório.
> Todos os exemplos usam a mesma empresa fictícia, então os números batem entre um relatório e outro.

---

## Índice

0. [Fundamentos (leia antes de tudo)](#0-fundamentos)
1. [DRE Gerencial](#1-dre-gerencial)
2. [Fluxo de Caixa (diário + projeção de 13 semanas)](#2-fluxo-de-caixa)
3. [DFC: Demonstração do Fluxo de Caixa](#3-dfc)
4. [Balanço Patrimonial](#4-balanço-patrimonial)
5. [Ciclo Financeiro e Capital de Giro](#5-ciclo-financeiro)
6. [Dashboard de KPIs de e-commerce](#6-dashboard-de-kpis)
7. [Orçado x Realizado](#7-orçado-x-realizado)
8. [Rotina mensal e reunião com o cliente](#8-rotina-mensal)
9. [Glossário rápido](#9-glossário)

---

## A empresa do exemplo

**Loja Exemplo Ltda.**: e-commerce de moda que vende no site próprio, no Mercado Livre e na Shopee.
Mês analisado: **outubro**. Valores em **R$ mil**.

- Faturamento bruto: R$ 1 milhão por mês
- 5.000 pedidos no mês, sendo 2.000 de clientes novos
- Tem um empréstimo bancário e faz compras grandes de estoque para o Natal

---

<a id="0-fundamentos"></a>
## 0. Fundamentos

### 0.1 Competência x Caixa: o conceito mais importante de todos

| | Regime de **Competência** | Regime de **Caixa** |
|---|---|---|
| Pergunta que responde | "A empresa deu lucro?" | "A empresa tem dinheiro?" |
| Quando registra | Quando o fato acontece (a venda, o consumo) | Quando o dinheiro entra ou sai da conta |
| Relatório | **DRE** | **Fluxo de Caixa / DFC** |

**Exemplo:** você vende R$ 300 em 3x no cartão em outubro.
- DRE de outubro: receita de R$ 300 (a venda aconteceu em outubro).
- Caixa de outubro: entra R$ 100, ou zero se o adquirente paga em 30 dias.

> Os donos de e-commerce costumam confundir as duas coisas. "Faturei R$ 1 milhão e não tenho dinheiro" quase sempre se explica pela diferença entre competência e caixa: estoque, parcelamento e prazo de marketplace.

### 0.2 Plano de contas gerencial

É a lista de categorias onde cada lançamento é classificado. **Sem um plano de contas bem feito, nenhum relatório presta.**

Regras:
1. Ele espelha a estrutura da DRE (receitas, deduções, CMV, variáveis, marketing, fixas, financeiro).
2. Separe **custos variáveis** (sobem com as vendas) de **custos fixos** (não sobem).
3. Abra o detalhe onde o dinheiro é relevante. Exemplo: frete por canal, comissão por marketplace.
4. Não crie uma categoria "Outros" grande. Se "Outros" passar de 2% a 3% da receita, ela está escondendo algo.
5. O plano de contas **gerencial** é diferente do **contábil** (o do contador). O contábil serve ao fisco, o gerencial serve à decisão. Você vai usar o gerencial.

Modelo mínimo para e-commerce:

```
1. RECEITAS
   1.1 Vendas Site Próprio
   1.2 Vendas Mercado Livre
   1.3 Vendas Shopee
   1.4 Vendas Amazon / outros
2. DEDUÇÕES
   2.1 Devoluções e cancelamentos
   2.2 Impostos sobre vendas (Simples/DAS, ICMS, PIS, COFINS, DIFAL, ICMS-ST)
3. CMV
   3.1 Custo das mercadorias vendidas
4. DESPESAS VARIÁVEIS DE VENDA
   4.1 Comissões de marketplace (por canal)
   4.2 Taxas de gateway / adquirente
   4.3 Custo de antecipação de recebíveis
   4.4 Frete de envio (subsidiado pela loja)
   4.5 Frete de logística reversa
   4.6 Embalagens
   4.7 Fulfillment / armazenagem variável
5. MARKETING
   5.1 Meta Ads
   5.2 Google Ads
   5.3 Ads de marketplace (Mercado Ads, Shopee Ads)
   5.4 Influenciadores / afiliados
   5.5 Ferramentas de marketing
6. DESPESAS FIXAS
   6.1 Folha + encargos + benefícios
   6.2 Pró-labore
   6.3 Aluguel / CD / condomínio
   6.4 Sistemas (ERP, plataforma, hub)
   6.5 Contabilidade / jurídico
   6.6 Outras administrativas
7. RESULTADO FINANCEIRO
   7.1 Juros de empréstimos
   7.2 Tarifas bancárias
   7.3 Rendimentos de aplicação
8. IMPOSTOS SOBRE O LUCRO
   8.1 IRPJ / CSLL (só no Lucro Real ou Presumido)
9. NÃO OPERACIONAL / ABAIXO DA LINHA (não entra no lucro)
   9.1 Compra de equipamentos (investimento)
   9.2 Entrada / pagamento de empréstimos (principal)
   9.3 Distribuição de lucros
   9.4 Aporte de sócios
```

> **Atenção:** a compra de estoque **não é despesa**. Ela vira despesa (CMV) só quando o produto é vendido. Pagar o principal de um empréstimo também não é despesa, só os juros são. Retirada de sócio não é despesa, é distribuição de lucro. Errar isso distorce a DRE.

### 0.3 De onde vêm os dados

| Dado | Fonte |
|---|---|
| Vendas, pedidos, devoluções | ERP (Bling, Tiny/Olist, Omie) ou plataforma (Shopify, Nuvemshop, VTEX) |
| Comissões e tarifas de marketplace | Relatório de **repasse/liquidação** de cada marketplace |
| Taxas de cartão e antecipação | Extrato do gateway/adquirente (Pagar.me, Mercado Pago, PagBank, Stone) |
| Custo dos produtos (CMV) | ERP (custo médio por SKU) + notas fiscais de entrada |
| Estoque | ERP + inventário físico (no mínimo trimestral) |
| Marketing | Gerenciador do Meta Ads, Google Ads, painel de ads dos marketplaces |
| Folha, encargos, impostos | Contador (guias e folha) |
| Saldos e movimentações | **Extratos bancários** (a fonte da verdade do caixa) |

### 0.4 Conciliação: o passo que separa o amador do profissional

Antes de montar qualquer relatório, confira:
- O saldo do sistema é igual ao saldo do extrato bancário de cada conta?
- O que o marketplace diz que repassou é o que caiu no banco?
- As vendas do ERP batem com o que foi faturado em nota fiscal?

Se não bater, **o relatório está errado**, e o cliente vai perceber isso na primeira reunião.

---

<a id="1-dre-gerencial"></a>
## 1. DRE Gerencial

### O que é
É o resultado do período (mês, trimestre ou ano) pelo **regime de competência**. Responde se a empresa dá lucro e onde o dinheiro se perde.

### Como preencher, linha por linha

| Linha | Como calcular / de onde tirar | Erro comum |
|---|---|---|
| **Receita Bruta** | Total vendido no mês (pedidos faturados), com frete cobrado do cliente | Usar o valor *recebido* no banco (isso é caixa, não competência) |
| **Devoluções e cancelamentos** | Pedidos devolvidos ou cancelados no mês | Não registrar e inflar a receita |
| **Impostos sobre venda** | Simples (DAS) ou ICMS + PIS + COFINS + DIFAL. Pegar com o contador ou estimar pela alíquota efetiva | Esquecer o DIFAL nas vendas para outros estados |
| **Receita Líquida** | Receita Bruta − Devoluções − Impostos | Usar como base de % é o padrão; defina e mantenha |
| **CMV** | Custo de cada produto vendido (custo médio do ERP × quantidade) **ou** Estoque Inicial + Compras − Estoque Final | Lançar as *compras* do mês como CMV |
| **Despesas variáveis** | Comissão de marketplace, gateway, antecipação, frete subsidiado, embalagem | Esconder as comissões dentro de "receita líquida de marketplace" |
| **Marketing** | Todo investimento em aquisição | Lançar pelo pagamento do cartão em vez do mês do gasto |
| **Despesas fixas** | Folha, pró-labore, aluguel, sistemas, contador | Não incluir o pró-labore ("o dono não ganha salário"), o que infla o lucro |
| **Depreciação** | Desgaste de equipamentos (valor ÷ vida útil em meses) | Ignorar |
| **Resultado financeiro** | Juros pagos − rendimentos recebidos | Misturar a *parcela* do empréstimo (só os juros entram) |
| **IR/CSLL** | Só no Lucro Presumido ou Real. No Simples, já está no DAS | Contar o imposto duas vezes |

> **Sobre o CMV:** é o número mais difícil e mais importante de acertar. Se o custo no ERP estiver desatualizado (sem frete de compra, sem imposto não recuperável), a margem bruta fica errada. Valide o custo médio dos 20 produtos que mais vendem.

### Exemplo: Loja Exemplo, outubro (R$ mil)

| Linha | R$ mil | % RL |
|---|---:|---:|
| **Receita Bruta** | **1.000** | |
| (−) Devoluções e cancelamentos | (40) | |
| (−) Impostos sobre venda | (160) | |
| **= Receita Líquida (RL)** | **800** | **100,0%** |
| (−) CMV | (326) | 40,8% |
| **= Lucro Bruto** | **474** | **59,3%** |
| (−) Comissões de marketplace | (75) | 9,4% |
| (−) Gateway / adquirente | (12) | 1,5% |
| (−) Frete subsidiado | (48) | 6,0% |
| (−) Embalagens | (8) | 1,0% |
| **= Margem de Contribuição** | **331** | **41,4%** |
| (−) Marketing | (130) | 16,3% |
| **= Margem após Marketing** | **201** | **25,1%** |
| (−) Despesas fixas | (130) | 16,3% |
| **= EBITDA** | **71** | **8,9%** |
| (−) Depreciação | (4) | 0,5% |
| (−) Resultado financeiro (juros) | (12) | 1,5% |
| **= Lucro antes do IR** | **55** | **6,9%** |
| (−) IR/CSLL | (15) | 1,9% |
| **= Lucro Líquido** | **40** | **5,0%** |

### Como analisar

#### a) Análise vertical (cada linha como % da Receita Líquida)
Mostra **o peso de cada custo**. Leitura do exemplo:
- A cada R$ 100 vendidos (líquidos), R$ 41 vão para o produto, R$ 18 para custos de venda, R$ 16 para marketing e R$ 16 para a estrutura. Sobram cerca de R$ 9 de EBITDA e R$ 5 de lucro.
- O frete come 6% da receita. Vale investigar se o frete grátis está realmente trazendo conversão.

#### b) Análise horizontal (variação no tempo)
Compare o mês com o mês anterior e com o mesmo mês do ano anterior (por causa da sazonalidade).

| Linha | Setembro | Outubro | Variação |
|---|---:|---:|---:|
| Receita Líquida | 700 | 800 | **+14,3%** |
| CMV | 266 (38,0%) | 326 (40,8%) | **+22,6%** |
| Despesas variáveis | 133 | 143 | +7,5% |
| Margem de Contribuição | 301 (43,0%) | 331 (41,4%) | +10,0% |
| Marketing | 98 (14,0%) | 130 (16,3%) | **+32,7%** |
| Despesas fixas | 128 | 130 | +1,6% |
| **EBITDA** | **75** | **71** | **−5,3%** |

**Diagnóstico:** a receita cresceu 14%, mas o lucro caiu. Dois motivos:
1. O **CMV cresceu mais que a receita** (de 38% para 40,8%). Pode ser desconto agressivo, um mix de produtos mais barato ou aumento de custo do fornecedor.
2. O **marketing cresceu 33% para trazer 14% de receita**. A eficiência caiu, porque o custo de cada venda adicional ficou mais alto.

> É esse tipo de conclusão que o dono paga para ouvir. Ele vê "faturamento subiu" e acha que está tudo bem.

#### c) DRE por canal: a análise que mais gera valor

| R$ mil | Site Próprio | Mercado Livre | Shopee | **Total** |
|---|---:|---:|---:|---:|
| Receita Líquida | 400 | 250 | 150 | **800** |
| (−) CMV | (160) 40% | (100) 40% | (66) 44% | (326) |
| (−) Comissão | 0 | (45) 18% | (30) 20% | (75) |
| (−) Gateway | (12) 3% | 0 | 0 | (12) |
| (−) Frete | (20) 5% | (15) 6% | (13) 9% | (48) |
| (−) Embalagem | (4) | (2,5) | (1,5) | (8) |
| **= Margem de Contribuição** | **204 (51,0%)** | **87,5 (35,0%)** | **39,5 (26,3%)** | **331** |
| (−) Marketing | (90) | (15) | (25) | (130) |
| **= Margem após Marketing** | **114 (28,5%)** | **72,5 (29,0%)** | **14,5 (9,7%)** | **201** |

**Leitura:**
- O **site próprio** tem a melhor margem de contribuição, mas depende de muito marketing.
- O **Mercado Livre** tem margem de contribuição menor, porém precisa de pouco marketing. No final, fica empatado com o site.
- A **Shopee** representa 19% da receita, mas só 7% da margem. O CMV mais alto (44%) indica que os produtos são vendidos com desconto. **Decisão a discutir:** subir preço na Shopee, reduzir os ads ou focar o catálogo em itens de margem maior.

> **Regra:** não rateie as despesas fixas entre os canais para "achar o lucro do canal". O rateio é arbitrário e leva a decisões erradas, como fechar um canal que ajuda a pagar a estrutura. Compare os canais pela **margem de contribuição** e pela **margem após marketing**.

#### d) Ponto de equilíbrio (break-even)
É quanto a empresa precisa vender para empatar (EBITDA = 0).

```
Ponto de equilíbrio (RL) = Despesas Fixas ÷ % Margem após Marketing
                         = 130 ÷ 25,1% = R$ 517 mil de receita líquida
```
- Hoje a empresa vende R$ 800 mil. A **margem de segurança** é (800 − 517) ÷ 800 = **35%**. A receita pode cair 35% antes de dar prejuízo operacional.
- Se a margem cair, o ponto de equilíbrio sobe. **Margem é mais poderosa que volume.**

### 🚨 Pontos de atenção na DRE

| Sinal | Possível causa | O que perguntar |
|---|---|---|
| CMV % subindo | Desconto, mudança de mix, aumento de custo, custo no ERP errado | "Teve promoção? Mudou o fornecedor?" |
| Devoluções acima de 5% a 8% | Problema de produto, grade ou descrição | "Quais SKUs mais voltam?" |
| Marketing % sobe sem a receita acompanhar | Saturação, criativos fracos, CAC subindo | "O que mudou nas campanhas?" |
| Frete acima de 8% da RL | Frete grátis sem valor mínimo, tabela ruim | "Qual o pedido mínimo para frete grátis?" |
| Fixas crescendo mais rápido que a receita | Contratações antes da hora | "Essa contratação se paga em quanto tempo?" |
| Lucro bom mas caixa ruim | Estoque, recebíveis, dívida | Ir para o Fluxo de Caixa e a DFC |
| Muito dinheiro em "Outros" | Classificação ruim | Abrir e reclassificar |
| Receita sobe e EBITDA cai | Crescimento comprado com margem | Fazer a análise horizontal e por canal |

**Referências para e-commerce** (variam muito por nicho):
- Margem bruta: 40% a 60%
- Margem de contribuição: 25% a 40%
- Marketing: 8% a 20% da RL
- EBITDA: 8% a 15% é saudável; abaixo de 5% a empresa fica frágil

---

<a id="2-fluxo-de-caixa"></a>
## 2. Fluxo de Caixa

### O que é
É o registro (realizado) e a previsão (projetado) de **dinheiro entrando e saindo** da conta. Segue o **regime de caixa**.

Dois formatos:
- **Diário/semanal realizado:** o que de fato aconteceu. Base: extrato bancário.
- **Projeção de 13 semanas:** uma previsão rolante de cerca de 3 meses. É **a ferramenta de sobrevivência** do e-commerce.

### Como preencher a projeção de 13 semanas

**Estrutura:**
```
SALDO INICIAL DA SEMANA
(+) ENTRADAS
    Repasses de marketplace (por canal, na data prevista de repasse)
    Recebíveis de cartão (agenda do adquirente)
    Pix / boleto
    Antecipações (se forem feitas)
    Empréstimos novos / aportes
(−) SAÍDAS
    Fornecedores (pelas datas de vencimento dos boletos)
    Folha / pró-labore (datas fixas)
    Impostos (DAS dia 20, ICMS conforme o estado, guias)
    Marketing (fatura do cartão ou boleto)
    Frete / logística
    Aluguel e fixas
    Parcelas de empréstimo (principal + juros)
(=) SALDO FINAL DA SEMANA
    Caixa mínimo de segurança
    Folga / (falta) de caixa
```

**Onde buscar cada número:**
- **Entradas:** a **agenda de recebíveis** do adquirente e o **calendário de repasses** dos marketplaces. Não estime pelas vendas, use o que já está agendado. Para as vendas futuras, projete as vendas e aplique o prazo de recebimento de cada canal.
- **Saídas:** contas a pagar já lançadas (boletos de fornecedor), folha, calendário de impostos e compras de estoque **já planejadas**. Este é o item mais importante.
- **Caixa mínimo:** em geral 1 mês de despesas fixas, ou o suficiente para cobrir 2 semanas de saídas.

### Exemplo: próximas 4 semanas (R$ mil)

| | Sem 1 | Sem 2 | Sem 3 | Sem 4 |
|---|---:|---:|---:|---:|
| **Saldo inicial** | 150 | 163 | 106 | 29 |
| (+) Entradas (repasses + cartão + pix) | 190 | 185 | 180 | 195 |
| (−) Fornecedores | (120) | (90) | (40) | **(150)** |
| (−) Folha + pró-labore | – | (100) | – | – |
| (−) Impostos (DAS/ICMS) | – | – | **(160)** | – |
| (−) Marketing | (30) | (30) | (35) | (35) |
| (−) Frete | (12) | (12) | (12) | (12) |
| (−) Parcela de empréstimo | – | – | – | (25) |
| (−) Outras fixas | (15) | (10) | (10) | (10) |
| **Saldo final** | **163** | **106** | **29** | **(8)** |
| Caixa mínimo (R$ 100 mil) | ok | ok | 🚨 abaixo | 🚨 negativo |

**Leitura:** a empresa é lucrativa (lucro de R$ 40 mil em outubro, como mostra a DRE), mas **vai ficar sem caixa na semana 4**. O motivo é a coincidência do imposto (semana 3) com o pedido grande de estoque do Natal (semana 4).

**Decisões possíveis, da mais barata para a mais cara:**
1. Negociar com o fornecedor para dividir o pedido do Natal em 2 ou 3 parcelas.
2. Escalonar o pedido: receber metade agora e metade depois.
3. Reduzir o marketing nas semanas 3 e 4 se o retorno estiver fraco.
4. Antecipar recebíveis, o que **tem custo** (cerca de 1,5% a 3% ao mês) e reduz a margem.
5. Usar uma linha de capital de giro, o mais caro.

> O valor do serviço está em **avisar 3 semanas antes**. O dono que descobre o problema no dia da falta de dinheiro só tem a opção mais cara.

### Como analisar
- **Projetado x Realizado** toda semana: errou muito? Descubra por quê e ajuste o modelo.
- **Menor saldo das próximas 13 semanas:** esse é o número para reportar ao dono.
- **Concentração de saídas:** semanas com imposto, folha e fornecedor juntos são as perigosas.
- **Dependência de antecipação:** se a empresa antecipa todo mês, ela está pagando juros escondidos para tapar um problema de capital de giro (veja a seção 5).

### 🚨 Pontos de atenção no Fluxo de Caixa
- Saldo projetado abaixo do caixa mínimo em qualquer semana.
- Antecipação de recebíveis virando rotina.
- Compras de estoque grandes sem casar com o recebimento das vendas.
- Impostos atrasados ou parcelados (é um sinal de que o caixa já está apertado).
- Sócio retirando dinheiro sem olhar a projeção.
- Diferença grande entre o projetado e o realizado (o modelo não é confiável).
- Repasse de marketplace retido por disputa ou chargeback.

---

<a id="3-dfc"></a>
## 3. DFC: Demonstração do Fluxo de Caixa

### O que é
É a ponte entre o **lucro (DRE)** e o **caixa (banco)**. Explica **para onde foi o dinheiro** que a empresa lucrou, ou de onde veio o que ela gastou a mais.

Ela divide o caixa em 3 blocos:

| Bloco | O que entra | Pergunta |
|---|---|---|
| **Operacional (FCO)** | Lucro + ajustes + variação de capital de giro | "A operação gera caixa?" |
| **Investimento (FCI)** | Compra e venda de equipamentos, site, sistemas, participações | "Quanto estamos investindo?" |
| **Financiamento (FCF)** | Empréstimos, amortizações, aportes, distribuição de lucros | "Quem está financiando a empresa?" |

### Como preencher (método indireto, o mais usado no gerencial)

```
  Lucro Líquido (da DRE)
+ Depreciação (é despesa que não sai do caixa)
± Variação do Contas a Receber   (aumentou = consumiu caixa = negativo)
± Variação do Estoque            (aumentou = consumiu caixa = negativo)
± Variação de Fornecedores       (aumentou = gerou caixa = positivo)
± Variação de Impostos/Salários a pagar (aumentou = positivo)
= FLUXO DE CAIXA OPERACIONAL

− Compras de imobilizado / investimentos
+ Vendas de ativos
= FLUXO DE CAIXA DE INVESTIMENTO

+ Novos empréstimos
− Pagamento do principal de empréstimos
+ Aportes dos sócios
− Distribuição de lucros
= FLUXO DE CAIXA DE FINANCIAMENTO

= VARIAÇÃO DO CAIXA NO PERÍODO  (tem que bater com o banco!)
```

> **Regra de ouro dos sinais:** se um **ativo** aumenta (estoque, contas a receber), ele **consome** caixa. Se um **passivo** aumenta (fornecedores, impostos a pagar), ele **gera** caixa, porque você ficou devendo em vez de pagar.

Os números saem da DRE e da comparação entre **dois balanços** (início e fim do mês). Veja a seção 4.

### Exemplo: Loja Exemplo, outubro (R$ mil)

| | R$ mil |
|---|---:|
| Lucro Líquido | 40 |
| (+) Depreciação | 4 |
| (−) Aumento do Contas a Receber (500 → 560) | (60) |
| (−) Aumento do Estoque (810 → 900) | (90) |
| (+) Aumento de Fornecedores (400 → 450) | 50 |
| (+) Aumento de Impostos a pagar (100 → 106) | 6 |
| **= Fluxo de Caixa Operacional** | **(50)** |
| (−) Compra de equipamentos | (20) |
| **= Fluxo de Caixa de Investimento** | **(20)** |
| (+) Novo empréstimo | 80 |
| (−) Amortização de empréstimo | (25) |
| (−) Distribuição de lucros aos sócios | (30) |
| **= Fluxo de Caixa de Financiamento** | **25** |
| **= Variação do caixa** | **(45)** |
| Caixa inicial → final | 150 → 105 |

### Como analisar
**A história que a DFC conta:** "Lucramos R$ 40 mil, mas a operação **consumiu** R$ 50 mil, porque o dinheiro ficou preso em estoque (R$ 90 mil) e em recebíveis (R$ 60 mil). Ainda assim, investimos R$ 20 mil e distribuímos R$ 30 mil aos sócios. Para fechar a conta, pegamos R$ 80 mil emprestados."

Os padrões que mais importam:

| FCO | FCI | FCF | Leitura |
|---|---|---|---|
| + | − | − | ✅ Saudável: a operação paga os investimentos e a dívida |
| + | − | + | Crescendo com alavancagem; ok se o retorno compensar |
| − | − | + | ⚠️ **Caso da Loja Exemplo:** a dívida financia a operação. Não se sustenta por muito tempo |
| − | + | + | 🚨 Vendendo ativos e pegando dívida para sobreviver |

### 🚨 Pontos de atenção na DFC
- **FCO negativo por vários meses** mesmo com lucro na DRE: o capital de giro está engolindo o caixa.
- **Distribuição de lucros com FCO negativo:** o sócio está tirando dinheiro que a empresa não gerou (está saindo do empréstimo).
- Estoque crescendo mais rápido que as vendas.
- Dívida nova sem um destino claro.
- **Variação de caixa da DFC ≠ variação do extrato:** tem lançamento errado em algum lugar.

---

<a id="4-balanço-patrimonial"></a>
## 4. Balanço Patrimonial

### O que é
É uma **foto** da empresa em uma data: o que ela **tem** (ativo), o que ela **deve** (passivo) e o que **sobra para os sócios** (patrimônio líquido).

```
ATIVO = PASSIVO + PATRIMÔNIO LÍQUIDO
(o que tem)  (o que deve a terceiros)  (o que é dos sócios)
```

### Como preencher

| Grupo | Conta | Fonte |
|---|---|---|
| **Ativo Circulante** (vira dinheiro em até 12 meses) | Caixa e bancos | Extratos no último dia do mês |
| | Contas a receber | Agenda do adquirente + saldos a liberar dos marketplaces |
| | Estoque (a custo) | ERP + inventário |
| | Impostos a recuperar | Contador |
| **Ativo Não Circulante** | Imobilizado (equipamentos, móveis), intangível | Controle patrimonial − depreciação acumulada |
| **Passivo Circulante** (vence em até 12 meses) | Fornecedores | Contas a pagar em aberto |
| | Impostos a pagar | Guias do mês em aberto |
| | Salários e encargos | Folha a pagar |
| | Empréstimos de curto prazo | Parcelas dos próximos 12 meses |
| **Passivo Não Circulante** | Empréstimos de longo prazo | Parcelas depois de 12 meses |
| **Patrimônio Líquido** | Capital social + lucros acumulados | PL anterior + lucro do mês − distribuições |

> Se o ativo não bater com passivo + PL, tem erro. O balanço **sempre** fecha.

### Exemplo: Loja Exemplo (R$ mil)

| ATIVO | 30/set | 31/out |
|---|---:|---:|
| Caixa e bancos | 150 | 105 |
| Contas a receber | 500 | 560 |
| Estoque | 810 | 900 |
| Impostos a recuperar | 30 | 30 |
| **Ativo Circulante** | **1.490** | **1.595** |
| Imobilizado líquido | 180 | 196 |
| **TOTAL DO ATIVO** | **1.670** | **1.791** |

| PASSIVO + PL | 30/set | 31/out |
|---|---:|---:|
| Fornecedores | 400 | 450 |
| Impostos a pagar | 100 | 106 |
| Salários e encargos | 60 | 60 |
| Empréstimos de curto prazo | 130 | 150 |
| **Passivo Circulante** | **690** | **766** |
| Empréstimos de longo prazo | 170 | 205 |
| **Patrimônio Líquido** | **810** | **820** |
| **TOTAL** | **1.670** | **1.791** |

Conferências:
- Imobilizado: 180 + 20 (compra) − 4 (depreciação) = 196 ✓
- PL: 810 + 40 (lucro) − 30 (distribuição) = 820 ✓
- Empréstimos: 300 + 80 (novo) − 25 (amortização) = 355 ✓

### Como analisar: principais indicadores

| Indicador | Fórmula | Loja Exemplo | Referência |
|---|---|---:|---|
| **Liquidez corrente** | AC ÷ PC | 1.595 ÷ 766 = **2,08** | Acima de 1,2 é confortável |
| **Liquidez seca** | (AC − Estoque) ÷ PC | 695 ÷ 766 = **0,91** | Abaixo de 1 indica dependência de vender o estoque para pagar as contas |
| **Liquidez imediata** | Caixa ÷ PC | 105 ÷ 766 = **0,14** | Baixa; dá para pagar só 14% das dívidas de curto prazo hoje |
| **Dívida líquida** | Empréstimos − Caixa | 355 − 105 = **250** | |
| **Dívida líquida ÷ EBITDA anual** | 250 ÷ (71 × 12) | **0,3x** | Abaixo de 2x é saudável; acima de 3x é perigoso |
| **Necessidade de Capital de Giro (NCG)** | (Receber + Estoque) − (Fornecedores + Impostos + Salários) | 1.460 − 616 = **844** | Veja a seção 5 |

**Leitura:** a empresa não está endividada demais (0,3x o EBITDA), mas tem **pouco caixa** e **muito estoque**. A liquidez corrente boa (2,08) engana, porque a maior parte do ativo circulante é estoque. A liquidez seca abaixo de 1 mostra a realidade.

### 🚨 Pontos de atenção no Balanço
- Estoque crescendo mais que as vendas: pode haver produto parado ou obsoleto.
- Liquidez seca abaixo de 1 junto com caixa baixo.
- Empréstimo de curto prazo financiando estoque de longo giro.
- Patrimônio líquido negativo: a empresa deve mais do que tem.
- "Contas a receber" crescendo sem explicação: verifique chargebacks e repasses retidos.
- Mistura de contas PF e PJ (comum em empresas menores).

---

<a id="5-ciclo-financeiro"></a>
## 5. Ciclo Financeiro e Capital de Giro

### O que é
É o **número de dias** entre o momento em que a empresa paga o fornecedor e o momento em que recebe do cliente. Durante esse tempo, **alguém financia a operação**: o caixa da empresa, o banco ou a antecipação.

```
          PME (estoque)              PMR (receber)
|──────────────────────────|────────────────────────|
compra                   venda                 recebe
|──────────|
  PMP (paga o fornecedor)
           |─────────── CICLO FINANCEIRO ───────────|
           (dias que a empresa precisa financiar)
```

### Como calcular (base mensal de 30 dias)

| Prazo | Fórmula | Loja Exemplo |
|---|---|---:|
| **PMR**: prazo médio de recebimento | Contas a Receber ÷ Receita Bruta × 30 | 560 ÷ 1.000 × 30 = **17 dias** |
| **PME**: prazo médio de estoque | Estoque ÷ CMV × 30 | 900 ÷ 326 × 30 = **83 dias** |
| **PMP**: prazo médio de pagamento | Fornecedores ÷ Compras × 30 | 450 ÷ 416 × 30 = **32 dias** |
| **Ciclo operacional** | PMR + PME | **100 dias** |
| **Ciclo financeiro** | PMR + PME − PMP | **67 dias** |

*Compras do mês = CMV + aumento do estoque = 326 + 90 = 416.*

**Giro de estoque** = 365 ÷ PME ≈ 4,4 vezes por ano.

### Como analisar
- A Loja Exemplo precisa **financiar 67 dias** de operação. O vilão é o **estoque (83 dias)**.
- **Quanto vale cada dia:** CMV diário = 326 ÷ 30 ≈ R$ 11 mil. **Cada dia a menos de estoque libera cerca de R$ 11 mil de caixa.** Reduzir o estoque de 83 para 60 dias libera cerca de R$ 250 mil, o que resolve o aperto de caixa da seção 2 sem pegar empréstimo.
- As alavancas:
  - **PME ↓**: curva ABC, liquidar produto parado, compras menores e mais frequentes.
  - **PMR ↓**: incentivar Pix e boleto, rever o parcelamento sem juros, escolher melhor quais vendas antecipar.
  - **PMP ↑**: negociar prazo com o fornecedor (30/60/90 dias).
- Sempre que o faturamento cresce, a **NCG cresce junto**. Uma empresa que cresce rápido com um ciclo longo **fica sem caixa justamente porque está crescendo**. Avise o dono disso antes de ele dobrar o estoque para a Black Friday.

### 🚨 Pontos de atenção
- PME subindo mês após mês.
- Ciclo financeiro aumentando enquanto a empresa cresce.
- PMP caindo (o fornecedor está cortando o prazo, às vezes por desconfiança).
- Parcelamento sem juros em 10x ou 12x sem que a margem pague o custo da antecipação.

---

<a id="6-dashboard-de-kpis"></a>
## 6. Dashboard de KPIs de e-commerce

### O que é
É um painel de uma página com os indicadores que mostram a **saúde comercial** do negócio. A DRE mostra o resultado; os KPIs mostram **o porquê**.

### Os principais KPIs: fórmula, exemplo e leitura

Dados de outubro: 5.000 pedidos, 2.000 clientes novos, marketing de R$ 130 mil, cada cliente compra em média 2,5 vezes por ano.

| KPI | Fórmula | Loja Exemplo | O que observar |
|---|---|---:|---|
| **Ticket médio** | Receita Bruta ÷ Pedidos | 1.000.000 ÷ 5.000 = **R$ 200** | Se cai, o frete e as taxas pesam mais em % |
| **Taxa de devolução** | Devoluções ÷ Receita Bruta | 40 ÷ 1.000 = **4%** | Acima de 8% na moda merece investigação |
| **CAC**: custo de aquisição de cliente | Marketing ÷ Novos clientes | 130.000 ÷ 2.000 = **R$ 65** | Tendência de alta = saturação |
| **MER / ROAS geral** | Receita Bruta ÷ Marketing total | 1.000 ÷ 130 = **7,7x** | Use o geral, não só o que o Meta mostra |
| **ROAS de equilíbrio** | 1 ÷ (MC ÷ Receita Bruta) | 1 ÷ (331 ÷ 1.000) = **3,0x** | **Abaixo de 3x, a campanha dá prejuízo** |
| **Margem de contribuição por pedido** | MC ÷ Pedidos | 331.000 ÷ 5.000 = **R$ 66** | Quanto cada pedido deixa para pagar a estrutura |
| **LTV (em margem)** | MC por pedido × compras por cliente em 12 meses | 66 × 2,5 = **R$ 165** | Use margem, nunca receita |
| **LTV ÷ CAC** | | 165 ÷ 65 = **2,5x** | A referência é 3x ou mais. Está abaixo |
| **Payback do CAC** | CAC ÷ MC por pedido | 65 ÷ 66 ≈ **1 pedido** | Bom: o cliente se paga já na primeira compra |
| **% de pedidos de recompra** | Pedidos de clientes antigos ÷ Total | 3.000 ÷ 5.000 = **60%** | Base fiel é um ativo |
| **Taxa de conversão (site)** | Pedidos ÷ Sessões | ex.: 2.000 ÷ 100.000 = **2%** | Para moda, de 1% a 2% é comum |
| **Giro de estoque** | 365 ÷ PME | **4,4x por ano** | Quanto maior, melhor |
| **% de estoque parado** | Estoque sem venda há 90 dias ou mais ÷ Estoque total | (medir) | Acima de 20% indica dinheiro parado |

> **Atenção ao ROAS:** o ROAS do Meta ou do Google é calculado pela **receita**, e cada plataforma atribui a venda para si mesma (a soma dá mais que 100%). O que importa é: (1) o **MER**, que é a receita total dividida pelo marketing total, e (2) comparar com o **ROAS de equilíbrio**, que vem da margem. Um ROAS de 4x parece ótimo, mas se a margem for 20%, o equilíbrio é 5x e a campanha dá prejuízo.

### Margem por SKU e curva ABC
1. Exporte do ERP as vendas por SKU com quantidade, receita e custo.
2. Calcule a **margem de contribuição de cada SKU** (preço − custo − comissão − frete médio − impostos).
3. Ordene pela margem total em R$ (não pela receita).
   - **A**: cerca de 20% dos SKUs, cerca de 80% da margem → nunca podem faltar no estoque.
   - **B**: intermediários.
   - **C**: muitos SKUs, pouca margem → candidatos a sair do catálogo ou a ser liquidados.
4. Cruze com o estoque: **um SKU C com muito estoque é dinheiro parado.**

### 🚨 Pontos de atenção nos KPIs
- CAC subindo e LTV parado ou caindo.
- LTV ÷ CAC abaixo de 1: cada cliente novo dá prejuízo.
- MER caindo enquanto a verba sobe (o famoso "escalar queimando dinheiro").
- Ticket médio caindo por excesso de cupom.
- Pedidos de recompra caindo: problema de experiência ou de produto.

---

<a id="7-orçado-x-realizado"></a>
## 7. Orçado x Realizado

### O que é
É a comparação, mês a mês, entre **o que foi planejado** (orçamento anual) e **o que aconteceu**. Transforma o planejamento em cobrança e em aprendizado.

### Como montar o orçamento
1. **Comece pela receita**, por canal e por mês, considerando a sazonalidade (Black Friday, Natal, Dia das Mães, Dia dos Namorados).
2. **Custos variáveis em %** da receita (CMV %, comissão %, frete %), usando o histórico ajustado.
3. **Marketing**: a partir da meta de CAC ou de % da receita.
4. **Fixas em R$**: folha (com as contratações planejadas e o dissídio), aluguel, sistemas.
5. Gere a **DRE orçada** mês a mês, depois o **fluxo de caixa orçado** (para ver se o plano cabe no caixa).
6. Defina **metas**: EBITDA %, caixa mínimo, CAC máximo, giro de estoque.

### Exemplo: outubro (R$ mil)

| Linha | Orçado | Realizado | Variação | Leitura |
|---|---:|---:|---:|---|
| Receita Líquida | 850 | 800 | (50) −5,9% | 🔴 Vendeu menos |
| CMV | 340 (40,0%) | 326 (40,8%) | % pior | 🔴 Margem pior |
| Despesas variáveis | 153 (18,0%) | 143 (17,9%) | ≈ | ⚪ |
| Margem de Contribuição | 357 (42,0%) | 331 (41,4%) | (26) | 🔴 |
| Marketing | 119 (14,0%) | 130 (16,3%) | +11 | 🔴 Gastou mais |
| Despesas fixas | 125 | 130 | +5 | 🔴 |
| **EBITDA** | **113 (13,3%)** | **71 (8,9%)** | **(42) −37%** | 🔴 |

### Como analisar: decompor a diferença
Não basta dizer que "o EBITDA ficou R$ 42 mil abaixo". É preciso explicar **de onde veio cada parte**:

| Efeito | Cálculo | R$ mil |
|---|---|---:|
| **Volume** (vendeu menos) | (800 − 850) × 42% de MC orçada | (21) |
| **Margem** (MC % pior) | 800 × (41,4% − 42,0%) | (5) |
| **Marketing** acima do orçado | 119 − 130 | (11) |
| **Fixas** acima do orçado | 125 − 130 | (5) |
| **Total** | | **(42)** ✓ |

**A conversa com o dono:** "Metade da diferença veio de vender menos que o previsto. A outra metade veio de gastar mais em marketing e estrutura. E o marketing extra **não** trouxe a venda esperada, então precisamos rever as campanhas."

### 🚨 Pontos de atenção
- Orçamento feito uma vez e esquecido: precisa de revisão trimestral (o chamado *forecast*).
- Variações que se repetem todo mês na mesma linha: o orçamento está irreal ou há um problema estrutural.
- Comparar só o total: abra por canal e por linha.
- Orçamento de receita sem casar com o estoque e o marketing necessários para chegar nele.

---

<a id="8-rotina-mensal"></a>
## 8. Rotina mensal e reunião com o cliente

### Calendário de fechamento (sugestão)

| Dia útil | Atividade |
|---|---|
| D+1 a D+3 | Coletar extratos, relatórios de marketplace e gateway, ads e notas |
| D+3 a D+5 | Conciliação bancária e de marketplaces; classificação no plano de contas |
| D+5 a D+7 | CMV e estoque, provisões (folha, impostos), DRE e balanço |
| D+7 a D+8 | DFC, KPIs, orçado x realizado, atualização da projeção de 13 semanas |
| D+8 a D+10 | Análise e montagem da apresentação (**3 a 5 mensagens principais**, não 40 slides) |
| D+10 | **Reunião de resultado com o dono** |
| Toda semana | Atualizar o fluxo de caixa projetado e enviar alerta se houver risco |

### Roteiro da reunião mensal (60 a 90 minutos)
1. **Resumo em uma frase:** "Mês de crescimento de receita, mas com perda de margem e caixa apertado."
2. **DRE:** resultado, vertical e horizontal, o que mudou e por quê.
3. **DRE por canal:** onde ganhamos e onde perdemos.
4. **Caixa:** posição atual, projeção de 13 semanas e o menor saldo previsto.
5. **KPIs:** CAC, MER, LTV/CAC, estoque.
6. **Orçado x realizado:** a decomposição da diferença.
7. **Decisões e plano de ação:** 3 a 5 ações, cada uma **com responsável e prazo**. Na reunião seguinte, comece cobrando essas ações.

> Os relatórios são o meio. O que o cliente compra é a **seção 7 da reunião**: decisões que aumentam a margem e protegem o caixa.

### Checklist rápido antes de enviar qualquer relatório
- [ ] O caixa do sistema bate com o extrato de todas as contas?
- [ ] Os repasses de marketplace estão conciliados?
- [ ] O CMV foi calculado sobre o que foi **vendido** (e não sobre o que foi comprado)?
- [ ] O pró-labore está nas despesas?
- [ ] O principal dos empréstimos ficou fora da DRE (só os juros entram)?
- [ ] O balanço fecha (ativo = passivo + PL)?
- [ ] A variação de caixa da DFC bate com o extrato?
- [ ] Houve alguma variação acima de 10% sem explicação?

---

<a id="9-glossário"></a>
## 9. Glossário rápido

| Termo | Significado |
|---|---|
| **Competência** | Registrar quando o fato acontece (DRE) |
| **Caixa** | Registrar quando o dinheiro se move (fluxo de caixa) |
| **RL** | Receita Líquida: receita bruta − devoluções − impostos |
| **CMV** | Custo da Mercadoria Vendida |
| **MC** | Margem de Contribuição: o que sobra depois dos custos variáveis |
| **EBITDA** | Lucro operacional antes de juros, impostos, depreciação e amortização |
| **PE** | Ponto de Equilíbrio |
| **NCG** | Necessidade de Capital de Giro |
| **PMR / PME / PMP** | Prazos médios de recebimento, estoque e pagamento |
| **CAC** | Custo de Aquisição de Cliente |
| **LTV** | Lifetime Value: margem que um cliente gera ao longo do tempo |
| **ROAS / MER** | Receita ÷ investimento em ads (por plataforma / no total) |
| **DIFAL** | Diferencial de alíquota de ICMS em vendas para outros estados |
| **ICMS-ST** | Substituição tributária: ICMS cobrado antecipadamente na cadeia |
| **Simples / Presumido / Real** | Regimes tributários. Mudam onde e como os impostos aparecem na DRE (sempre valide com o contador) |
| **Forecast** | Revisão da projeção ao longo do ano |
| **Curva ABC** | Classificação de produtos por relevância (margem ou receita) |
