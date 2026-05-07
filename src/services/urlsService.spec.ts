import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UrlsServices } from '@/services/urlsService'
import { InMemoryUrlsRepository } from '@/repositories/in-memory/in-memory-urlsRepository'
import { UrlNotFind, UrlsNotFound } from '@/erros/urlsErros'

vi.mock('@/utils/randomCharacters', () => ({
  generateSixRandomCharacters: () => 'abc123',
}))

vi.mock('@/env', () => ({
  env: {
    DEFAULT_URL: 'http://short.ly',
  },
}))

let repository: InMemoryUrlsRepository
let sut: UrlsServices

describe('UrlsServices', () => {
  beforeEach(() => {
    repository = new InMemoryUrlsRepository()
    sut = new UrlsServices(repository)
  })

  it('deve criar url com usuário', async () => {
    const result = await sut.shortenUrlsService('http://google.com', 'user-1')

    expect(result).toBe('http://short.ly/abc123')
    expect(repository.items).toHaveLength(1)
  })

  it('deve criar url sem usuário', async () => {
    const result = await sut.shortenUrlsService('http://google.com')

    expect(result).include('http://short.ly/')
  })

  it('deve buscar url e incrementar contador', async () => {
    const created = await repository.createUrl(
      'http://google.com',
      'abc123',
      'user-1',
    )

    const result = await sut.findUrlAndRedirectService('abc123')

    expect(result.urlOriginal.id).toBe(created.id)
    expect(repository.items[0].counter).toBe(1)
  })

  it('deve lançar erro se alias não existir', async () => {
    await expect(() =>
      sut.findUrlAndRedirectService('erro'),
    ).rejects.toBeInstanceOf(UrlNotFind)
  })

  it('deve listar urls do usuário', async () => {
    await repository.createUrl('url1', 'a1', 'user-1')
    await repository.createUrl('url2', 'a2', 'user-1')

    const result = await sut.listUrlsByUserIdService('user-1')

    expect(result).toHaveLength(2)
  })

  it('deve lançar erro se não tiver urls', async () => {
    await expect(() =>
      sut.listUrlsByUserIdService('user-1'),
    ).rejects.toBeInstanceOf(UrlsNotFound)
  })

  it('deve atualizar url', async () => {
    const created = await repository.createUrl(
      'old',
      'abc',
      'user-1',
    )

    const result = await sut.updateUrlsByUserIdService(
      created.id,
      'new',
      'user-1',
    )

    expect(result.newUrl).toBe('new')
    expect(repository.items[0].url).toBe('new')
  })

  it('deve falhar ao atualizar url inexistente', async () => {
    await expect(() =>
      sut.updateUrlsByUserIdService(
        'id-invalido',
        'new',
        'user-1',
      ),
    ).rejects.toBeInstanceOf(UrlNotFind)
  })

  it('deve deletar url', async () => {
    const created = await repository.createUrl(
      'url',
      'abc',
      'user-1',
    )

    const result = await sut.deleteUrlsByIdService(
      created.id,
      'user-1',
    )

    expect(result).toBe(true)
    expect(repository.items).toHaveLength(0)
  })

  it('deve falhar ao deletar url inexistente', async () => {
    await expect(() =>
      sut.deleteUrlsByIdService(
        'id-invalido',
        'user-1',
      ),
    ).rejects.toBeInstanceOf(UrlNotFind)
  })
})
