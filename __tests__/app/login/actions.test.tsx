/**
 * @jest-environment node
 */

import { authenticate } from '@/app/login/actions'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { ResultCode } from '@/lib/utils'
import { SuccessMessage, ErrorMessage } from '@/app/constants'

jest.mock('@/auth', () => ({
  signIn: jest.fn()
}))

jest.mock('@vercel/kv', () => ({
  kv: {
    hgetall: jest.fn()
  }
}))

jest.mock('next-auth', () => {
  class MockAuthError extends Error {
    type: string
    constructor(type: string) {
      super('AuthError')
      this.type = type
    }
  }
  return { AuthError: MockAuthError }
})

describe('authenticate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should log the user in with valid credentials', async () => {
    const formData = new FormData()
    formData.set('email', 'valid@example.com')
    formData.set('password', 'validpassword')
    ;(signIn as jest.Mock).mockResolvedValueOnce(undefined)

    const result = await authenticate(undefined, formData)

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'valid@example.com',
      password: 'validpassword',
      redirect: false
    })

    expect(result).toEqual({
      type: SuccessMessage.message,
      resultCode: ResultCode.UserLoggedIn
    })
  })

  it('should return InvalidCredentials for invalid credentials', async () => {
    const formData = new FormData()
    formData.set('email', 'invalid-email')
    formData.set('password', '123')

    const result = await authenticate(undefined, formData)

    expect(result).toEqual({
      type: ErrorMessage.message,
      resultCode: ResultCode.InvalidCredentials
    })

    expect(signIn).not.toHaveBeenCalled()
  })

  it('should return InvalidCredentials if signIn throws an AuthError of type CredentialsSignin', async () => {
    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', 'password123')
    ;(signIn as jest.Mock).mockRejectedValueOnce(
      new AuthError('CredentialsSignin')
    )

    const result = await authenticate(undefined, formData)

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'user@example.com',
      password: 'password123',
      redirect: false
    })

    expect(result).toEqual({
      type: ErrorMessage.message,
      resultCode: ResultCode.InvalidCredentials
    })
  })

  it('should return UnknownError if signIn throws an unknown AuthError', async () => {
    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', 'password123')
    ;(signIn as jest.Mock).mockRejectedValueOnce(
      new AuthError('SomeOtherError')
    )

    const result = await authenticate(undefined, formData)

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'user@example.com',
      password: 'password123',
      redirect: false
    })

    expect(result).toEqual({
      type: ErrorMessage.message,
      resultCode: ResultCode.UnknownError
    })
  })

  it('should return UnknownError for any non-AuthError error', async () => {
    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', 'password123')
    ;(signIn as jest.Mock).mockRejectedValueOnce(new Error('UnexpectedError'))

    const result = await authenticate(undefined, formData)

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'user@example.com',
      password: 'password123',
      redirect: false
    })

    expect(result).toEqual({
      type: ErrorMessage.message,
      resultCode: ResultCode.UnknownError
    })
  })
})
