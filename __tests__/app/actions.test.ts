import {
  getChats,
  getChat,
  removeChat,
  clearChats,
  deleteSavedFiles,
  getSharedChat,
  saveChat,
  refreshHistory,
  getMissingKeys
} from '@/app/actions'
import { kv } from '@vercel/kv'
import { del } from '@vercel/blob'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { waitFor } from '@testing-library/dom'

jest.mock('@vercel/kv', () => ({
  kv: {
    zrange: jest.fn(),
    hgetall: jest.fn(),
    hget: jest.fn(),
    zrem: jest.fn(),
    pipeline: jest.fn(() => ({
      exec: jest.fn(),
      del: jest.fn(),
      zrem: jest.fn(),
      hmset: jest.fn(),
      zadd: jest.fn()
    })),
    del: jest.fn()
  }
}))

jest.mock('@vercel/blob', () => ({
  del: jest.fn()
}))

jest.mock('@/auth', () => ({
  auth: jest.fn()
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

describe('Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getChats', () => {
    it('returns an empty array if userId is not provided', async () => {
      const result = await getChats(null)
      expect(result).toEqual([])
    })

    it('returns error if userId does not match session user ID', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      const result = await getChats('user2')
      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('fetches and returns chats from KV store', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(kv.zrange as jest.Mock).mockResolvedValue(['chat:1', 'chat:2'])
      ;(kv.pipeline as jest.Mock).mockReturnValue({
        hgetall: jest.fn(),
        exec: jest.fn().mockResolvedValue([{ id: 'chat1' }, { id: 'chat2' }])
      })

      const result = await getChats('user1')
      expect(result).toEqual([{ id: 'chat1' }, { id: 'chat2' }])
    })

    it('returns an empty array if an error occurs while fetching chats', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(kv.zrange as jest.Mock).mockImplementation(() => {
        throw new Error('KV Error')
      })

      const result = await getChats('user1')
      expect(result).toEqual([])
    })
  })

  describe('getChat', () => {
    it('returns error if userId does not match session user ID', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      const result = await getChat('chat1', 'user2')
      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('fetches and returns chat from KV store', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(kv.hgetall as jest.Mock).mockResolvedValue({
        id: 'chat1',
        userId: 'user1'
      })

      const result = await getChat('chat1', 'user1')
      expect(result).toEqual({ id: 'chat1', userId: 'user1' })
    })

    it('returns null if chat does not exist', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(kv.hgetall as jest.Mock).mockResolvedValue(null)

      const result = await getChat('chat1', 'user1')
      expect(result).toBeNull()
    })

    it('returns null if userId in chat does not match session userId', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(kv.hgetall as jest.Mock).mockResolvedValue({
        id: 'chat1',
        userId: 'user2'
      })

      const result = await getChat('chat1', 'user1')
      expect(result).toBeNull()
    })
  })

  describe('removeChat', () => {
    it('removes chat and revalidates path', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(kv.hget as jest.Mock).mockResolvedValue('user1')

      await removeChat({ id: 'chat1', path: '/chat' })

      expect(kv.del).toHaveBeenCalledWith('chat:chat1')
      expect(revalidatePath).toHaveBeenCalledWith('/')
      expect(revalidatePath).toHaveBeenCalledWith('/chat')
    })

    it('returns an error if the user is unauthorized to remove the chat', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user2' } })
      ;(kv.hget as jest.Mock).mockResolvedValue('user1')

      const result = await removeChat({ id: 'chat1', path: '/chat' })
      expect(result).toEqual({ error: 'Unauthorized' })
    })
  })

  describe('clearChats', () => {
    it('clears all chats and redirects', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(kv.zrange as jest.Mock).mockResolvedValue(['chat:1', 'chat:2'])
      const pipelineMock = {
        del: jest.fn(),
        zrem: jest.fn(),
        exec: jest.fn()
      }
      ;(kv.pipeline as jest.Mock).mockReturnValue(pipelineMock)

      await clearChats()

      expect(pipelineMock.del).toHaveBeenCalledWith('chat:1')
      expect(pipelineMock.del).toHaveBeenCalledWith('chat:2')
      expect(pipelineMock.exec).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/')
    })
  })

  describe('deleteSavedFiles', () => {
    it('deletes associated files for a chat', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(kv.hgetall as jest.Mock).mockResolvedValue({
        id: 'chat1',
        userId: 'user1',
        messages: [
          {
            files: JSON.stringify([
              { previewUrl: 'file1' },
              { previewUrl: 'file2' }
            ])
          }
        ]
      })

      await deleteSavedFiles('chat1', 'user1')
      expect(del).toHaveBeenCalledWith(['file1', 'file2'])
    })

    it('returns an error if the user is unauthorized to delete saved files', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user2' } })

      const result = await deleteSavedFiles('chat1', 'user1')
      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('redirects to / if chat does not exist when deleting saved files', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(kv.hgetall as jest.Mock).mockResolvedValue(null)

      await deleteSavedFiles('chat1', 'user1')
      expect(redirect).toHaveBeenCalledWith('/')
    })
  })

  describe('getSharedChat', () => {
    it('returns shared chat', async () => {
      ;(kv.hgetall as jest.Mock).mockResolvedValue({
        id: 'chat1',
        sharePath: '/shared'
      })

      const result = await getSharedChat('chat1')
      expect(result).toEqual({ id: 'chat1', sharePath: '/shared' })
    })

    it('returns null if shared chat does not have a sharePath', async () => {
      ;(kv.hgetall as jest.Mock).mockResolvedValue({ id: 'chat1' })

      const result = await getSharedChat('chat1')
      expect(result).toBeNull()
    })

    it('returns null if chat is not shared', async () => {
      ;(kv.hgetall as jest.Mock).mockResolvedValue(null)

      const result = await getSharedChat('chat1')
      expect(result).toBeNull()
    })
  })

  describe('saveChat', () => {
    it('saves chat to KV store', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      const pipelineMock = {
        hmset: jest.fn(),
        zadd: jest.fn(),
        exec: jest.fn()
      }
      ;(kv.pipeline as jest.Mock).mockReturnValue(pipelineMock)

      const chat = { id: 'chat1', title: 'Test Chat', userId: 'user1' }
      await saveChat(chat as any)

      expect(pipelineMock.hmset).toHaveBeenCalledWith('chat:chat1', chat)
      expect(pipelineMock.zadd).toHaveBeenCalledWith('user:chat:user1', {
        score: expect.any(Number),
        member: 'chat:chat1'
      })
    })
  })

  describe('refreshHistory', () => {
    it('redirects to the provided path', () => {
      refreshHistory('/history')
      expect(redirect).toHaveBeenCalledWith('/history')
    })
  })

  describe('getMissingKeys', () => {
    it('returns missing environment keys', async () => {
      delete process.env.NEXT_PUBLIC_OPENAI_API_KEY
      process.env.NEXT_PUBLIC_ASSISTANT_ID = 'dummy-value'

      const result = await getMissingKeys()

      expect(result).toEqual(['NEXT_PUBLIC_OPENAI_API_KEY'])
    })

    it('returns all missing keys when none are set', async () => {
      delete process.env.NEXT_PUBLIC_OPENAI_API_KEY
      delete process.env.NEXT_PUBLIC_ASSISTANT_ID

      const result = await getMissingKeys()

      expect(result).toEqual([
        'NEXT_PUBLIC_ASSISTANT_ID',
        'NEXT_PUBLIC_OPENAI_API_KEY'
      ])
    })

    it('returns an empty array if all keys are present', async () => {
      process.env.NEXT_PUBLIC_OPENAI_API_KEY = 'dummy-value'
      process.env.NEXT_PUBLIC_ASSISTANT_ID = 'dummy-value'

      const result = await getMissingKeys()

      waitFor(() => expect(result).toEqual({}))
    })

    it('returns all required keys if no environment variables are defined', async () => {
      delete process.env.NEXT_PUBLIC_OPENAI_API_KEY
      delete process.env.NEXT_PUBLIC_ASSISTANT_ID

      const result = await getMissingKeys()
      expect(result).toEqual([
        'NEXT_PUBLIC_ASSISTANT_ID',
        'NEXT_PUBLIC_OPENAI_API_KEY'
      ])
    })
  })
})
