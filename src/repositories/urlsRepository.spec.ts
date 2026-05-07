import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { UrlsRepository } from './urlsRepository'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    urls: {
      create: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

const prismaMock = prisma as unknown as {
  urls: {
    create: Mock
    updateMany: Mock
    findMany: Mock
    findFirst: Mock
    update: Mock
  }
}

describe('UrlsRepository', () => {
  let repository: UrlsRepository

  beforeEach(() => {
    repository = new UrlsRepository()
    vi.clearAllMocks()
  })

  it('deve criar uma url com usuário', async () => {
    const url = { id: 'url-1', url: 'http://google.com', alias: 'abc123' }
    prismaMock.urls.create.mockResolvedValueOnce(url as never)

    const result = await repository.createUrl(
      'http://google.com',
      'abc123',
      'user-1',
    )

    expect(result).toBe(url)
    expect(prismaMock.urls.create).toHaveBeenCalledWith({
      data: {
        url: 'http://google.com',
        alias: 'abc123',
        users_id: 'user-1',
      },
    })
  })

  it('deve criar uma url sem usuário', async () => {
    const url = { id: 'url-1', url: 'http://google.com', alias: 'abc123' }
    prismaMock.urls.create.mockResolvedValueOnce(url as never)

    await repository.createUrl('http://google.com', 'abc123')

    expect(prismaMock.urls.create).toHaveBeenCalledWith({
      data: {
        url: 'http://google.com',
        alias: 'abc123',
      },
    })
  })

  it('deve atualizar uma url ativa do usuário', async () => {
    prismaMock.urls.updateMany.mockResolvedValueOnce({ count: 1 } as never)

    const count = await repository.updateUrl('new-url', 'url-1', 'user-1')

    expect(count).toBe(1)
    expect(prismaMock.urls.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'url-1',
        status: 1,
        users_id: 'user-1',
      },
      data: {
        url: 'new-url',
        updated_at: expect.any(Date),
      },
    })
  })

  it('deve listar apenas urls ativas do usuário', async () => {
    const urls = [{ id: 'url-1' }, { id: 'url-2' }]
    prismaMock.urls.findMany.mockResolvedValueOnce(urls as never)

    const result = await repository.listUrls('user-1')

    expect(result).toBe(urls)
    expect(prismaMock.urls.findMany).toHaveBeenCalledWith({
      where: { users_id: 'user-1', status: 1 },
    })
  })

  it('deve fazer soft delete de uma url ativa do usuário', async () => {
    prismaMock.urls.updateMany.mockResolvedValueOnce({ count: 1 } as never)

    const count = await repository.deleteUrl('user-1', 'url-1')

    expect(count).toBe(1)
    expect(prismaMock.urls.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'url-1',
        users_id: 'user-1',
        status: 1,
      },
      data: {
        status: 0,
        deleted_at: expect.any(Date),
      },
    })
  })

  it('deve verificar owner corretamente', async () => {
    const url = { id: 'url-1', users_id: 'user-1' }
    prismaMock.urls.findFirst.mockResolvedValueOnce(url as never)

    const result = await repository.checkOwner('user-1', 'url-1')

    expect(result).toBe(url)
    expect(prismaMock.urls.findFirst).toHaveBeenCalledWith({
      where: { users_id: 'user-1', id: 'url-1', status: 1 },
    })
  })

  it('deve buscar por alias ativo', async () => {
    const url = { id: 'url-1', alias: 'abc123' }
    prismaMock.urls.findFirst.mockResolvedValueOnce(url as never)

    const result = await repository.findUrlByAlias('abc123')

    expect(result).toBe(url)
    expect(prismaMock.urls.findFirst).toHaveBeenCalledWith({
      where: { alias: 'abc123', status: 1 },
    })
  })

  it('deve incrementar contador', async () => {
    const url = { id: 'url-1', counter: 1 }
    prismaMock.urls.update.mockResolvedValueOnce(url as never)

    const result = await repository.addCount('url-1')

    expect(result).toBe(url)
    expect(prismaMock.urls.update).toHaveBeenCalledWith({
      where: { id: 'url-1' },
      data: { counter: { increment: 1 } },
    })
  })
})
