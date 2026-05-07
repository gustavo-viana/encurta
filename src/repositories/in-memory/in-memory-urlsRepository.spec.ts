import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUrlsRepository } from './in-memory-urlsRepository'

describe('InMemoryUrlsRepository', () => {
  let repository: InMemoryUrlsRepository

  beforeEach(() => {
    repository = new InMemoryUrlsRepository()
  })

  it('deve criar url sem usuário', async () => {
    const url = await repository.createUrl('http://google.com', 'abc123')

    expect(url.id).toEqual(expect.any(String))
    expect(url.users_id).toBeNull()
  })

  it('deve retornar null ao buscar alias inexistente', async () => {
    const result = await repository.findUrlByAlias('abc123')

    expect(result).toBeNull()
  })

  it('deve falhar ao incrementar contador de url inexistente', async () => {
    await expect(() => repository.addCount('url-invalida')).rejects.toThrow(
      'URL not found',
    )
  })

  it('deve verificar o dono da url', async () => {
    const url = await repository.createUrl('http://google.com', 'abc123', 'u1')

    const owner = await repository.checkOwner('u1', url.id)
    const notOwner = await repository.checkOwner('u2', url.id)

    expect(owner).toBe(url)
    expect(notOwner).toBeNull()
  })
})
