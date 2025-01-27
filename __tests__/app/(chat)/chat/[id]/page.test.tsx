import { notFound, redirect } from 'next/navigation'
import { render, screen, waitFor } from '@testing-library/react'
import ChatPage, { generateMetadata } from '@/app/(chat)/chat/[id]/page'
import { auth } from '@/auth'
import { getChat, getMissingKeys } from '@/app/actions'

jest.mock('@/auth', () => ({
  auth: jest.fn()
}))

jest.mock('@/app/actions', () => ({
  getChat: jest.fn(),
  getMissingKeys: jest.fn()
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('Redirected')
  }),
  notFound: jest.fn()
}))

jest.mock('@/components/chat', () => ({
  Chat: ({ id, session, initialMessages, missingKeys, threadId }: any) => (
    <div data-testid="chat-component">
      <p data-testid="chat-id">{id}</p>
      <p data-testid="chat-thread-id">{threadId}</p>
      <p data-testid="missing-keys">{missingKeys.join(', ')}</p>
      <p data-testid="messages">{initialMessages.length}</p>
    </div>
  )
}))

describe('ChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to login if user is not authenticated', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)

    await expect(ChatPage({ params: { id: 'chat-id' } })).rejects.toThrow(
      'Redirected'
    )

    expect(redirect).toHaveBeenCalledWith('/login?next=/chat/chat-id')
  })

  it('redirects to home if chat is not found', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user-id' } })
    ;(getChat as jest.Mock).mockResolvedValue(null)

    await expect(ChatPage({ params: { id: 'chat-id' } })).rejects.toThrow(
      'Redirected'
    )

    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('calls notFound if chat belongs to a different user', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user-id' } })
    ;(getChat as jest.Mock).mockResolvedValue({ userId: 'other-user-id' })

    await ChatPage({ params: { id: 'chat-id' } })

    expect(notFound).toHaveBeenCalled()
  })

  it('renders Chat component with correct props', async () => {
    const mockSession = { user: { id: 'user-id' } }
    const mockChat = {
      id: 'chat-id',
      title: 'Chat Title',
      userId: 'user-id',
      messages: [
        { id: '1', message: 'Hello', role: 'user' },
        { id: '2', message: 'Hi', role: 'assistant' }
      ],
      threadId: 'thread-id'
    }
    ;(auth as jest.Mock).mockResolvedValue(mockSession)
    ;(getChat as jest.Mock).mockResolvedValue(mockChat)
    ;(getMissingKeys as jest.Mock).mockResolvedValue([])

    const result = await ChatPage({ params: { id: 'chat-id' } })

    expect(result).toBeDefined()
    render(result)

    expect(screen.getByTestId('chat-component')).toBeInTheDocument()
    expect(screen.getByTestId('chat-id')).toHaveTextContent('chat-id')
    expect(screen.getByTestId('chat-thread-id')).toHaveTextContent('thread-id')
    expect(screen.getByTestId('missing-keys')).toHaveTextContent('')
    expect(screen.getByTestId('messages')).toHaveTextContent('2')
  })
})

describe('generateMetadata', () => {
  it('returns empty metadata if user is not authenticated', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)

    const metadata = await generateMetadata({ params: { id: 'chat-id' } })

    expect(metadata).toEqual({})
  })

  it('redirects to home if chat is not found', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user-id' } })
    ;(getChat as jest.Mock).mockResolvedValue(null)

    await expect(
      generateMetadata({ params: { id: 'chat-id' } })
    ).rejects.toThrow('Redirected')

    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('returns metadata title from chat title', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: 'user-id' } })
    ;(getChat as jest.Mock).mockResolvedValue({
      title: 'Chat Title',
      userId: 'user-id'
    })

    const metadata = await generateMetadata({ params: { id: 'chat-id' } })

    expect(metadata).toEqual({ title: 'Chat Title' })
  })
})
