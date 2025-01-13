import '@testing-library/jest-dom'
import React from 'react'
import { Request, Response, Headers } from 'node-fetch'

global.Request = Request
global.Response = Response
global.Headers = Headers

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        pathname: 'mockPath',
        url: 'mockUrl',
        contentType: 'mockType',
        downloadUrl: 'mockDownloadUrl'
      }),
    headers: {
      get: () => 'application/json'
    }
  })
)

// global.crypto = {
//   randomUUID: jest.fn(() => 'mocked-uuid'),
//   subtle: {
//     digest: jest.fn(() => Promise.resolve(new Uint8Array([1, 2, 3, 4]).buffer))
//   }
// }

process.env.NEXT_PUBLIC_OPENAI_API_KEY = 'mock-api-key'
process.env.NEXT_PUBLIC_ASSISTANT_ID = 'mock-assistant-id'
process.env.NEXT_PUBLIC_VECTOR_STORE_ID = 'mock-vector-store-id'
