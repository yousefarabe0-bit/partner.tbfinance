# Agente de consulta de dívidas (CPF/CNPJ)

```bash
node automation/dividas/consulta.mjs 12.345.678/0001-90
node automation/dividas/consulta.mjs 123.456.789-09 --nome "NOME COMPLETO DO TITULAR"
node automation/dividas/consulta.mjs 12.345.678/0001-90 --sem-pagas   # pula as fontes pagas
```

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
| Dívida ativa estadual e municipal, CNDT, CRF FGTS, processos | ⚠️ precisa de agregador pago | Captcha / um sistema por órgão |
| SCR / Registrato (dívidas bancárias) | ❌ impossível sem o titular | O Banco Central só libera ao titular ou a um banco autorizado por ele |

Para ligar uma fonte paga, crie um conector em `consulta.mjs` (lista `FONTES`) e tire a fonte de `PENDENTES`.
