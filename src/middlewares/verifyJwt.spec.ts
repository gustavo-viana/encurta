import { describe, expect, it, vi } from 'vitest'
import { verifyJWT } from './verifyJwt'

function makeReply() {
  return {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  }
}

describe('verifyJWT', () => {
  it('deve aceitar jwt válido', async () => {
    const request = {
      jwtVerify: vi.fn().mockResolvedValue(undefined),
    }
    const reply = makeReply()

    await verifyJWT(request as never, reply as never)

    expect(request.jwtVerify).toHaveBeenCalled()
    expect(reply.status).not.toHaveBeenCalled()
  })

  it('deve retornar 401 quando jwt for inválido', async () => {
    const request = {
      jwtVerify: vi.fn().mockRejectedValue(new Error('invalid token')),
    }
    const reply = makeReply()

    await verifyJWT(request as never, reply as never)

    expect(reply.status).toHaveBeenCalledWith(401)
    expect(reply.send).toHaveBeenCalledWith({ error: 'Unauthorized' })
  })
})
