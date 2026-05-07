import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { UserRespository } from './usuarioRespository'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    users: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}))

const prismaMock = prisma as unknown as {
  users: {
    create: Mock
    findFirst: Mock
  }
}

describe('UserRespository', () => {
  let repository: UserRespository

  beforeEach(() => {
    repository = new UserRespository()
    vi.clearAllMocks()
  })

  it('deve criar usuário', async () => {
    const user = {
      id: 'user-1',
      name: 'Gustavo',
      email: 'gustavo@email.com',
      password_hash: 'hash',
    }
    const data = {
      name: 'Gustavo',
      email: 'gustavo@email.com',
      password_hash: 'hash',
    }
    prismaMock.users.create.mockResolvedValueOnce(user as never)

    const result = await repository.createUser(data)

    expect(result).toBe(user)
    expect(prismaMock.users.create).toHaveBeenCalledWith({ data })
  })

  it('deve buscar usuário por email', async () => {
    const user = { id: 'user-1', email: 'gustavo@email.com' }
    prismaMock.users.findFirst.mockResolvedValueOnce(user as never)

    const result = await repository.findEmail('gustavo@email.com')

    expect(result).toBe(user)
    expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
      where: {
        email: 'gustavo@email.com',
      },
    })
  })
})
