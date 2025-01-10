import { render, screen } from '@testing-library/react'
import { ChatHistory } from '@/components/chat-history'
import resolveAsync from '../utils/resolve-async'

jest.mock('@/components/sidebar-list', () => ({
  SidebarList: ({ userId }: { userId: string }) => (
    <div data-testid="sidebar-list">SidebarList for userId: {userId}</div>
  )
}))

jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...args: string[]) => args.join(' ')),
  buttonVariants: jest.fn(() => 'mock-button-variant')
}))

describe('ChatHistory', () => {
  it('renders the static content', async () => {
    const ChatHistoryResolved = await resolveAsync(ChatHistory, {
      userId: '123'
    })
    render(<ChatHistoryResolved />)

    const header = screen.getByText(/chat history/i)
    expect(header).toBeInTheDocument()

    const newChatLink = screen.getByRole('link', { name: /New Chat/i })
    expect(newChatLink).toBeInTheDocument()
    expect(newChatLink).toHaveAttribute('href', '/')
  })

  it('renders SidebarList with the correct userId', async () => {
    const ChatHistoryResolved = await resolveAsync(ChatHistory, {
      userId: '456'
    })
    render(<ChatHistoryResolved />)

    const sidebarList = await screen.findByTestId('sidebar-list')
    expect(sidebarList).toBeInTheDocument()
    expect(sidebarList).toHaveTextContent('SidebarList for userId: 456')
  })
})
