import { render, screen, waitFor } from '@testing-library/react'
import { SidebarDesktop } from '@/components/sidebar-desktop'
import { auth } from '@/auth'
import resolveAsync from '../utils/resolve-async'
import { SidebarProvider } from '@/lib/hooks/use-sidebar'

jest.mock('@/auth', () => ({
  auth: jest.fn()
}))

jest.mock('@/components/chat-history', () => ({
  ChatHistory: ({ userId }: { userId: string }) => (
    <div data-testid="chat-history">{`Chat history for user ${userId}`}</div>
  )
}))

describe('SidebarDesktop', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render Sidebar and ChatHistory when user is authenticated', async () => {
    const mockUser = { user: { id: '123', name: 'John Doe' } }
    ;(auth as jest.Mock).mockResolvedValue(mockUser)
    const SidebarDesktopResolved = await resolveAsync(SidebarDesktop, {})
    render(
      <SidebarProvider>
        <SidebarDesktopResolved />
      </SidebarProvider>
    )

    await waitFor(() => screen.getByTestId('chat-history'))
    const chatHistory = screen.getByTestId('chat-history')
    expect(chatHistory).toHaveTextContent('Chat history for user 123')
  })

  it('should not render Sidebar when user is not authenticated', async () => {
    const mockUser = { user: null }
    ;(auth as jest.Mock).mockResolvedValue(mockUser)

    const SidebarDesktopResolved = await resolveAsync(SidebarDesktop, {})
    render(
      <SidebarProvider>
        <SidebarDesktopResolved />
      </SidebarProvider>
    )

    const sidebar = screen.queryByTestId('sidebar')
    expect(sidebar).toBeNull()
  })
})
