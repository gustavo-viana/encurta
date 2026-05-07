import { describe, expect, it, vi } from 'vitest'
import {
  aliasAccessController,
  createUrlsController,
  deleteUrlsByIdController,
  listUrlsByUserIdController,
  updateUrlsByUserIdController,
} from '@/controllers/urlsController'
import { verifyJWT } from '@/middlewares/verifyJwt'
import {
  verifyAlias,
  verifyDataToDeleteUrl,
  verifyDataToUpdateUrl,
  verifyUrls,
} from '@/middlewares/verifyTypes'
import urlsRoutes from './urlsRoutes'

describe('urlsRoutes', () => {
  it('deve registrar rotas de urls', async () => {
    const app = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }

    await urlsRoutes(app as never)

    expect(app.get).toHaveBeenCalledWith(
      '/:alias',
      expect.objectContaining({
        preHandler: [verifyAlias],
      }),
      aliasAccessController,
    )
    expect(app.post).toHaveBeenCalledWith(
      '/shorten',
      expect.objectContaining({
        preHandler: [verifyUrls],
      }),
      createUrlsController,
    )
    expect(app.get).toHaveBeenCalledWith(
      '/busca-urls',
      expect.objectContaining({
        preHandler: [verifyJWT],
      }),
      listUrlsByUserIdController,
    )
    expect(app.put).toHaveBeenCalledWith(
      '/update-url',
      expect.objectContaining({
        preHandler: [verifyDataToUpdateUrl, verifyJWT],
      }),
      updateUrlsByUserIdController,
    )
    expect(app.delete).toHaveBeenCalledWith(
      '/delete-url',
      expect.objectContaining({
        preHandler: [verifyDataToDeleteUrl, verifyJWT],
      }),
      deleteUrlsByIdController,
    )
  })
})
