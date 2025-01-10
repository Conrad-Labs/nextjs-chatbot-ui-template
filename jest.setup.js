import '@testing-library/jest-dom'
import React from 'react'

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

process.env.NEXT_PUBLIC_OPENAI_API_KEY = 'mock-api-key'
process.env.NEXT_PUBLIC_ASSISTANT_ID = 'mock-assistant-id'
process.env.NEXT_PUBLIC_VECTOR_STORE_ID = 'mock-vector-store-id'
