import { FastifyInstance } from 'fastify'

import {
  verifyAlias,
  verifyDataToDeleteUrl,
  verifyDataToUpdateUrl,
  verifyUrls,
} from '@/middlewares/verifyTypes'
import {
  aliasAccessController,
  createUrlsController,
  deleteUrlsByIdController,
  listUrlsByUserIdController,
  updateUrlsByUserIdController,
} from '@/controllers/urlsController'
import {
  aliasSwagger,
  buscaUrlsSwagger,
  createUrlSwagger,
  deleteUrlSwagger,
  updateUrlSwagger,
} from '@/utils/swagger'
import { verifyJWT } from '@/middlewares/verifyJwt'

export default async function urlsRoutes(app: FastifyInstance) {
  app.get<{ Params: IFindUrls }>(
    '/:alias',
    { schema: aliasSwagger, preHandler: [verifyAlias] },
    aliasAccessController,
  )

  app.post<{ Body: ICreateUrls }>(
    '/shorten',
    { schema: createUrlSwagger, preHandler: [verifyUrls] },
    createUrlsController,
  )

  app.get(
    '/search-url',
    { schema: buscaUrlsSwagger, preHandler: [verifyJWT] },
    listUrlsByUserIdController,
  )

  app.put<{ Body: IUpdateUrl }>(
    '/update-url',
    {
      schema: updateUrlSwagger,
      preHandler: [verifyDataToUpdateUrl, verifyJWT],
    },
    updateUrlsByUserIdController,
  )

  app.delete<{ Body: IDeletedUrls }>(
    '/delete-url',
    {
      schema: deleteUrlSwagger,
      preHandler: [verifyDataToDeleteUrl, verifyJWT],
    },
    deleteUrlsByIdController,
  )
}
