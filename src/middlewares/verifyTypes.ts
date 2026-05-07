import { z } from 'zod'
import { FastifyRequest } from 'fastify'

export async function verifyCreateUser(request: FastifyRequest) {
  const createSchema = z.object({
    nome: z.string().min(3),
    email: z.email(),
    password: z.string(),
  })

  createSchema.parse(request.body)
}

export async function verifyGetToken(request: FastifyRequest) {
  const createSchema = z.object({
    email: z.email(),
    password: z.string(),
  })

  createSchema.parse(request.body)
}

export async function verifyUrls(request: FastifyRequest) {
  const createSchema = z.object({
    urlToShorten: z.url(),
  })

  createSchema.parse(request.body)
}

export async function verifyAlias(
  request: FastifyRequest<{ Params: IFindUrls }>,
) {
  const createSchema = z.string().regex(/^\d{6}$/)

  createSchema.parse(request.params.alias)
}

export async function verifyDataToUpdateUrl(
  request: FastifyRequest<{ Body: IUpdateUrl }>,
) {
  const createSchema = z.object({
    id_url: z.uuid(),
    new_url: z.url(),
  })

  createSchema.parse(request.body)
}

export async function verifyDataToDeleteUrl(
  request: FastifyRequest<{ Body: IDeletedUrls }>,
) {
  const createSchema = z.object({
    id_url: z.uuid(),
  })

  createSchema.parse(request.body)
}
