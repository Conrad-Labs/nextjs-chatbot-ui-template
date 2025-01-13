import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatMessageActions } from '@/components/chat-message-actions'

jest.mock('@/lib/hooks/use-copy-to-clipboard', () => ({
  useCopyToClipboard: jest.fn(() => ({
    isCopied: false,
    copyToClipboard: jest.fn()
  }))
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick
  }: {
    children: React.ReactNode
    onClick: () => void
  }) => (
    <button onClick={onClick} data-testid="copy-button">
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/icons', () => ({
  IconCheck: () => <span data-testid="icon-check">✓</span>,
  IconCopy: () => <span data-testid="icon-copy">📋</span>
}))

const message: any = {
  id: '1',
  role: 'user',
  content: 'Hello, this is a test message!'
}

describe('ChatMessageActions', () => {
  it('renders the component', () => {
    render(<ChatMessageActions message={message} />)
    const copyButton = screen.getByTestId('copy-button')
    expect(copyButton).toBeInTheDocument()
    const copyIcon = screen.getByTestId('icon-copy')
    expect(copyIcon).toBeInTheDocument()
  })

  it('triggers copy action and changes icon', async () => {
    const mockCopyToClipboard = jest.fn()
    const mockUseCopyToClipboard = jest.requireMock(
      '@/lib/hooks/use-copy-to-clipboard'
    )
    mockUseCopyToClipboard.useCopyToClipboard.mockReturnValue({
      isCopied: false,
      copyToClipboard: mockCopyToClipboard
    })

    render(<ChatMessageActions message={message} />)

    const copyButton = screen.getByTestId('copy-button')
    fireEvent.click(copyButton)

    expect(mockCopyToClipboard).toHaveBeenCalledWith(message.content)

    mockUseCopyToClipboard.useCopyToClipboard.mockReturnValue({
      isCopied: true,
      copyToClipboard: mockCopyToClipboard
    })

    render(<ChatMessageActions message={message} />)
    expect(screen.getByTestId('icon-check')).toBeInTheDocument()
  })

  it('does not trigger copy action if already copied', () => {
    const mockCopyToClipboard = jest.fn()
    const mockUseCopyToClipboard = jest.requireMock(
      '@/lib/hooks/use-copy-to-clipboard'
    )

    mockUseCopyToClipboard.useCopyToClipboard.mockReturnValue({
      isCopied: true,
      copyToClipboard: mockCopyToClipboard
    })

    render(<ChatMessageActions message={message} />)

    const copyButton = screen.getByTestId('copy-button')
    fireEvent.click(copyButton)

    expect(mockCopyToClipboard).not.toHaveBeenCalled()
  })

  it('resets icon after timeout', async () => {
    const mockUseCopyToClipboard = jest.requireMock(
      '@/lib/hooks/use-copy-to-clipboard'
    )
    mockUseCopyToClipboard.useCopyToClipboard.mockReturnValue({
      isCopied: true,
      copyToClipboard: jest.fn()
    })

    render(<ChatMessageActions message={message} />)

    expect(screen.getByTestId('icon-check')).toBeInTheDocument()

    await waitFor(() => {
      mockUseCopyToClipboard.useCopyToClipboard.mockReturnValue({
        isCopied: false,
        copyToClipboard: jest.fn()
      })
    })

    render(<ChatMessageActions message={message} />)
    expect(screen.getByTestId('icon-copy')).toBeInTheDocument()
  })
})
