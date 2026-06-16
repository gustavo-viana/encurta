import { app } from './app'
import { env } from '../src/env'
import semver from 'semver'
import 'dotenv/config'

const allowedVersion = '22.22.1'
const nodeVersion = process.version // ex: 'v20.4.0'

if (!semver.satisfies(nodeVersion, allowedVersion)) {
  console.error('Versão do Node não suportada')
  process.exit(1)
}
const host = '0.0.0.0'
app
  .listen({
    host,
    port: env.PORT,
  })
  .then(() => {
    console.log('Server listening')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
