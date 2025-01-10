import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SidebarActions } from '@/components/sidebar-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { TooltipProvider } from '@radix-ui/react-tooltip'

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

describe('SidebarActions Component', () => {
  const mockRemoveChat = jest.fn()
  const mockRouter = { push: jest.fn(), refresh: jest.fn() }

  beforeEach(() => {
    ;(useRouter as any).mockReturnValue(mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
  const chat = {
    id: '1',
    path: '/chat/1',
    title: 'test 1',
    createdAt: new Date(),
    messages: [],
    threadId: '123'
  }

  it('should render the delete button', () => {
    render(
      <TooltipProvider>
        <SidebarActions chat={chat} removeChat={mockRemoveChat} />
      </TooltipProvider>
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    expect(deleteButton).toBeInTheDocument()
  })

  it('should open the delete dialog when delete button is clicked', () => {
    render(
      <TooltipProvider>
        <SidebarActions chat={chat} removeChat={mockRemoveChat} />
      </TooltipProvider>
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    const dialogTitle = screen.getByText(/are you absolutely sure/i)
    expect(dialogTitle).toBeInTheDocument()
  })

  it('should call removeChat when delete is confirmed', async () => {
    const mockResponse = {}
    mockRemoveChat.mockResolvedValue(mockResponse)

    render(
      <TooltipProvider>
        <SidebarActions chat={chat} removeChat={mockRemoveChat} />
      </TooltipProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    await waitFor(() =>
      expect(mockRemoveChat).toHaveBeenCalledWith({
        id: chat.id,
        path: chat.path
      })
    )
    expect(mockRouter.push).toHaveBeenCalledWith('/')
    expect(mockRouter.refresh).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Chat deleted')
  })

  it('should call toast.error when removeChat returns an error', async () => {
    const mockError = { error: 'Something went wrong' }
    mockRemoveChat.mockResolvedValue(mockError)

    render(
      <TooltipProvider>
        <SidebarActions chat={chat} removeChat={mockRemoveChat} />
      </TooltipProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    await waitFor(() =>
      expect(mockRemoveChat).toHaveBeenCalledWith({
        id: chat.id,
        path: chat.path
      })
    )
    expect(toast.error).toHaveBeenCalledWith(mockError.error)
  })

  it('should close the dialog when cancel is clicked', async () => {
    render(
      <TooltipProvider>
        <SidebarActions chat={chat} removeChat={mockRemoveChat} />
      </TooltipProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    const dialogTitle = screen.queryByText(/are you absolutely sure/i)
    expect(dialogTitle).not.toBeInTheDocument()
  })
})
