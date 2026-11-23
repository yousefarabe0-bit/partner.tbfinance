#!/usr/bin/env node
// Cofre das reclamações: o repositório é público, então tudo que vem do painel do Reclame Aqui é trancado aqui.
// Tranca com a chave pública (chave-publica.pem, no repositório). Só quem tem a chave privada abre
// (a tarefa agendada do Claude, que escreve as respostas).
//   node cofre.mjs selar <arquivo> <saida.enc>
//   RA_CHAVE_PRIVADA="$(cat chave.pem)" node cofre.mjs abrir <arquivo.enc> <saida>
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes, publicEncrypt, privateDecrypt, createCipheriv, createDecipheriv, constants } from 'node:crypto'

const here = dirname(fileURLToPath(import.meta.url))
const [, , acao, entrada, saida] = process.argv
const OAEP = { padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }

if (acao === 'selar') {
  const dados = readFileSync(entrada)
  const chave = randomBytes(32), iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', chave, iv)
  const cifrado = Buffer.concat([c.update(dados), c.final()])
  const chaveCifrada = publicEncrypt({ key: readFileSync(join(here, 'chave-publica.pem')), ...OAEP }, chave)
  const cab = Buffer.alloc(2); cab.writeUInt16BE(chaveCifrada.length)
  writeFileSync(saida, Buffer.concat([Buffer.from('RAC1'), cab, chaveCifrada, iv, c.getAuthTag(), cifrado]))
} else if (acao === 'abrir') {
  const pem = process.env.RA_CHAVE_PRIVADA
  if (!pem) throw new Error('Defina RA_CHAVE_PRIVADA com a chave privada (PEM).')
  const b = readFileSync(entrada)
  if (b.subarray(0, 4).toString() !== 'RAC1') throw new Error('Arquivo não é do cofre.')
  const n = b.readUInt16BE(4); let p = 6
  const chave = privateDecrypt({ key: pem, ...OAEP }, b.subarray(p, p += n))
  const iv = b.subarray(p, p += 12), tag = b.subarray(p, p += 16)
  const d = createDecipheriv('aes-256-gcm', chave, iv); d.setAuthTag(tag)
  writeFileSync(saida, Buffer.concat([d.update(b.subarray(p)), d.final()]))
} else {
  console.error('uso: node cofre.mjs selar|abrir <entrada> <saida>'); process.exit(2)
}
