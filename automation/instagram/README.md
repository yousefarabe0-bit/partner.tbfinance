# Automação de postagens no Instagram — @yousefameroficial e @tbfinance_

Publica posts agendados nas contas **@yousefameroficial** (pessoal) e **@tbfinance_** (empresa) usando a API oficial da Meta
(Instagram Graph API). Roda sozinho no GitHub Actions a cada 15 minutos.

```
automation/instagram/
├── publish.mjs           # script que publica (Node 18+, sem dependências)
├── accounts.json         # as contas (@) e o nome dos secrets de cada uma
├── posts.json            # SUA FILA DE POSTS — edite aqui
├── posts.example.json    # exemplos de cada tipo de post
└── published.json        # histórico automático (não editar à mão)
.github/workflows/instagram.yml   # agendamento
```

Tipos suportados: **imagem**, **carrossel** (2–10 fotos/vídeos), **reel** e **story**.

---

## 1. Pré-requisitos (uma vez só, para cada conta)

A API oficial **só funciona com contas profissionais**. Para cada perfil (@yousefameroficial e @tbfinance_):

1. No app do Instagram: *Configurações → Tipo de conta e ferramentas → Mudar para conta profissional*
   (Criador de conteúdo ou Empresa — os dois servem).
2. Vincule a conta a uma **Página do Facebook** (pode criar uma página simples só para isso):
   *Central de Contas* ou, na Página do Facebook, *Configurações → Contas vinculadas → Instagram*.

## 2. Criar o app na Meta e gerar os tokens

1. Acesse <https://developers.facebook.com/apps> → **Criar app** → tipo **Empresa (Business)**.
2. No app, adicione o produto **Instagram** (opção *API com login do Facebook*).
3. Abra o **Graph API Explorer** (<https://developers.facebook.com/tools/explorer>), selecione seu app e
   peça as permissões:
   `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`, `business_management`.
   Clique em **Generate Access Token** e autorize **as duas páginas/contas**.
4. Transforme o token em **longa duração** (troque `APP_ID`, `APP_SECRET`, `TOKEN_CURTO`):
   ```
   https://graph.facebook.com/v23.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=TOKEN_CURTO
   ```
5. Com o token longo, liste as páginas (no Graph API Explorer, `GET me/accounts?fields=name,access_token,instagram_business_account`).
   Para **cada** página você recebe:
   - `access_token` → **token da página** (gerado a partir de um token longo, ele **não expira**)
   - `instagram_business_account.id` → **ID da conta do Instagram**

> ⚠️ Nunca coloque tokens no código nem no `posts.json`. Eles vão só nos *Secrets* do GitHub.

## 3. Cadastrar os secrets no GitHub

No repositório: *Settings → Secrets and variables → Actions → New repository secret*:

| Secret               | Valor                                   |
|----------------------|-----------------------------------------|
| `IG_PESSOAL_USER_ID` | ID da conta **@yousefameroficial**              |
| `IG_PESSOAL_TOKEN`   | token da página ligada a @yousefameroficial     |
| `IG_EMPRESA_USER_ID` | ID da conta **@tbfinance_**                     |
| `IG_EMPRESA_TOKEN`   | token da página ligada a @tbfinance_            |

🔒 Antes de publicar, o robô confere se cada token pertence mesmo ao @ esperado. Se os secrets
estiverem trocados, ele **não publica** e mostra o erro.

Opcional (*Variables*, não Secret): `MEDIA_BASE_URL` — veja a seção 5.

Para adicionar uma terceira conta: inclua em `accounts.json` (ex.: `"loja": { "handle": "minhaloja", "env": "LOJA" }`),
crie os secrets `IG_LOJA_USER_ID` / `IG_LOJA_TOKEN` e acrescente essas duas linhas no `env:` do workflow.

## 4. Agendar posts

Edite `posts.json` (comece copiando de `posts.example.json`) e faça commit na `main`:

```json
[
  {
    "id": "dica-financeira-01",
    "accounts": ["@yousefameroficial", "@tbfinance_"],
    "publishAt": "2026-11-20T12:00:00-03:00",
    "type": "image",
    "media": "https://seusite.com/ig/dica-01.jpg",
    "caption": "Legenda padrão #financas",
    "captions": { "@tbfinance_": "Legenda diferente só para a empresa" }
  }
]
```

| Campo         | Obrigatório | Descrição |
|---------------|-------------|-----------|
| `id`          | sim | Nome único do post (não reutilize — é o que evita duplicar) |
| `accounts`    | sim | `["@yousefameroficial"]`, `["@tbfinance_"]` ou os dois (também aceita os apelidos `pessoal` / `empresa`) |
| `publishAt`   | sim | Data/hora com fuso. Brasília: `-03:00` |
| `type`        | sim | `image`, `carousel`, `reel` ou `story` |
| `media`       | sim | URL (ou lista de URLs no carrossel). Vídeo = `.mp4`/`.mov` |
| `caption`     | não | Legenda (máx. 2.200 caracteres, 30 hashtags) |
| `captions`    | não | Legenda específica por conta (chave = @ da conta), sobrescreve `caption` |
| `shareToFeed` | não | Reels: aparecer também no feed (padrão `true`) |
| `enabled`     | não | `false` deixa o post pausado |

Depois de publicado, o resultado (ID e link do post) aparece em `published.json`.
Se der erro, o robô tenta de novo até 3 vezes e registra a mensagem de erro lá.

## 5. Onde hospedar as imagens e vídeos

A Meta **baixa a mídia de uma URL pública** — não dá para enviar arquivo direto. Opções:

- **Pasta `public/ig/` deste site**: coloque os arquivos lá; após o deploy ficam em
  `https://SEU-DOMINIO/ig/arquivo.jpg`. Defina a variável `MEDIA_BASE_URL=https://SEU-DOMINIO`
  e no `posts.json` use só `"media": "ig/arquivo.jpg"`.
- Qualquer link público direto (Cloudinary, S3, Supabase Storage, etc.).
- ❌ Links do Google Drive/Dropbox de "compartilhar" **não funcionam** (não são arquivo direto).

Formatos: imagem **JPEG**; reels MP4 (H.264), 3 s a 15 min, 9:16 recomendado.

## 6. Testar

```bash
npm run instagram:validate   # confere se o posts.json está certo
npm run instagram:dry-run    # mostra o que seria publicado, sem publicar
```

No GitHub: aba **Actions → Instagram – publicação agendada → Run workflow** (marque "Só simular" para testar).

## Limites da Meta

- Até ~50 posts publicados via API por conta a cada 24 h.
- O agendamento do GitHub pode atrasar alguns minutos em relação ao horário exato.
