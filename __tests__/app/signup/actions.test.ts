/**
 * @jest-environment node
 */

import { createUser, signup } from '@/app/signup/actions'
import { getUser } from '@/app/login/actions'
import { kv } from '@vercel/kv'
import { signIn } from '@/auth'
import { ResultCode } from '@/lib/utils'

jest.mock('@/app/login/actions', () => ({
  getUser: jest.fn()
}))

jest.mock('@vercel/kv', () => ({
  kv: {
    hmset: jest.fn()
  }
}))

jest.mock('@/auth', () => ({
  signIn: jest.fn()
}))

jest.mock('@/lib/utils', () => ({
  ResultCode: {
    UserAlreadyExists: 'UserAlreadyExists',
    UserCreated: 'UserCreated',
    InvalidCredentials: 'InvalidCredentials',
    UnknownError: 'UnknownError'
  },
  getStringFromBuffer: jest.fn(() => 'mockedHashedPassword')
}))

jest.mock('next-auth', () => {
  const AuthError = class extends Error {
    type: string
    constructor(type: string) {
      super('AuthError')
      this.type = type
    }
  }

  return {
    AuthError
  }
})

describe('createUser', () => {
  it('should return UserAlreadyExists if user exists', async () => {
    ;(getUser as jest.Mock).mockResolvedValue({
      id: '123',
      email: 'test@example.com'
    })

    const result = await createUser(
      'test@example.com',
      'hashedPassword',
      'salt'
    )

    expect(result).toEqual({
      type: 'error',
      resultCode: ResultCode.UserAlreadyExists
    })
    expect(getUser).toHaveBeenCalledWith('test@example.com')
    expect(kv.hmset).not.toHaveBeenCalled()
  })

  it('should create a new user if none exists', async () => {
    ;(getUser as jest.Mock).mockResolvedValue(null)
    ;(kv.hmset as jest.Mock).mockResolvedValue(undefined)

    const result = await createUser(
      'newuser@example.com',
      'hashedPassword',
      'salt'
    )

    expect(result).toEqual({
      type: 'success',
      resultCode: ResultCode.UserCreated
    })
    expect(kv.hmset).toHaveBeenCalledWith('user:newuser@example.com', {
      id: expect.any(String),
      email: 'newuser@example.com',
      password: 'hashedPassword',
      salt: 'salt'
    })
  })
})

describe('signup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return InvalidCredentials if input validation fails', async () => {
    const formData = new FormData()
    formData.set('email', 'invalid-email')
    formData.set('password', '123')

    const result = await signup(undefined, formData)

    expect(result).toEqual({
      type: 'error',
      resultCode: ResultCode.InvalidCredentials
    })
  })

  it('should create a user and sign them in on valid input', async () => {
    const formData = new FormData()
    formData.set('email', 'valid@example.com')
    formData.set('password', 'strongpassword')
    ;(getUser as jest.Mock).mockResolvedValue(null)
    ;(kv.hmset as jest.Mock).mockResolvedValue(undefined)

    const result = await signup(undefined, formData)

    expect(result).toEqual({
      type: 'success',
      resultCode: ResultCode.UserCreated
    })
    expect(getUser).toHaveBeenCalledWith('valid@example.com')
    expect(kv.hmset).toHaveBeenCalledWith('user:valid@example.com', {
      id: expect.any(String),
      email: 'valid@example.com',
      password: 'mockedHashedPassword',
      salt: expect.any(String)
    })
    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'valid@example.com',
      password: 'strongpassword',
      redirect: false
    })
  })

  it('should return InvalidCredentials if createUser throws an AuthError of type CredentialsSignin', async () => {
    const formData = new FormData()
    formData.set('email', 'valid@example.com')
    formData.set('password', 'strongpassword')
    ;(getUser as jest.Mock).mockResolvedValue(null)
    ;(kv.hmset as jest.Mock).mockImplementation(() => {
      throw new (jest.requireMock('next-auth').AuthError)('CredentialsSignin')
    })

    const result = await signup(undefined, formData)

    expect(result).toEqual({
      type: 'error',
      resultCode: ResultCode.InvalidCredentials
    })
  })

  it('should return UnknownError if createUser throws an unknown AuthError type', async () => {
    const formData = new FormData()
    formData.set('email', 'valid@example.com')
    formData.set('password', 'strongpassword')
    ;(getUser as jest.Mock).mockResolvedValue(null)
    ;(kv.hmset as jest.Mock).mockImplementation(() => {
      throw new (jest.requireMock('next-auth').AuthError)('UnknownErrorType')
    })

    const result = await signup(undefined, formData)

    expect(result).toEqual({
      type: 'error',
      resultCode: ResultCode.UnknownError
    })
  })

  it('should return UnknownError if createUser throws a non-AuthError', async () => {
    const formData = new FormData()
    formData.set('email', 'valid@example.com')
    formData.set('password', 'strongpassword')
    ;(getUser as jest.Mock).mockResolvedValue(null)
    ;(kv.hmset as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const result = await signup(undefined, formData)

    expect(result).toEqual({
      type: 'error',
      resultCode: ResultCode.UnknownError
    })
  })
})
