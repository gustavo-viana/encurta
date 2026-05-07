import { describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import {
  verifyAlias,
  verifyCreateUser,
  verifyDataToDeleteUrl,
  verifyDataToUpdateUrl,
  verifyGetToken,
  verifyUrls,
} from './verifyTypes'

describe('verifyTypes', () => {
  it('deve validar criação de usuário', async () => {
    await expect(
      verifyCreateUser({
        body: {
          nome: 'Gustavo',
          email: 'gustavo@email.com',
          password: '123456',
        },
      } as never),
    ).resolves.toBeUndefined()
  })

  it('deve rejeitar criação de usuário inválida', async () => {
    await expect(
      verifyCreateUser({
        body: { nome: 'Gu', email: 'email-invalido', password: '123456' },
      } as never),
    ).rejects.toBeInstanceOf(ZodError)
  })

  it('deve validar login', async () => {
    await expect(
      verifyGetToken({
        body: { email: 'gustavo@email.com', password: '123456' },
      } as never),
    ).resolves.toBeUndefined()
  })

  it('deve rejeitar login inválido', async () => {
    await expect(
      verifyGetToken({
        body: { email: 'email-invalido', password: '123456' },
      } as never),
    ).rejects.toBeInstanceOf(ZodError)
  })

  it('deve validar url para encurtar', async () => {
    await expect(
      verifyUrls({
        body: { urlToShorten: 'https://google.com' },
      } as never),
    ).resolves.toBeUndefined()
  })

  it('deve rejeitar url inválida', async () => {
    await expect(
      verifyUrls({
        body: { urlToShorten: 'url-invalida' },
      } as never),
    ).rejects.toBeInstanceOf(ZodError)
  })

  it('deve validar alias numérico com seis caracteres', async () => {
    await expect(
      verifyAlias({
        params: { alias: '123456' },
      } as never),
    ).resolves.toBeUndefined()
  })

  it('deve rejeitar alias inválido', async () => {
    await expect(
      verifyAlias({
        params: { alias: 'abc123' },
      } as never),
    ).rejects.toBeInstanceOf(ZodError)
  })

  it('deve validar atualização de url', async () => {
    await expect(
      verifyDataToUpdateUrl({
        body: {
          id_url: 'b3bf7764-8c4f-4f7a-93ce-c17c801a4ef0',
          new_url: 'https://google.com',
        },
      } as never),
    ).resolves.toBeUndefined()
  })

  it('deve rejeitar atualização de url inválida', async () => {
    await expect(
      verifyDataToUpdateUrl({
        body: {
          id_url: 'id-invalido',
          new_url: 'url-invalida',
        },
      } as never),
    ).rejects.toBeInstanceOf(ZodError)
  })

  it('deve validar exclusão de url', async () => {
    await expect(
      verifyDataToDeleteUrl({
        body: { id_url: 'b3bf7764-8c4f-4f7a-93ce-c17c801a4ef0' },
      } as never),
    ).resolves.toBeUndefined()
  })

  it('deve rejeitar exclusão de url inválida', async () => {
    await expect(
      verifyDataToDeleteUrl({
        body: { id_url: 'id-invalido' },
      } as never),
    ).rejects.toBeInstanceOf(ZodError)
  })
})
