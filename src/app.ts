import fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { env } from './env'
import usersRoutes from './routes/userRoutes'
import { z, ZodError } from 'zod'
import fastifyJwt from '@fastify/jwt'
import urlsRoutes from './routes/urlsRoutes'
import 'dotenv/config'

export const app = fastify({
  ajv: {
    customOptions: {
      strict: false,
    },
  },
  logger: env.NODE_ENV === 'dev',
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Encurtador de links',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  staticCSP: true,
  transformStaticCSP: (header) => header,
  uiConfig: {
    persistAuthorization: true,
  },
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(usersRoutes, {
  prefix: '/users',
})

app.register(urlsRoutes, {
  prefix: '/urls',
})

// Tradando erros não mapeados pelas classes de erro definidas
app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Erro de Validação', issue: z.treeifyError(error) })
  }
  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: Logar no Gray LOG
  }
  return reply.status(500).send({ message: 'Internal server error' })
})
