// urls-repository.spec.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { UrlsRepository } from './urlsRepository'
import { randomUUID } from 'crypto'

let repository: UrlsRepository
let id:string

async function makeUser() {
  return prisma.users.create({
    data: {
      email: `user-${Math.random()}@test.com`,
      password_hash: '123',
      name: 'Test',
    },
  })
}

describe('UrlsRepository (integration)', () => {
  beforeEach(async () => {
    repository = new UrlsRepository()
    await prisma.urls.deleteMany()
  })

  it('deve criar uma url', async () => {
     id = (await makeUser()).id
    const result = await repository.createUrl(
      'http://google.com',
      'abc123',
      id,
    )

    expect(result.id).toBeDefined()
    expect(result.alias).toBe('abc123')
  })

  it('deve atualizar uma url', async () => {
    const created = await repository.createUrl(
      'old-url',
      'abc',
      id,
    )

    const count = await repository.updateUrl(
      'new-url',
      created.id,
      id,
    )

    expect(count).toBe(1)

    const updated = await prisma.urls.findUnique({
      where: { id: created.id },
    })

    expect(updated?.url).toBe('new-url')
  })

  it('não deve atualizar se não for dono', async () => {
    const created = await repository.createUrl(
      'old-url',
      'abc',
      id,
    )

    const count = await repository.updateUrl(
      'new-url',
      created.id,
      '5',
    )

    expect(count).toBe(0)
  })

  it('deve listar urls do usuário', async () => {
    await repository.createUrl('url1', 'a1', id)
    await repository.createUrl('url2', 'a2', id)
    await repository.createUrl('url3', 'a3', id)

    const result = await repository.listUrls(id)

    expect(result).toHaveLength(3)
  })

  it('deve fazer soft delete', async () => {
    const created = await repository.createUrl(
      'url',
      'abc',
      id,
    )

    const count = await repository.deleteUrl(
      id,
      created.id,
    )

    expect(count).toBe(1)

    const deleted = await prisma.urls.findUnique({
      where: { id: created.id },
    })

    expect(deleted?.status).toBe(0)
  })

  it('deve verificar owner corretamente', async () => {
    const created = await repository.createUrl(
      'url',
      'abc',
      id,
    )

    const result = await repository.checkOwner(
      id,
      created.id,
    )

    expect(result).not.toBeNull()
  })

  it('não deve validar owner errado', async () => {
    const created = await repository.createUrl(
      'url',
      'abc',
      id,
    )

    const result = await repository.checkOwner(
      'id-2',
      created.id,
    )

    expect(result).toBeNull()
  })

  it('deve buscar por alias', async () => {
    await repository.createUrl('url', 'abc123', id)

    const result = await repository.findUrlByAlias('abc123')

    expect(result?.url).toBe('url')
  })

  it('deve incrementar contador', async () => {
    const created = await repository.createUrl(
      'url',
      'abc',
      id,
    )

    const updated = await repository.addCount(created.id)

    expect(updated.counter).toBe(1)
  })
})