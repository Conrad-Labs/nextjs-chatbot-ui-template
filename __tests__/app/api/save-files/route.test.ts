/**
 * @jest-environment node
 */

import { POST } from '@/app/api/save-files/route'
import { auth } from '@/auth'
import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import {
  Error400Response,
  Error401Response,
  Error500Response
} from '@/app/constants'

jest.mock('@/auth', () => ({
  auth: jest.fn()
}))

jest.mock('@vercel/blob', () => ({
  put: jest.fn()
}))

jest.mock('next/server', () => {
  const actualNextServer = jest.requireActual('next/server')
  return {
    ...actualNextServer,
    NextResponse: {
      json: jest.fn(data => ({ data }))
    }
  }
})

describe('POST API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should upload a file and return a blob on valid input', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: '123' } })

    const mockBlob = { key: 'mocked-blob-key', url: 'mocked-blob-url' }
    ;(put as jest.Mock).mockResolvedValue(mockBlob)

    const request = {
      url: 'https://example.com/api?chatId=chat1&filename=file1.txt&userId=123',
      body: new Uint8Array([1, 2, 3]).buffer
    } as unknown as NextRequest

    const response = await POST(request)

    expect(auth).toHaveBeenCalled()
    expect(put).toHaveBeenCalledWith(
      'user:123/chat:chat1/file1.txt',
      request.body,
      { access: 'public' }
    )

    expect(response).toEqual(NextResponse.json(mockBlob))
  })

  it('should return 401 if the user ID does not match the session user ID', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: '123' } })

    const request = {
      url: 'https://example.com/api?chatId=chat1&filename=file1.txt&userId=456',
      body: new Uint8Array([1, 2, 3]).buffer
    } as unknown as NextRequest

    const response = await POST(request)

    expect(auth).toHaveBeenCalled()
    expect(put).not.toHaveBeenCalled()

    expect(response).toEqual(
      NextResponse.json({
        status: Error401Response.status,
        message: Error401Response.message
      })
    )
  })

  it('should return 400 if required parameters are missing', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: '123' } })

    const request = {
      url: 'https://example.com/api?filename=file1.txt&userId=123',
      body: new Uint8Array([1, 2, 3]).buffer
    } as unknown as NextRequest

    const response = await POST(request)

    expect(auth).toHaveBeenCalled()
    expect(put).not.toHaveBeenCalled()

    expect(response).toEqual(
      NextResponse.json({
        status: Error400Response.status,
        error: Error400Response.message
      })
    )
  })

  it('should return 500 on unexpected errors', async () => {
    ;(auth as jest.Mock).mockRejectedValue(new Error('Unexpected Error'))

    const request = {
      url: 'https://example.com/api?chatId=chat1&filename=file1.txt&userId=123',
      body: new Uint8Array([1, 2, 3]).buffer
    } as unknown as NextRequest

    const response = await POST(request)

    expect(auth).toHaveBeenCalled()
    expect(put).not.toHaveBeenCalled()

    expect(response).toEqual(
      NextResponse.json({
        status: Error500Response.status,
        message: expect.any(Error)
      })
    )
  })
})
