import { FastifyReply, FastifyRequest } from 'fastify'
import makeUrlsService from '@/factory/urlsFactory'
import { UrlNotFind, UrlsNotFound, YouAreNotTheOwner } from '@/erros/urlsErros'

export async function createUrlsController(
  request: FastifyRequest<{ Body: ICreateUrls }>,
  reply: FastifyReply,
) {
  const { urlToShorten } = request.body
  const authHeader = request.headers.authorization
  if (authHeader) {
    try {
      await request.jwtVerify()
    } catch (error) {
      return reply.status(401).send({ error: 'Token Expirado ou invalido' })
    }
  }
  const user_id = request.user?.sub
  try {
    const urlsRespository = makeUrlsService()
    if (user_id) {
      const newUrl = await urlsRespository.shortenUrlsService(
        urlToShorten,
        user_id,
      )
      return reply
        .status(201)
        .send({ message: 'Url Encurtada com sucesso', url: newUrl })
    } else {
      const newUrl = await urlsRespository.shortenUrlsService(urlToShorten)
      return reply
        .status(201)
        .send({ message: 'Url Encurtada com sucesso', url: newUrl })
    }
  } catch (e) {
    if (e instanceof YouAreNotTheOwner) {
      return reply.status(404).send({ message: e.message })
    }
    throw e
  }
}

export async function aliasAccessController(
  request: FastifyRequest<{ Params: IFindUrls }>,
  reply: FastifyReply,
) {
  const urlsRespository = makeUrlsService()
  const { alias } = request.params as { alias: string }
  try {
    const { urlOriginal } =
      await urlsRespository.findUrlAndRedirectService(alias)
    return reply.redirect(urlOriginal.url)
  } catch (e) {
    if (e instanceof UrlNotFind) {
      return reply.status(404).send({ message: "Url N'ao encontrada" })
    }
    throw e
  }
}

export async function listUrlsByUserIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const urlsRespository = makeUrlsService()
  try {
    const user_id = request.user.sub
    const urls = await urlsRespository.listUrlsByUserIdService(user_id)
    return reply.status(200).send({ urls })
  } catch (e) {
    if (e instanceof UrlsNotFound) {
      return reply.status(404).send({ message: 'você não possui urls' })
    }
    throw e
  }
}

export async function updateUrlsByUserIdController(
  request: FastifyRequest<{ Body: IUpdateUrl }>,
  reply: FastifyReply,
) {
  const urlsRespository = makeUrlsService()
  const { id_url, new_url } = request.body
  const user_id = request.user.sub
  try {
    const { newUrl } = await urlsRespository.updateUrlsByUserIdService(
      id_url,
      new_url,
      user_id,
    )
    return reply
      .status(200)
      .send({ message: `Url atualizada com sucesso para ${newUrl}` })
  } catch (e) {
    if (e instanceof UrlNotFind) {
      return reply.status(404).send({ message: 'Url não encontrada' })
    }
    throw e
  }
}

export async function deleteUrlsByIdController(
  request: FastifyRequest<{ Body: IDeletedUrls }>,
  reply: FastifyReply,
) {
  const { id_url } = request.body
  const urlsRespository = makeUrlsService()
  const user_id = request.user.sub

  try {
    await urlsRespository.deleteUrlsByIdService(id_url, user_id)
    return reply.status(200).send({ message: 'Url deletada com sucesso' }) // podia ser 204 sem corpo mas acho que fica menos semantico pra quem olha
  } catch (e) {
    if (e instanceof UrlNotFind) {
      return reply.status(404).send({ message: 'url não encontrada' })
    }
    throw e
  }
}
