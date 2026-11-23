# Agente de consulta de dívidas (CPF/CNPJ)

```bash
node automation/dividas/consulta.mjs 12.345.678/0001-90
node automation/dividas/consulta.mjs 123.456.789-09 --nome "NOME COMPLETO DO TITULAR"
node automation/dividas/consulta.mjs 123.456.789-09 --nome "NOME" --nascimento 05/03/1970 --mae "NOME DA MÃE" \
  --cidade "Pelotas/RS" --placa ABC1D23 --renavam 00123456789 --uf-veiculo RS --pagas   # ficha completa
node automation/dividas/consulta.mjs 12.345.678/0001-90 --pagas   # inclui as fontes PAGAS (cobra)
node automation/dividas/consulta.mjs 12.345.678/0001-90 --pagas --atualizar   # ignora o resultado guardado de hoje e cobra de novo
```

**Fontes pagas só rodam com `--pagas`, e só quando o dono da conta pedir.** Sem a flag, nada é cobrado. Resultados pagos ficam guardados 24h para não cobrar duas vezes.

O relatório sai na tela e fica salvo em `automation/dividas/relatorios/` (fora do git, porque tem dados pessoais).

## Regra principal: nada fica de fora sem aviso
Todo relatório termina com o checklist de **cobertura**:
- ✅ fonte consultada: o resultado dela é confiável;
- ❌ fonte falhou: o resultado é **desconhecido**, não "sem dívida";
- ⚠️ fonte ainda não contratada: precisa ser consultada à mão ou por um fornecedor pago.

## Fontes
| Fonte | Status | Observação |
|---|---|---|
| Dívida Ativa da União (PGFN): tributos federais, previdenciário, FGTS | ✅ ativa, grátis | Dados abertos trimestrais (~1,5 GB, baixados em `.cache/` e renovados a cada 30 dias). CNPJ: busca pela raiz e pega todas as filiais. CPF: a base mascara o CPF, por isso use `--nome` |
| Birôs (Serasa, Boa Vista, SPC, Quod) | ⚠️ precisa de contrato | Negativações, protestos, cheques, ações |
| Protestos em cartório, todo o Brasil | ✅ ativa, paga (Direct Data, R$ 8,10/consulta) | Cada título com data, valor e cartório. Não traz o credor (só o cartório informa). Token: no ambiente cloud o proxy injeta; fora dele, `DIRECTD_TOKEN` |
| Dívida ativa / débitos estaduais, 27 estados | ✅ pronta, paga (Infosimples, ~R$ 7) | SP, RJ, CE e MG trazem a lista com valores; os demais estados dão certidão positiva/negativa (sem valor) |
| Débitos trabalhistas (CNDT/TST) | ✅ pronta, paga (Infosimples, ~R$ 0,26) | Certidão positiva lista os processos |
| Processos na Justiça | ✅ pronta, paga (Infosimples, ~R$ 4) | TJ SP/RJ/MG/PR/SC + TRF1/2/3/5/6. Não entram no total (valor da ação ≠ dívida) |
| Federal em tempo real (Receita + PGFN) e FGTS | ✅ pronta, paga (~R$ 1) | Pega débito na Receita ainda não inscrito e o atraso da base aberta. Certidão de CPF precisa de `--nascimento`; FGTS só CNPJ |
| IPVA e multas PRF | ✅ pronta, paga (~R$ 2) | MG, MT, PA, PB, PI, TO por CPF/CNPJ; AM, BA, DF, PR, RO, CE, GO, MS com `--renavam`/`--placa` + `--uf-veiculo`; PRF com placa + RENAVAM |
| Dívida municipal (IPTU, ISS, taxas) | ✅ pronta, paga (~R$ 0,30) | Certidão unificada da prefeitura; precisa de `--cidade "Cidade/UF"` |
| Certidões judiciais TRF4, TJMT, TJGO, TJDF, TJRR, TJTO, TJMA | ✅ pronta, paga (~R$ 2) | Precisam de `--nome`, `--nascimento` e/ou `--mae` |
| Tribunais dos demais estados, multas de DETRAN | ⚠️ não coberta | Exigem login do titular ou muitos dados |
| SCR / Registrato (dívidas bancárias) | ❌ impossível sem o titular | O Banco Central só libera ao titular ou a um banco autorizado por ele |

**🟡 = parcial**: a fonte rodou, mas parte das consultas ficou de fora por falta de um dado do cliente (o relatório diz qual).

**Formatos a confirmar no OpenAPI da Infosimples** (data de nascimento, nome da cidade): ficam em `FORMATOS`, no topo da seção de dados extras de `infosimples.mjs`.

Infosimples: token no corpo da requisição (`INFOSIMPLES_TOKEN`), sem retentativa automática (alguns erros são cobrados). Respostas 200/612 ficam em cache por 24h.

Para ligar uma fonte paga, crie um conector em `consulta.mjs` (lista `FONTES`) e tire a fonte de `PENDENTES`.
