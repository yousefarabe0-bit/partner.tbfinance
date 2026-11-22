# Simulação real: empresa de calçados (piloto)

> Objetivo: rodar o serviço numa empresa de verdade antes de vender. Vamos montar o **diagnóstico** (DRE por canal, caixa, ciclo financeiro e KPIs) com os dados dos últimos meses.
> ⚠️ **Os dados reais da empresa NÃO devem ir para este repositório.** Guarde-os numa pasta privada do Google Drive. Aqui fica só o método.

---

## Duas formas de fazer

| | **Versão rápida** (recomendada para começar) | **Versão completa** |
|---|---|---|
| Período | Últimos **3 meses** | Últimos **6 a 12 meses** |
| Formato dos dados | Totais por mês (relatórios e exportações) | Lançamento a lançamento |
| Esforço do seu irmão | **1 a 2 horas** | Dar acessos aos sistemas |
| Resultado | DRE por canal, margem, ponto de equilíbrio, ciclo financeiro, primeira projeção de caixa | Diagnóstico completo, igual ao do cliente pagante |

Comece pela rápida. Se os números mostrarem algo interessante (e quase sempre mostram), parta para a completa.

---

## O que pedir: prioridade 1 (sem isso não dá para fazer)

| # | Informação | De onde ele tira | Para qual relatório |
|---|---|---|---|
| 1 | **Faturamento por canal, por mês** (site, Mercado Livre, Shopee, loja física, atacado...) | ERP ou relatório de cada canal | DRE e DRE por canal |
| 2 | **Devoluções e cancelamentos por mês** (R$ e, se possível, quantidade de pares) | ERP / marketplaces | DRE |
| 3 | **Impostos pagos por mês** (DAS ou ICMS/PIS/COFINS) + **regime tributário** | Contador (guias) | DRE |
| 4 | **Custo dos produtos vendidos (CMV)**: quantos pares vendeu de cada modelo × custo de cada par. Se não tiver, mande a lista de custos por modelo | ERP / planilha de custos / fornecedor | DRE |
| 5 | **Relatórios de repasse dos marketplaces** (comissões, tarifas, frete cobrado, ads) | Painel do ML / Shopee → relatórios financeiros | DRE por canal |
| 6 | **Taxas do cartão / gateway** e quanto antecipou | Extrato do gateway (Mercado Pago, Pagar.me, PagBank...) | DRE + caixa |
| 7 | **Frete pago pela loja e custo de embalagem** | ERP / Melhor Envio / Frenet | DRE |
| 8 | **Gastos de marketing por mês** (Meta, Google, ads de marketplace, influenciadores) | Gerenciadores de anúncio / fatura do cartão | DRE + KPIs |
| 9 | **Despesas fixas mensais**: folha, pró-labore, aluguel, sistemas, contador, outras | Contador + extrato | DRE |
| 10 | **Extratos bancários** dos 3 meses (PDF ou OFX) | Banco | Conferência de tudo |

## Prioridade 2 (deixa o diagnóstico muito melhor)

| # | Informação | Para quê |
|---|---|---|
| 11 | **Estoque hoje:** quantidade por modelo e numeração × custo | Ciclo financeiro, estoque parado, grade quebrada |
| 12 | **Contas a pagar em aberto** (fornecedores, boletos, parcelas) | Projeção de caixa |
| 13 | **Agenda de recebíveis** (o que tem a receber de cartão e marketplaces) | Projeção de caixa |
| 14 | **Empréstimos:** saldo devedor, parcela, taxa, prazo | Balanço, caixa, endividamento |
| 15 | **Pedidos programados com fábricas/fornecedores** (coleção, reposição) | Projeção de caixa: geralmente é onde o caixa aperta |
| 16 | **Número de pedidos e de clientes novos por mês** | Ticket médio, CAC, LTV |
| 17 | **Vendas por modelo (SKU) e numeração** | Curva ABC, margem por produto, grade |

---

## Pontos específicos de calçados para investigar

1. **Grade e numeração:** é comum sobrar as pontas da grade (33/34, 40/41/42 no feminino, por exemplo) e faltar os números do meio. Isso é dinheiro parado e venda perdida ao mesmo tempo.
2. **Devolução e troca por tamanho:** no calçado online, a taxa de troca costuma ser alta. O frete reverso e a troca precisam aparecer na DRE (logística reversa), e não sumir nas despesas.
3. **Sazonalidade de coleção:** coleção de verão e de inverno, Dia das Mães, Black Friday e Natal. A compra da coleção é feita meses antes da venda, e é aí que o **caixa** aperta.
4. **Estoque de coleção passada:** quanto da coleção anterior ainda está parado? Vale liquidar para liberar caixa?
5. **ICMS-ST:** em muitos estados, o calçado tem substituição tributária. Validar com o contador como isso entra no custo e nos impostos.
6. **Frete de produto volumoso:** caixa de sapato pesa e ocupa espaço. Conferir se o frete grátis está comendo a margem, principalmente no site próprio.
7. **Marketplace x site:** comparar a margem após marketing de cada canal (ver a DRE por canal no guia).

---

## Mensagem pronta para mandar ao seu irmão

> Fala, mano! Tô montando o serviço de gestão financeira e quero testar com a tua empresa primeiro. Vou te devolver um diagnóstico completo: quanto cada canal realmente dá de lucro, o ponto de equilíbrio, quanto dinheiro tá parado em estoque e uma projeção do caixa pros próximos 3 meses. De graça, claro 😄
>
> Preciso dos dados dos **últimos 3 meses** (pode ser do jeito que estiver, eu organizo):
>
> 1. Faturamento por canal, mês a mês (site, ML, Shopee, loja, atacado…)
> 2. Devoluções/trocas por mês
> 3. Guias de impostos (ou pede pro contador) + qual o regime (Simples, Presumido…)
> 4. Custo de cada modelo de calçado + quantos pares vendeu de cada (relatório do ERP)
> 5. Relatórios financeiros/de repasse do Mercado Livre e Shopee
> 6. Extrato do gateway/maquininha (taxas e antecipação)
> 7. Quanto gastou com frete e embalagem
> 8. Quanto investiu em anúncio (Meta, Google, ads de marketplace)
> 9. Despesas fixas: folha, pró-labore, aluguel, sistemas, contador
> 10. Extratos do banco dos 3 meses
>
> Se der, também:
> - Estoque atual por modelo/numeração com custo
> - Contas a pagar e empréstimos em aberto
> - Pedidos já feitos pra fábrica (coleção/reposição)
>
> Pode me mandar numa pasta do Drive. Se for mais fácil, me passa um acesso só de consulta no ERP e nos marketplaces que eu puxo tudo.

---

## O que vamos entregar no final

1. **DRE dos 3 meses**, com análise vertical e horizontal.
2. **DRE por canal:** qual canal dá lucro de verdade.
3. **Ponto de equilíbrio e margem de segurança.**
4. **Ciclo financeiro:** quantos dias de estoque e quanto caixa dá para liberar.
5. **Primeira projeção de caixa de 13 semanas** (se vierem as contas a pagar e os pedidos programados).
6. **KPIs:** ticket médio, CAC, ROAS de equilíbrio, taxa de troca.
7. **De 5 a 10 oportunidades priorizadas, com valor em R$**, mais uma reunião de apresentação com ele.

E para nós: **validar o tempo gasto**, ajustar a planilha para calçados e montar um **caso real** (anonimizado) para a apresentação de venda.
