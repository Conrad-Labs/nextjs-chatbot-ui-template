import { render, screen } from '@testing-library/react'
import { ChatPanel } from '@/components/chat-panel'

jest.mock('@/components/prompt-form', () => ({
  PromptForm: () => <div data-testid="prompt-form">This is the prompt form</div>
}))

jest.mock('@/components/footer', () => ({
  FooterText: () => <div data-testid="footer">Some footer text</div>
}))

describe('ChatPanel', () => {
  const mockSetInput = jest.fn()
  const mockScrollToBottom = jest.fn()

  const defaultProps = {
    id: 'test-id',
    title: 'Test Chat',
    input: 'Hello!',
    setInput: mockSetInput,
    isAtBottom: false,
    scrollToBottom: mockScrollToBottom
  }

  it('renders the component correctly', () => {
    render(<ChatPanel {...defaultProps} />)

    expect(screen.getByTestId('prompt-form')).toBeInTheDocument()
    expect(screen.getByText(/some footer text/i)).toBeInTheDocument()
  })
})
