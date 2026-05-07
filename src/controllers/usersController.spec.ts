import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EmailExists } from '@/erros/userErros'
import makeUserService from '@/factory/userFactory'
import { createUserController } from './usersController'

vi.mock('@/factory/userFactory', () => ({
  default: vi.fn(),
}))

const makeUserServiceMock = vi.mocked(makeUserService)

function makeReply() {
  return {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  }
}

describe('createUserController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve criar usuário', async () => {
    const createUserService = vi.fn().mockResolvedValue(undefined)
    makeUserServiceMock.mockReturnValue({ createUserService } as never)
    const reply = makeReply()

    await createUserController(
      {
        body: {
          nome: 'Gustavo',
          email: 'gustavo@email.com',
          password: '123456',
        },
      } as never,
      reply as never,
    )

    expect(createUserService).toHaveBeenCalledWith({
      nome: 'Gustavo',
      email: 'gustavo@email.com',
      password: '123456',
    })
    expect(reply.status).toHaveBeenCalledWith(201)
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Usuario criado com sucesso',
    })
  })

  it('deve retornar 409 quando email já existir', async () => {
    const createUserService = vi.fn().mockRejectedValue(new EmailExists())
    makeUserServiceMock.mockReturnValue({ createUserService } as never)
    const reply = makeReply()

    await createUserController(
      {
        body: {
          nome: 'Gustavo',
          email: 'gustavo@email.com',
          password: '123456',
        },
      } as never,
      reply as never,
    )

    expect(reply.status).toHaveBeenCalledWith(409)
    expect(reply.send).toHaveBeenCalledWith({ message: 'Email já existe' })
  })

  it('deve relançar erro desconhecido', async () => {
    const error = new Error('erro inesperado')
    const createUserService = vi.fn().mockRejectedValue(error)
    makeUserServiceMock.mockReturnValue({ createUserService } as never)

    await expect(() =>
      createUserController(
        {
          body: {
            nome: 'Gustavo',
            email: 'gustavo@email.com',
            password: '123456',
          },
        } as never,
        makeReply() as never,
      ),
    ).rejects.toBe(error)
  })
})
