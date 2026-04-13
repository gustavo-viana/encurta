import request from 'supertest'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

describe('Authenticate Controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('deve autenticar com credenciais válidas', async () => {
    const password = await bcrypt.hash('123456', 6)

    await prisma.users.create({
      data: {
        name: 'Test',
        email: 'test@email.com',
        password_hash: password,
      },
    })

    const response = await request(app.server)
      .post('/users/sessions')
      .send({
        email: 'test@email.com',
        password: '123456',
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('token')
  })

  it('não deve autenticar com senha inválida', async () => {
    const password = await bcrypt.hash('123456', 6)

    await prisma.users.create({
      data: {
        name: 'Test',
        email: 'wrong@email.com',
        password_hash: password,
      },
    })

    const response = await request(app.server)
      .post('/sessions')
      .send({
        email: 'wrong@email.com',
        password: 'senha_errada',
      })

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('message')
  })
})