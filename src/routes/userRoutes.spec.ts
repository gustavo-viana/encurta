import { describe, expect, it, vi } from 'vitest'
import { authenticateUserController } from '@/controllers/authenticateController'
import { createUserController } from '@/controllers/usersController'
import { verifyCreateUser, verifyGetToken } from '@/middlewares/verifyTypes'
import usersRoutes from './userRoutes'

describe('usersRoutes', () => {
  it('deve registrar rotas de usuários', async () => {
    const app = {
      post: vi.fn(),
    }

    await usersRoutes(app as never)

    expect(app.post).toHaveBeenCalledTimes(2)
    expect(app.post).toHaveBeenCalledWith(
      '/create',
      expect.objectContaining({
        preHandler: [verifyCreateUser],
      }),
      createUserController,
    )
    expect(app.post).toHaveBeenCalledWith(
      '/sessions',
      expect.objectContaining({
        preHandler: [verifyGetToken],
      }),
      authenticateUserController,
    )
  })
})
