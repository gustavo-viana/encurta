import { hash } from 'bcryptjs'
import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '@/repositories/in-memory/in-memory-usersRespository'
import { AuthenticateUserService } from './authenticateService'
import { IvalidCredencialsError } from '@/erros/userErros'

let userRespository: InMemoryUserRepository
let sut: AuthenticateUserService

describe('Auth User Service', () => {
  beforeEach(() => {
    userRespository = new InMemoryUserRepository()
    sut = new AuthenticateUserService(userRespository)
  })
  it('Deve ser possivel se autenticar', async () => {
    await userRespository.createUser({
      name: 'Gustavo',
      email: 'gustavo@hotmail.com',
      password_hash: await hash('123456', 4),
    })

    const { user } = await sut.execute({
      email: 'gustavo@hotmail.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('Nao deve ser possivel autenticar com email incorreto', async () => {
    await userRespository.createUser({
      name: 'Gustavo',
      email: 'gustavo@hotmail.com',
      password_hash: await hash('123456', 4),
    })

    expect(
      async () =>
        await sut.execute({
          email: 'gustavo@howtmail.com',
          password: '000000',
        }),
    ).rejects.toBeInstanceOf(IvalidCredencialsError)
  })

  it('Nao deve ser possivel autenticar com Senha incorreta', async () => {
    await userRespository.createUser({
      name: 'Gustavo',
      email: 'gustavo@hotmail.com',
      password_hash: await hash('123456', 4),
    })

    expect(
      async () =>
        await sut.execute({
          email: 'gustavo@hotmail.com',
          password: '000000',
        }),
    ).rejects.toBeInstanceOf(IvalidCredencialsError)
  })
})
