# Manual de LinkedIn Ads: TB Finance

Este é o manual que o agente `linkedin-ads` (`.claude/agents/linkedin-ads.md`) segue.
Complementa o `marketing/PLAYBOOK.md` (orgânico) e a `marketing/tbfinance/ESTRATEGIA.md` (posicionamento).

## 1. Por que LinkedIn
O cliente principal da TB é o **perfil B**: quem ganha bem (R$ 8 a 60 mil) e perdeu o controle das dívidas.
Médico, dentista, engenheiro, arquiteto e empresário. O LinkedIn é o único canal pago que segmenta por
**cargo, área e senioridade** declarados, então é onde esse público é mais fácil de achar.
Contrapartida: o clique é caro (CPC costuma ficar bem acima do Meta). Por isso só vale com oferta forte
e com acompanhamento de custo por lead **qualificado**, não por lead bruto.

## 2. Regras que nunca mudam
1. **Nada gasta dinheiro sem aprovação do Yousef por escrito** (e-mail ou chat). O agente cria tudo em **rascunho (DRAFT)**.
   Ativar uma campanha, subir orçamento ou criar uma campanha nova com verba são decisões dele.
2. **Pausar é livre**: se uma campanha estourar os limites de segurança (seção 7), o agente pausa e avisa no mesmo dia.
3. **Teto diário** do plano aprovado nunca é ultrapassado. O script recusa um plano cuja soma passe do teto.
4. Anúncio de serviço financeiro: nada de "garantido", "zere suas dívidas", "limpe seu nome em X dias",
   porcentagem de desconto sem "varia por caso", nem dica de deixar de pagar dívida. Todo número com fonte.
   Conferir a política de anúncios do LinkedIn (serviços financeiros) antes de cada criativo novo.
5. Não usar nome nem rosto de cliente sem autorização registrada. Nenhum dado de lead entra no repositório (ele é público).
6. Formulário de lead (Lead Gen Form) sempre com link da política de privacidade do site da TB (LGPD).

## 3. Estrutura da conta
- **Grupo de campanhas** = um objetivo + um período (ex.: `TB | Leads assessoria | Profissionais de alta renda | dez/2026`).
- **Campanha** = um público. Nome: `TB | <Objetivo> | <Público> | <Região>`.
- **Anúncios** = 3 a 4 criativos por campanha (o LinkedIn distribui melhor com variação). Nome: `<formato> | <ângulo> | v<n>`.
- Uma variável por teste: ou muda o público, ou o criativo, nunca os dois ao mesmo tempo.

## 4. Funil
| Etapa | Objetivo no LinkedIn | Público | O que mostrar |
|---|---|---|---|
| Topo (aquecer) | ENGAGEMENT ou VIDEO_VIEW | cargos-alvo frios | Fala Founder, posts orgânicos do Yousef que performaram melhor (Thought Leader Ads) |
| Meio | LEAD_GENERATION | quem viu 50%+ do vídeo ou abriu o formulário | E-book / planilha / aula DESTRAVA como isca |
| Fundo | LEAD_GENERATION | visitantes do site, quem abriu o formulário e não enviou | Diagnóstico gratuito com o time da TB |

Começo recomendado (orçamento pequeno): **só meio de funil, LEAD_GENERATION com formulário nativo**, 3 públicos (plano-01).
Topo e retargeting entram quando houver volume (público de retargeting precisa de 300+ pessoas para rodar).

**Thought Leader Ads** (impulsionar posts do perfil pessoal do Yousef) são a melhor ponte com o orgânico:
os posts do `automation/linkedin/posts.json` que tiverem engajamento acima da média viram anúncio de topo.

## 5. Públicos-base
- **Saúde:** cargos Médico, Cirurgião-dentista/Dentista, especialidades. Excluir estudantes.
- **Engenharia e arquitetura:** cargos Engenheiro(a) civil/eletricista/mecânico, Arquiteto(a), senioridade sênior+.
- **Donos de pequenas empresas:** senioridade Proprietário/Sócio, empresas de 2 a 50 funcionários.
- **Parcerias com conselhos (CREA, CRO):** se houver lista de e-mails autorizada, usar Matched Audiences (nunca subir lista sem base legal).
- Sempre: localização Brasil, idioma português, **expansão de público desligada** e **Audience Network desligada** no começo.
- Tamanho ideal de cada público: 50 mil a 400 mil pessoas (o Campaign Manager mostra a estimativa).

## 6. Criativos
- Formatos: imagem única 1200x1200 ou 1080x1350, carrossel (2 a 10 cards 1080x1080), vídeo vertical 4:5 ou 9:16 com legenda, documento (PDF).
- Identidade: laranja `#E8440A`, preto `#0F0F0F`, off-white `#F4F2EE`, Inter. Reaproveitar o gerador `marketing/gerador/`.
- Texto de introdução: até ~150 caracteres aparecem antes do "ver mais". Primeira linha fala com o cargo
  ("Médico que fatura bem e mesmo assim não sobra nada?"). Título até 70 caracteres.
- Ângulos a testar: (1) "ganhar bem não protege de dívida", (2) caso real com número (só confirmados na ESTRATEGIA.md),
  (3) autoridade (fundada em 2019, +3.000 clientes, +R$ 30 mi renegociados), (4) Fala Founder em vídeo.
- Formulário: no máximo 4 campos (nome, e-mail, telefone, faixa de renda ou valor aproximado da dívida). Menos campos = lead mais barato;
  a pergunta de faixa filtra quem não é perfil.
- Peças e textos ficam em `marketing/linkedin-ads/criativos/<campanha>/` com uma prévia para aprovação.

## 7. Métricas, metas e limites de segurança
Referências iniciais (ajustar depois de 2 semanas com dados reais da conta):

| Métrica | Saudável | Sinal de alerta |
|---|---|---|
| CTR (imagem) | ≥ 0,5% | < 0,35% depois de 3.000 impressões → trocar criativo |
| Taxa de envio do formulário | ≥ 10% | < 6% → formulário longo demais ou oferta fraca |
| Frequência semanal | ≤ 4 | > 5 → público saturado, renovar criativo |
| Custo por lead (CPL) | definir com o Yousef pelo ticket da assessoria | > 2x a meta por 5 dias → pausar |

- **Regra de pausa automática:** gastou 3x o CPL-meta sem nenhum lead → pausar a campanha e avisar.
- **Regra de aprendizado:** não mexer em campanha nova nos primeiros 5 a 7 dias, salvo regra de pausa.
- **Escala:** campanha com CPL abaixo da meta por 7 dias → propor +20% de orçamento (nunca mais que isso de uma vez).
- O que importa no fim é **custo por cliente fechado**: cruzar os leads com o resultado comercial que o time informar.

## 8. Rotina
| Quando | O quê |
|---|---|
| Diário (~10h) | `ads.mjs report 1`: conferir gasto x teto e regras de pausa. Só avisa se algo saiu do normal. |
| Segunda | `ads.mjs report 7`: relatório da semana por e-mail para **contato@tbfinance.com.br** (gasto, leads, CPL, CTR, o que pausar, o que testar). |
| Quinzenal | Renovar 1 ou 2 criativos das campanhas com frequência alta ou CTR caindo. |
| Mensal | Proposta do mês seguinte (orçamento, públicos, testes) para aprovação. |

Relatórios ficam em `marketing/linkedin-ads/relatorios/` (só números agregados, nunca dados de lead).

## 9. Acesso técnico
- Script: `automation/linkedin/ads.mjs` (contas, busca de filtros, validação, criação em rascunho, relatório, pausa).
- Precisa do produto **Advertising API** aprovado no app do LinkedIn Developers (o app atual só tem o de publicação)
  e de um token com os escopos `r_ads`, `rw_ads` e `r_ads_reporting`, de um usuário com papel de **Account Manager** ou superior na conta de anúncio.
- Secrets: `LINKEDIN_ADS_TOKEN` e `LINKEDIN_AD_ACCOUNT` (id numérico da conta). O token vence a cada 60 dias.
- Os **anúncios** (criativos) e o **formulário de lead** são montados no Campaign Manager na primeira rodada; o script cuida de grupos, campanhas, relatórios e pausas.
