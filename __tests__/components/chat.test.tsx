import { render, screen } from '@testing-library/react'
import { Chat } from '@/components/chat'
import { createTestStore } from '../utils/create-test-store'
import { Provider } from 'react-redux'

jest.mock('@/components/chat-list', () => ({
  ChatList: () => <div data-testid="mock-chat-list">ChatList</div>
}))

jest.mock('@/components/chat-panel', () => ({
  ChatPanel: ({
    input,
    setInput,
    isAtBottom,
    scrollToBottom
  }: {
    input: string
    setInput: (value: string) => void
    isAtBottom: boolean
    scrollToBottom: () => void
  }) => (
    <div data-testid="mock-chat-panel">
      <button
        onClick={() => setInput('Test Input')}
        data-testid="mock-set-input"
      >
        Set Input
      </button>
      <button onClick={scrollToBottom} data-testid="mock-scroll">
        Scroll
      </button>
    </div>
  )
}))

jest.mock('@/components/empty-screen', () => ({
  EmptyScreen: () => <div data-testid="mock-empty-screen">EmptyScreen</div>
}))

jest.mock('@/lib/hooks/use-scroll-anchor', () => ({
  useScrollAnchor: jest.fn(() => ({
    messagesRef: jest.fn(),
    scrollRef: jest.fn(),
    visibilityRef: jest.fn(),
    isAtBottom: true,
    scrollToBottom: jest.fn()
  }))
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/chat/1'),
  useRouter: jest.fn(() => ({
    refresh: jest.fn()
  }))
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}))

describe('Chat Component', () => {
  let store: any
  const defaultProps = {
    id: '1',
    initialMessages: [],
    className: '',
    session: { user: { email: 'Test User', id: '123' } },
    missingKeys: [],
    threadId: 'test-thread-id'
  }

  beforeEach(() => {
    store = createTestStore()
  })

  it('renders EmptyScreen when there are no messages', () => {
    render(
      <Provider store={store}>
        <Chat {...defaultProps} />
      </Provider>
    )

    expect(screen.getByTestId('mock-empty-screen')).toBeInTheDocument()
  })

  it('renders ChatList when there are messages', () => {
    store = createTestStore({
      chat: {
        messages: [{ id: '1', role: 'user', content: 'Hello' }],
        threadId: '123'
      }
    })

    render(
      <Provider store={store}>
        <Chat {...defaultProps} />
      </Provider>
    )

    expect(screen.getByTestId('mock-chat-list')).toBeInTheDocument()
  })

  it('shows toast error for missing keys', () => {
    render(
      <Provider store={store}>
        <Chat {...defaultProps} missingKeys={['API_KEY']} />
      </Provider>
    )

    expect(require('sonner').toast.error).toHaveBeenCalledWith(
      'Missing API_KEY environment variable!'
    )
  })
})
