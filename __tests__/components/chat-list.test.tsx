import { render, screen } from '@testing-library/react'
import { ChatList } from '@/components/chat-list'
import { ChatMessage, Roles } from '@/lib/redux/slice/chat.slice'
import { Citation } from '@/lib/types'
import { createTestStore } from '../utils/create-test-store'
import { Provider } from 'react-redux'
import { initialMessages as messages } from '../mock-data/initial-messages'

jest.mock('@/components/stocks/message', () => ({
  BotMessage: ({
    content,
    className,
    citations
  }: {
    content: string
    className?: string
    citations?: Citation[]
  }) => <div data-testid="bot-message">{content}</div>,
  UserMessage: ({ content }: { content: ChatMessage }) => (
    <div data-testid="user-message">{content.message}</div>
  )
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <div data-testid="separator" />
}))

jest.mock('@radix-ui/react-icons', () => ({
  ExclamationTriangleIcon: () => <div data-testid="exclamation-icon" />
}))

jest.mock('@/components/ui/icons', () => ({
  IconSpinner: () => <div data-testid="spinner">spinner</div>
}))

describe('ChatList', () => {
  it('renders log in prompt for users that do not have a session established', () => {
    const store = createTestStore()
    render(
      <Provider store={store}>
        <ChatList isShared={false} initialMessages={messages} />
      </Provider>
    )

    const login = screen.getByRole('link', { name: /log in/i })
    expect(login).toBeInTheDocument()
    expect(login).toHaveAttribute('href', '/login')

    const signup = screen.getByRole('link', { name: /sign up/i })
    expect(signup).toBeInTheDocument()
    expect(signup).toHaveAttribute('href', '/signup')

    const text = screen.getByText(/to save and revisit your chat history!/i)
    expect(text).toBeInTheDocument()

    const icon = screen.getByTestId(/exclamation-icon/i)
    expect(icon).toBeInTheDocument()
  })
  it('does not render log-in prompt if isShared is true', () => {
    const store = createTestStore({ chat: { messages: [] } })

    render(
      <Provider store={store}>
        <ChatList initialMessages={messages} isShared={true} />
      </Provider>
    )

    expect(screen.queryByText(/log in/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument()
  })
  it('renders chat messages correctly based on roles', () => {
    const store = createTestStore({ chat: { messages: [] } })

    render(
      <Provider store={store}>
        <ChatList initialMessages={messages} isShared={true} />
      </Provider>
    )

    const botMessages = screen.getAllByTestId('bot-message')
    const userMessages = screen.getAllByTestId('user-message')

    expect(botMessages).toHaveLength(4)
    expect(userMessages).toHaveLength(3)

    expect(botMessages[0]).toHaveTextContent('Hello! How can I help you today?')
    expect(userMessages[0]).toHaveTextContent(
      'I need help understanding how to implement unit tests in React.'
    )
  })
  it('renders a loading spinner for the last user message', () => {
    const store = createTestStore({ chat: { messages: [] } })
    const initialMessages = [
      { id: '1', message: 'Hello, how can I help?', role: Roles.assistant },
      { id: '2', message: 'I need help.', role: Roles.user }
    ]

    render(
      <Provider store={store}>
        <ChatList initialMessages={initialMessages} isShared={true} />
      </Provider>
    )

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })
  it('combines initialMessages with Redux messages correctly', () => {
    const store = createTestStore({
      chat: {
        messages: [
          { id: '3', message: 'Follow-up message', role: Roles.assistant }
        ]
      }
    })
    const initialMessages = [
      { id: '1', message: 'Hello, how can I help?', role: Roles.assistant },
      { id: '2', message: 'I need help.', role: Roles.user }
    ]

    render(
      <Provider store={store}>
        <ChatList initialMessages={initialMessages} isShared={true} />
      </Provider>
    )

    const botMessages = screen.getAllByTestId('bot-message')
    const userMessages = screen.getAllByTestId('user-message')

    expect(botMessages).toHaveLength(2)
    expect(userMessages).toHaveLength(1)
  })
})
