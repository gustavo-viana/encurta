import { describe, expect, it } from 'vitest'
import { AuthenticateUserService } from '@/services/authenticateService'
import { UrlsServices } from '@/services/urlsService'
import { UsersService } from '@/services/userService'
import makeAuthenticateService from './authenticateFactory'
import makeUrlsService from './urlsFactory'
import makeUserService from './userFactory'

describe('Factories', () => {
  it('deve criar UsersService', () => {
    expect(makeUserService()).toBeInstanceOf(UsersService)
  })

  it('deve criar UrlsServices', () => {
    expect(makeUrlsService()).toBeInstanceOf(UrlsServices)
  })

  it('deve criar AuthenticateUserService', () => {
    expect(makeAuthenticateService()).toBeInstanceOf(AuthenticateUserService)
  })
})
