import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IvalidCredencialsError } from '@/erros/userErros'
import makeAuthenticateService from '@/factory/authenticateFactory'
import { authenticateUserController } from './authenticateController'

vi.mock('@/factory/authenticateFactory', () => ({
  default: vi.fn(),
}))

const makeAuthenticateServiceMock = vi.mocked(makeAuthenticateService)

function makeReply() {
  return {
    jwtSign: vi.fn().mockResolvedValue('token-123'),
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  }
}

describe('authenticateUserController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve autenticar usuário', async () => {
    const execute = vi.fn().mockResolvedValue({ user: { id: 'user-1' } })
    makeAuthenticateServiceMock.mockReturnValue({ execute } as never)
    const reply = makeReply()

    await authenticateUserController(
      {
        body: {
          email: 'gustavo@email.com',
          password: '123456',
        },
      } as never,
      reply as never,
    )

    expect(execute).toHaveBeenCalledWith({
      email: 'gustavo@email.com',
      password: '123456',
    })
    expect(reply.jwtSign).toHaveBeenCalledWith(
      {},
      {
        sign: {
          sub: 'user-1',
        },
      },
    )
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith({ token: 'token-123' })
  })

  it('deve retornar 400 quando credenciais forem inválidas', async () => {
    const execute = vi.fn().mockRejectedValue(new IvalidCredencialsError())
    makeAuthenticateServiceMock.mockReturnValue({ execute } as never)
    const reply = makeReply()

    await authenticateUserController(
      {
        body: {
          email: 'gustavo@email.com',
          password: 'errada',
        },
      } as never,
      reply as never,
    )

    expect(reply.status).toHaveBeenCalledWith(400)
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Credenciais de login invalidas',
    })
  })

  it('deve relançar erro desconhecido', async () => {
    const error = new Error('erro inesperado')
    const execute = vi.fn().mockRejectedValue(error)
    makeAuthenticateServiceMock.mockReturnValue({ execute } as never)

    await expect(() =>
      authenticateUserController(
        {
          body: {
            email: 'gustavo@email.com',
            password: '123456',
          },
        } as never,
        makeReply() as never,
      ),
    ).rejects.toBe(error)
  })
})
