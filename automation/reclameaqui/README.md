# Reclame Aqui da TB Finance (sem API paga)

Funciona como o Instagram: o **Claude escreve** (pela assinatura, na tarefa agendada diária) e o **robô do GitHub publica**.

```
dia D   robô: entra no painel → coleta reclamações novas → tranca em caixa/entrada.enc
        Claude: abre o cofre → escreve as respostas em respostas.json (ou escala os casos delicados por e-mail)
dia D+1 robô: publica as respostas → atualiza o perfil → coleta as novas → ...
```

A resposta sai cerca de 1 dia depois da reclamação chegar.

| Arquivo | Para que serve |
|---|---|
| `perfil.json` | Como o perfil deve estar (descrição, site, contatos). Edite aqui. |
| `imagens/foto-perfil.png`, `imagens/capa.png` | Foto e capa. Troque o arquivo e o robô reenvia sozinho. |
| `diretrizes.md` | Tom, regras e quando escalar. O Claude segue isso ao escrever. |
| `respostas.json` | Respostas escritas pelo Claude, esperando o robô publicar. |
| `respondidas.json` / `escaladas.json` | O que já foi publicado / o que foi passado para uma pessoa. |
| `caixa/entrada.enc` | Reclamações coletadas, **criptografadas** (o repositório é público). |
| `cofre.mjs`, `chave-publica.pem` | Tranca/abre o cofre. A chave privada fica só na tarefa agendada do Claude. |
| `config.json` | URLs e seletores do painel. |

## O que precisa no GitHub
Secrets `RA_EMAIL` e `RA_PASSWORD` (login da empresa no Reclame Aqui). Nada mais.

### Se o Reclame Aqui pedir captcha ou código por e-mail
O robô para e avisa. Gere uma sessão já logada no seu computador e salve como secret `RA_STORAGE_STATE`:

```bash
npx playwright codegen --save-storage=ra.json https://www.reclameaqui.com.br/area-da-empresa/
```

Faça o login na janela que abrir, feche, e depois:

```bash
base64 -w0 ra.json
```

Cole o resultado no secret `RA_STORAGE_STATE` e apague o `ra.json`.

## Rodar à mão
Actions → "Reclame Aqui – robô diário" → Run workflow → modo `auto`, `rascunho` (só coleta) ou `explorar` (só capturas para calibrar).

## Rotina do Claude (tarefa agendada diária)
1. Puxar a main, disparar o workflow (modo auto) e esperar terminar; puxar a main de novo.
2. Abrir o cofre: `RA_CHAVE_PRIVADA=... node automation/reclameaqui/cofre.mjs abrir automation/reclameaqui/caixa/entrada.enc /tmp/e.tgz && tar xzf /tmp/e.tgz -C /tmp` e ler `/tmp/saida/entrada.json`.
3. Para cada item de `novas`: seguir `diretrizes.md`. Responder → adicionar `{url, resposta, escrita_em}` em `respostas.json`.
   Escalar → adicionar `{url, motivo, data}` em `escaladas.json` e mandar e-mail para contato@tbfinance.com.br com o link e o motivo.
4. Se `erros` não estiver vazio ou houver capturas de erro, investigar e corrigir (seletores no `config.json`).
5. Nunca copiar o texto da reclamação nem dados do consumidor para arquivos abertos do repositório. Enviar para a main.
