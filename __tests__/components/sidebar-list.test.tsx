import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { SidebarList } from '@/components/sidebar-list'
import { getChats, clearChats } from '@/app/actions'
import { Chat } from '@/lib/types'
import { initialMessages } from '../mock-data/initial-messages'

jest.mock('@/app/actions', () => ({
  getChats: jest.fn(),
  clearChats: jest.fn()
}))

jest.mock('@/components/clear-history', () => ({
  ClearHistory: jest.fn(({ clearChats }) => (
    <button onClick={clearChats}>Clear History Mock</button>
  ))
}))

jest.mock('@/components/sidebar-items', () => ({
  SidebarItems: jest.fn(() => <div>SidebarItems Mock</div>)
}))

jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: jest.fn(() => <div>Theme Toggle Mock</div>)
}))

describe('SidebarList', () => {
  const mockChats: Chat[] = [
    {
      id: '1',
      title: 'Chat 1',
      path: '/chat/1',
      createdAt: new Date(),
      messages: [],
      threadId: '123'
    },
    {
      id: '2',
      title: 'Chat 2',
      path: '/chat/2',
      createdAt: new Date(),
      messages: initialMessages,
      threadId: '456'
    }
  ]

  it('should render the list of chats when chats are available', async () => {
    ;(getChats as jest.Mock).mockResolvedValue(mockChats)

    render(<SidebarList userId="user1" />)
    await waitFor(() => {
      expect(screen.getByText('SidebarItems Mock')).toBeInTheDocument()
    })
    expect(getChats).toHaveBeenCalledWith('user1')
  })

  it('should show a message when there are no chats', async () => {
    ;(getChats as jest.Mock).mockResolvedValue([])

    render(<SidebarList userId="user1" />)

    await waitFor(() => {
      expect(screen.getByText('No chat history')).toBeInTheDocument()
    })
  })

  it('should call fetchChats and load chats', async () => {
    ;(getChats as jest.Mock).mockResolvedValue(mockChats)

    render(<SidebarList userId="user1" />)
    await waitFor(() => {
      expect(screen.getByText('SidebarItems Mock')).toBeInTheDocument()
    })

    expect(getChats).toHaveBeenCalledWith('user1')
  })

  it('should call clearChats when the "Clear History" button is clicked', async () => {
    ;(getChats as jest.Mock).mockResolvedValue(mockChats)

    render(<SidebarList userId="user1" />)
    const clearButton = screen.getByText('Clear History Mock')
    fireEvent.click(clearButton)
    await waitFor(() => {
      expect(clearChats).toHaveBeenCalled()
    })
  })
})
