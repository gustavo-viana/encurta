import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UrlNotFind, UrlsNotFound, YouAreNotTheOwner } from '@/erros/urlsErros'
import makeUrlsService from '@/factory/urlsFactory'
import {
  aliasAccessController,
  createUrlsController,
  deleteUrlsByIdController,
  listUrlsByUserIdController,
  updateUrlsByUserIdController,
} from './urlsController'

vi.mock('@/factory/urlsFactory', () => ({
  default: vi.fn(),
}))

const makeUrlsServiceMock = vi.mocked(makeUrlsService)

function makeReply() {
  return {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
  }
}

describe('urlsController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve encurtar url sem usuário autenticado', async () => {
    const shortenUrlsService = vi.fn().mockResolvedValue('http://short.ly/a1')
    makeUrlsServiceMock.mockReturnValue({ shortenUrlsService } as never)
    const reply = makeReply()

    await createUrlsController(
      {
        body: { urlToShorten: 'https://google.com' },
        headers: {},
      } as never,
      reply as never,
    )

    expect(shortenUrlsService).toHaveBeenCalledWith('https://google.com')
    expect(reply.status).toHaveBeenCalledWith(201)
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Url Encurtada com sucesso',
      url: 'http://short.ly/a1',
    })
  })

  it('deve encurtar url com usuário autenticado', async () => {
    const shortenUrlsService = vi.fn().mockResolvedValue('http://short.ly/a1')
    makeUrlsServiceMock.mockReturnValue({ shortenUrlsService } as never)
    const reply = makeReply()

    await createUrlsController(
      {
        body: { urlToShorten: 'https://google.com' },
        headers: { authorization: 'Bearer token' },
        jwtVerify: vi.fn().mockResolvedValue(undefined),
        user: { sub: 'user-1' },
      } as never,
      reply as never,
    )

    expect(shortenUrlsService).toHaveBeenCalledWith(
      'https://google.com',
      'user-1',
    )
    expect(reply.status).toHaveBeenCalledWith(201)
  })

  it('deve retornar 401 quando token opcional for inválido', async () => {
    const reply = makeReply()

    await createUrlsController(
      {
        body: { urlToShorten: 'https://google.com' },
        headers: { authorization: 'Bearer token' },
        jwtVerify: vi.fn().mockRejectedValue(new Error('invalid token')),
      } as never,
      reply as never,
    )

    expect(reply.status).toHaveBeenCalledWith(401)
    expect(reply.send).toHaveBeenCalledWith({
      error: 'Token Expirado ou invalido',
    })
  })

  it('deve tratar erro de owner ao encurtar url', async () => {
    const shortenUrlsService = vi.fn().mockRejectedValue(new YouAreNotTheOwner())
    makeUrlsServiceMock.mockReturnValue({ shortenUrlsService } as never)
    const reply = makeReply()

    await createUrlsController(
      {
        body: { urlToShorten: 'https://google.com' },
        headers: {},
      } as never,
      reply as never,
    )

    expect(reply.status).toHaveBeenCalledWith(404)
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Você não tem acesso ao objeto solicitado',
    })
  })

  it('deve relançar erro desconhecido ao encurtar url', async () => {
    const error = new Error('erro inesperado')
    const shortenUrlsService = vi.fn().mockRejectedValue(error)
    makeUrlsServiceMock.mockReturnValue({ shortenUrlsService } as never)

    await expect(() =>
      createUrlsController(
        {
          body: { urlToShorten: 'https://google.com' },
          headers: {},
        } as never,
        makeReply() as never,
      ),
    ).rejects.toBe(error)
  })

  it('deve redirecionar pelo alias', async () => {
    const findUrlAndRedirectService = vi.fn().mockResolvedValue({
      urlOriginal: { url: 'https://google.com' },
    })
    makeUrlsServiceMock.mockReturnValue({ findUrlAndRedirectService } as never)
    const reply = makeReply()

    await aliasAccessController(
      {
        params: { alias: 'abc123' },
      } as never,
      reply as never,
    )

    expect(findUrlAndRedirectService).toHaveBeenCalledWith('abc123')
    expect(reply.redirect).toHaveBeenCalledWith('https://google.com')
  })

  it('deve retornar 404 quando alias não existir', async () => {
    const findUrlAndRedirectService = vi.fn().mockRejectedValue(new UrlNotFind())
    makeUrlsServiceMock.mockReturnValue({ findUrlAndRedirectService } as never)
    const reply = makeReply()

    await aliasAccessController(
      {
        params: { alias: 'abc123' },
      } as never,
      reply as never,
    )

    expect(reply.status).toHaveBeenCalledWith(404)
    expect(reply.send).toHaveBeenCalledWith({ message: "Url N'ao encontrada" })
  })

  it('deve relançar erro desconhecido ao buscar alias', async () => {
    const error = new Error('erro inesperado')
    const findUrlAndRedirectService = vi.fn().mockRejectedValue(error)
    makeUrlsServiceMock.mockReturnValue({ findUrlAndRedirectService } as never)

    await expect(() =>
      aliasAccessController(
        {
          params: { alias: 'abc123' },
        } as never,
        makeReply() as never,
      ),
    ).rejects.toBe(error)
  })

  it('deve listar urls do usuário', async () => {
    const urls = [{ id: 'url-1' }]
    const listUrlsByUserIdService = vi.fn().mockResolvedValue(urls)
    makeUrlsServiceMock.mockReturnValue({ listUrlsByUserIdService } as never)
    const reply = makeReply()

    await listUrlsByUserIdController(
      {
        user: { sub: 'user-1' },
      } as never,
      reply as never,
    )

    expect(listUrlsByUserIdService).toHaveBeenCalledWith('user-1')
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith({ urls })
  })

  it('deve retornar 404 quando usuário não tiver urls', async () => {
    const listUrlsByUserIdService = vi.fn().mockRejectedValue(new UrlsNotFound())
    makeUrlsServiceMock.mockReturnValue({ listUrlsByUserIdService } as never)
    const reply = makeReply()

    await listUrlsByUserIdController(
      {
        user: { sub: 'user-1' },
      } as never,
      reply as never,
    )

    expect(reply.status).toHaveBeenCalledWith(404)
    expect(reply.send).toHaveBeenCalledWith({ message: 'você não possui urls' })
  })

  it('deve relançar erro desconhecido ao listar urls', async () => {
    const error = new Error('erro inesperado')
    const listUrlsByUserIdService = vi.fn().mockRejectedValue(error)
    makeUrlsServiceMock.mockReturnValue({ listUrlsByUserIdService } as never)

    await expect(() =>
      listUrlsByUserIdController(
        {
          user: { sub: 'user-1' },
        } as never,
        makeReply() as never,
      ),
    ).rejects.toBe(error)
  })

  it('deve atualizar url do usuário', async () => {
    const updateUrlsByUserIdService = vi.fn().mockResolvedValue({
      newUrl: 'https://google.com',
    })
    makeUrlsServiceMock.mockReturnValue({ updateUrlsByUserIdService } as never)
    const reply = makeReply()

    await updateUrlsByUserIdController(
      {
        body: {
          id_url: 'url-1',
          new_url: 'https://google.com',
        },
        user: { sub: 'user-1' },
      } as never,
      reply as never,
    )

    expect(updateUrlsByUserIdService).toHaveBeenCalledWith(
      'url-1',
      'https://google.com',
      'user-1',
    )
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Url atualizada com sucesso para https://google.com',
    })
  })

  it('deve retornar 404 ao atualizar url inexistente', async () => {
    const updateUrlsByUserIdService = vi.fn().mockRejectedValue(new UrlNotFind())
    makeUrlsServiceMock.mockReturnValue({ updateUrlsByUserIdService } as never)
    const reply = makeReply()

    await updateUrlsByUserIdController(
      {
        body: {
          id_url: 'url-1',
          new_url: 'https://google.com',
        },
        user: { sub: 'user-1' },
      } as never,
      reply as never,
    )

    expect(reply.status).toHaveBeenCalledWith(404)
    expect(reply.send).toHaveBeenCalledWith({ message: 'Url não encontrada' })
  })

  it('deve relançar erro desconhecido ao atualizar url', async () => {
    const error = new Error('erro inesperado')
    const updateUrlsByUserIdService = vi.fn().mockRejectedValue(error)
    makeUrlsServiceMock.mockReturnValue({ updateUrlsByUserIdService } as never)

    await expect(() =>
      updateUrlsByUserIdController(
        {
          body: {
            id_url: 'url-1',
            new_url: 'https://google.com',
          },
          user: { sub: 'user-1' },
        } as never,
        makeReply() as never,
      ),
    ).rejects.toBe(error)
  })

  it('deve deletar url do usuário', async () => {
    const deleteUrlsByIdService = vi.fn().mockResolvedValue(true)
    makeUrlsServiceMock.mockReturnValue({ deleteUrlsByIdService } as never)
    const reply = makeReply()

    await deleteUrlsByIdController(
      {
        body: { id_url: 'url-1' },
        user: { sub: 'user-1' },
      } as never,
      reply as never,
    )

    expect(deleteUrlsByIdService).toHaveBeenCalledWith('url-1', 'user-1')
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Url deletada com sucesso',
    })
  })

  it('deve retornar 404 ao deletar url inexistente', async () => {
    const deleteUrlsByIdService = vi.fn().mockRejectedValue(new UrlNotFind())
    makeUrlsServiceMock.mockReturnValue({ deleteUrlsByIdService } as never)
    const reply = makeReply()

    await deleteUrlsByIdController(
      {
        body: { id_url: 'url-1' },
        user: { sub: 'user-1' },
      } as never,
      reply as never,
    )

    expect(reply.status).toHaveBeenCalledWith(404)
    expect(reply.send).toHaveBeenCalledWith({ message: 'url não encontrada' })
  })

  it('deve relançar erro desconhecido ao deletar url', async () => {
    const error = new Error('erro inesperado')
    const deleteUrlsByIdService = vi.fn().mockRejectedValue(error)
    makeUrlsServiceMock.mockReturnValue({ deleteUrlsByIdService } as never)

    await expect(() =>
      deleteUrlsByIdController(
        {
          body: { id_url: 'url-1' },
          user: { sub: 'user-1' },
        } as never,
        makeReply() as never,
      ),
    ).rejects.toBe(error)
  })
})
