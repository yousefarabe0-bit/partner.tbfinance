# Agente do Reclame Aqui (TB Finance)

Roda **todo dia ~9h20 (Brasília)** pelo GitHub Actions (`.github/workflows/reclameaqui.yml`):

1. Entra no painel da empresa no Reclame Aqui com a conta da TB Finance.
2. Abre as reclamações sem resposta, escreve a resposta com o Claude seguindo `diretrizes.md` e publica.
   Casos sensíveis (processo, Procon, fraude, reembolso com valor, ameaça...) **não são publicados**:
   ficam no relatório como "precisam de uma pessoa" e o workflow fica vermelho, para o GitHub mandar e-mail.
3. Compara o perfil com `perfil.json` (descrição, site, e-mail, telefone, horário, foto e capa) e corrige o que estiver diferente.

| Arquivo | Para que serve |
|---|---|
| `perfil.json` | Como o perfil deve estar. Edite aqui para mudar descrição/contatos. |
| `imagens/foto-perfil.png`, `imagens/capa.png` | Foto e capa. Troque o arquivo e o agente reenvia sozinho. |
| `diretrizes.md` | Tom e regras das respostas, e quando escalar. |
| `config.json` | URLs e seletores do painel, modo padrão, limite diário. |
| `respondidas.json`, `imagens-enviadas.txt` | Memória do agente (o workflow atualiza sozinho). |

## Configurar (uma vez)

1. **Secrets** do repositório (Settings → Secrets and variables → Actions):
   - `RA_EMAIL` e `RA_PASSWORD`: login da TB Finance no painel de empresa do Reclame Aqui.
   - `ANTHROPIC_API_KEY`: chave da API do Claude (console.anthropic.com).
2. **Calibrar o painel.** Não consegui abrir o Reclame Aqui daqui (o site bloqueia acesso automatizado fora do navegador),
   então as URLs e seletores do `config.json` são um ponto de partida. Rode o workflow manualmente com modo **explorar**,
   baixe o artefato, decifre (abaixo) e ajuste em `config.json`:
   - `urls.reclamacoes` / `urls.perfil`: páginas da lista de reclamações e de edição do perfil;
   - `seletores.*`: link de cada reclamação, texto de "não respondida", campo e botão de resposta;
   - `perfilCampos.*`: o seletor de cada campo do perfil (ex.: `#descricao`, `input[type=file][name=logo]`).
     Campo vazio = o agente não mexe nele.
3. Rode com modo **rascunho** e confira as respostas no relatório. Quando estiver bom, o agendamento diário roda em **auto**
   (para manter em rascunho, crie a variável de repositório `RA_MODE=rascunho`).

### Se o Reclame Aqui pedir captcha ou código por e-mail
O agente para e avisa. Nesse caso, gere uma sessão já logada no seu computador e salve como secret `RA_STORAGE_STATE`:

```bash
npx playwright codegen --save-storage=ra.json https://www.reclameaqui.com.br/area-da-empresa/
```

Faça o login na janela que abrir, feche, e depois:

```bash
base64 -w0 ra.json
```

Cole o resultado no secret `RA_STORAGE_STATE` e apague o `ra.json`. Quando a sessão expirar, repita.

## Ler o relatório
O repositório é público, então o resumo do Actions mostra só contagens. O relatório completo (respostas, casos escalados,
capturas de tela) vai no artefato `reclameaqui-relatorio`, criptografado com a senha do Reclame Aqui:

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -in reclameaqui-relatorio.tar.gz.enc -pass pass:'SENHA_DO_RECLAME_AQUI' | tar xz
```

## Rodar à mão
Actions → "Reclame Aqui – agente diário" → Run workflow → escolha o modo (`auto`, `rascunho` ou `explorar`).
