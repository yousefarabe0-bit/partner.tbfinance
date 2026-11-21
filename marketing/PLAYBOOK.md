# Manual de operação: Instagram @tbfinance_ e @yousefameroficial

Este é o manual que as tarefas agendadas seguem. Ele resume tudo o que foi combinado com o Yousef.
Repositório: `yousefarabe0-bit/partner.tbfinance` (público). **Pode enviar direto para a `main`**
(autorizado pelo Yousef para conteúdo: `automation/instagram/posts.json`, imagens e documentos de `marketing/`).
Não mexer no código do site (`src/`).

## 1. Papel de cada um
- **Yousef:** grava os vídeos e joga nas pastas do Drive; aprova a semana por e-mail.
- **Claude:** pesquisa as notícias, monta o cronograma semanal, cria os carrosséis e as capas, coloca na fila,
  acompanha a publicação e organiza o Drive.

## 2. Ritmo semanal (semana de quarta a terça, horário de Brasília)
| Quando | O quê |
|---|---|
| **Domingo ~18h** | E-mail para **contato@tbfinance.com.br** com a semana: calendário, prévia de todos os carrosséis e a lista dos vídeos (com a capa). Os posts já entram na fila da `main`. |
| **Até terça 18h** | O Yousef responde. Sem resposta, **tudo sai como planejado**. |
| **Terça ~18h** | Ler a resposta no Gmail e aplicar os ajustes (trocar, remover ou editar posts da fila). |
| **Todo dia ~20h30** | Conferir as publicações do dia, mover os vídeos publicados para "Postados" no Drive e corrigir falhas. Se algo falhou, avisar por e-mail. |

## 3. Volume por semana
- **@tbfinance_: 14 posts**, 2 por dia, às **12h e 19h**: **4 vídeos** e **10 carrosséis**, todos com temas diferentes.
- **@yousefameroficial: 6 posts**, às **9h ou 10h**, sem post na segunda (é o pior dia dele): **3 vídeos** e **3 carrosséis**.
- **Collab:** vídeos das pastas compartilhadas saem do @yousefameroficial com `"collab": ["@tbfinance_"]`. Contam para os dois perfis.
  O @tbfinance_ precisa aceitar o convite no app.

## 4. Regras de conteúdo
- **Todo post de imagem é carrossel**, e o **último slide é sempre o CTA**.
- **CTA de comentário em toda legenda**, alternando, nunca o mesmo duas vezes seguidas no mesmo perfil:
  - **DESTRAVA**: aula grátis sobre organização financeira e negociação de dívidas com até 90% de desconto
  - **EBOOK**: e-book de organização financeira e liquidação de dívidas
  - **PLANILHA**: planilha de organização financeira pessoal e negociação de dívidas
  (As respostas automáticas já rodam no Meta Business Suite: usar a palavra exata.)
- **Notícia + analogia (estilo G4 Educação):** pegar as notícias mais fortes da semana em **negócios e investimentos**
  e montar uma analogia com **finanças pessoais e dívidas**. Capa com **foto da pessoa envolvida** na notícia.
- **Fotos:** só com licença livre (CC0, CC BY, CC BY-SA). Buscar no Wikimedia Commons, um pedido por vez e com pausa
  (usar miniaturas de 960px). **Crédito no slide e na legenda.** Registrar em `marketing/fotos-noticias/CREDITOS.md`.
  Nunca usar foto de pessoa pública no slide de oferta da TB. Se não tiver como confirmar o cargo atual da pessoa, não usar a foto.
- **Fotos do Yousef:** usar só na capa. Nos slides internos, tipografia (quadros de vídeo em 720p ficam ruins).
- **Todo número tem fonte** no slide e na legenda. Conferir a data (não usar dado antigo como se fosse novo).
- **Nunca** apresentar como dica pública deixar de pagar dívida de propósito.
- **Não publicar o nome de clientes** que ainda não apareceram no Instagram em documentos do repositório (ele é público).

## 5. Visual
- Paleta: laranja `#E8440A`, preto `#0F0F0F`, off-white `#F4F2EE`. Fonte: Inter.
- Gerador de carrossel: `marketing/gerador/gerar_carrossel.py` + um spec JSON (exemplos em `marketing/gerador/specs/`).
  Renderizar com `marketing/tbfinance/render/render.cjs` e converter para **JPG** (o Instagram só aceita JPEG).
- Capas de reels: 1080x1920 com um quadro do próprio vídeo, etiqueta e título (exemplos em
  `marketing/reels/2026-11-semana01/capas-html/`). Texto dentro da área central 3:4.
- Sempre conferir a imagem renderizada antes de colocar na fila.

### Padrão de qualidade das fotos (desde 17/11, pedido do Yousef: nível G4 Educação)
- **Foto em tela cheia em todos os slides**, não só na capa: foto ocupando o slide inteiro, degradê escuro só onde fica o texto.
  Slide só de tipografia apenas quando o slide for um número/gráfico.
- **Resolução mínima:** a foto precisa ter pelo menos **1350 px de altura útil** depois do corte (nada de miniatura de 960 px
  nem quadro de vídeo em 720p). Baixar o arquivo original do Wikimedia Commons, não a miniatura.
- **Fontes com licença e boa qualidade**, nesta ordem: Agência Brasil (CC BY), Flickr oficial do governo (Planalto, Senado,
  Câmara, STF, Fazenda), Wikimedia Commons (original), kits de imprensa das empresas (uso editorial), Unsplash/Pexels para cenas.
  Nunca copiar fotos de outros perfis (G4 inclusive): eles pagam bancos de imagem.
- **Uma foto diferente por slide** quando possível: pessoa, produto, lugar, contexto. Rosto nunca coberto pelo texto.
- **Tratamento igual em todas:** leve correção de cor, nitidez, granulação sutil, para o carrossel parecer uma peça só.
- Renderizar em 2x e reduzir para 1080x1350 (texto mais nítido). Conferir cada slide ampliado antes de pôr na fila.

## 6. Drive
- Pasta raiz das pastas de vídeo: **"Pastas"** (id `1W3rI1OrH366tjGKmNqTMII6XXWK39UMU`), compartilhada por link.
  Subpastas: Depoimentos Clientes (só TB), Influenciadores (só TB), Caixinha de perguntas (só Yousef),
  Exclusivo Yousef (só Yousef), Fala Founder, Entrevista e Vídeo com conteúdo (collab).
  **Não usar e não mexer em "Criativos TB Finance".**
- Cada subpasta tem **"Postados"** (já publicados) e algumas têm **"Descartados (já postado)"**.
- Antes de usar um vídeo: ler a transcrição (`read_file_content` no arquivo) e confirmar que não é repetido nem já postado.
  Para conferir o que já saiu, rodar o inventário (`automation/instagram/inventory.mjs`) e comparar as falas.
- Depois de publicado, mover o vídeo para a "Postados" da pasta dele.
- **Não postar:** "V041 FALA FOUNDER LIMPA NOME".

## 7. Fila de postagem
- Arquivo: `automation/instagram/posts.json`. O workflow `.github/workflows/instagram.yml` roda a cada 15 min e publica o que venceu.
- Carrossel: `"type": "carousel"`, `"media": [caminhos dos JPG no repositório]`.
- Reel do Drive: `"type": "reel"`, `"media": {"drive": "<id do arquivo>"}`, `"cover": "<caminho do JPG da capa>"`,
  e `"collab": ["@tbfinance_"]` quando for collab. O robô baixa, recomprime e envia.
- Validar antes de enviar:
  `MEDIA_BASE_URL=https://raw.githubusercontent.com/yousefarabe0-bit/partner.tbfinance/main/ node automation/instagram/publish.mjs --validate`
- O histórico do que saiu fica em `automation/instagram/published.json` (o próprio robô atualiza).

## 8. E-mail semanal (domingo)
- Para: **contato@tbfinance.com.br**. Assunto: `Instagram · semana DD/MM a DD/MM · para aprovar`.
- Conteúdo: o calendário da semana (dia, hora, perfil, formato, tema, CTA), a lista dos vídeos com o nome do arquivo e a capa,
  e as prévias dos carrosséis (uma imagem por carrossel com todos os slides).
- Instrução no fim: "Responda **APROVADO** ou diga o que mudar até terça às 18h. Sem resposta, tudo sai como planejado."
- Guardar as prévias em `marketing/previas/` e o cronograma em `marketing/cronograma/`.

## 9. LinkedIn (perfil pessoal do Yousef)
- Robô: `automation/linkedin/publish.mjs`, fila `automation/linkedin/posts.json`, histórico `automation/linkedin/published.json`.
  Roda no mesmo workflow do Instagram (mesmos horários de disparo). Token no secret `LINKEDIN_TOKEN` (vence a cada 60 dias;
  gerado em 21/11/2026, vence ~20/01/2027: avisar o Yousef por e-mail uma semana antes).
- Ritmo (decidido em 21/11): **1 post por dia às 9h, 7 por semana**, semana de quarta a terça, no e-mail de domingo junto com o Instagram
  (seção separada "LinkedIn"). Mais de 1 por dia derruba o alcance de cada post.
- **Operação diferente do Instagram**: temas próprios, não repetir os carrosséis do IG. Rodízio de 3 editorias:
  **Negócios** (caso de empresa contado como história: decisão, erro, virada), **Investimentos** (conceito educativo com conta simples,
  sem recomendar produto) e **História financeira** (crises, bolhas, planos econômicos, datas da semana). Sempre fechar com a lição
  para as finanças pessoais e uma pergunta para gerar comentários.
- Estrutura: 2 primeiras linhas com o fato mais forte, parágrafos curtos, história, "o que eu vejo na TB", pergunta final, fonte.
  Inspiração de formato: Morgan Housel e Nick Maggiulli (história e dados), Codie Sanchez (casos de negócio), Nathalia Arcuri (prático).
- Prévia da semana em `marketing/linkedin/semana-DDmmm.md`.
- Formatos: `"type": "document"` (carrossel da semana em PDF: `python3 marketing/gerador/pdf_linkedin.py <pasta jpg> marketing/linkedin/<nome>.pdf`,
  com `title`) ou `"type": "text"`. Campo `text` até 3000 caracteres.
- Tom: primeira pessoa do Yousef, mais profissional que o Instagram. Abrir com 2 linhas fortes (é o que aparece antes do "ver mais"),
  história real da TB (sem nome de cliente), uma lição prática, fonte no fim. Sem CTA de palavra-chave (a automação de comentários é só do Instagram).
- Referências (Favikon, LinkedIn 2026): Nathalia Arcuri e Gabriel Rabelo (criadores) e CEOs de banco (marcos e bastidores da empresa).

## 10. X (perfil pessoal do Yousef)
- Robô: `automation/x/publish.mjs`, fila `automation/x/posts.json`, histórico `automation/x/published.json`. Roda no mesmo workflow.
  Credenciais nos secrets `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` (OAuth 1.0a, app com permissão Read and Write).
- Custo: API do X é paga por uso (cerca de US$ 0,015 por post sem link; com link, ~US$ 0,20). **Evitar links** nos posts.
- Ritmo (decidido em 21/11): **5 por dia**: 9h fio (`"type": "thread"`, `"texts": [...]`, cada parte até 280 caracteres) com a história do dia
  (negócios, investimentos ou história financeira, sem repetir o texto do LinkedIn) + 10h, 12h, 15h e 19h posts curtos (`"type": "post"`, `"text"`)
  com notícia de negócios/mercado do dia e opinião rápida do Yousef. Tom mais direto e informal que o LinkedIn.
- Entra no e-mail de domingo (seção "X"). Notícias do dia podem ser escritas na véspera, sempre com fato conferido em fonte.
