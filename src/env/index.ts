import 'dotenv/config'
import { z } from 'zod'
export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'production', 'test']).default('dev'),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string(),
  DEFAULT_URL: z.string(),
})

export const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Ivalid environment variables', _env.error.format())
  throw new Error('Invalid environment variables')
}

export const env = _env.data
