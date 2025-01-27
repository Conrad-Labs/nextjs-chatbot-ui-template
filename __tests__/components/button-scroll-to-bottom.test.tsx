import { render, screen, fireEvent } from '@testing-library/react'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'

jest.mock('@/components/ui/icons', () => ({
  IconArrowDown: () => <span data-testid="icon-arrow-down">✓</span>
}))

describe('ButtonScrollToBottom', () => {
  it('renders the button and its children', () => {
    render(
      <ButtonScrollToBottom
        isAtBottom={false}
        scrollToBottom={() => {}}
        className="custom-class"
      />
    )

    const button = screen.getByRole('button', { name: /scroll to bottom/i })
    const icon = screen.getByTestId('icon-arrow-down')
    const srText = screen.getByText(/scroll to bottom/i)

    expect(button).toBeInTheDocument()
    expect(icon).toBeInTheDocument()
    expect(srText).toBeInTheDocument()
  })

  it('applies the correct opacity class based to isAtBottom', () => {
    const { rerender } = render(
      <ButtonScrollToBottom
        isAtBottom={true}
        scrollToBottom={() => {}}
        className="custom-class"
      />
    )

    const button = screen.getByRole('button', { name: /scroll to bottom/i })
    expect(button).toHaveClass('opacity-0')

    rerender(
      <ButtonScrollToBottom
        isAtBottom={false}
        scrollToBottom={() => {}}
        className="custom-class"
      />
    )

    expect(button).toHaveClass('opacity-100')
  })

  it('calls scrollToBottom when the button is clicked', () => {
    const mockScrollToBottom = jest.fn()

    render(
      <ButtonScrollToBottom
        isAtBottom={false}
        scrollToBottom={mockScrollToBottom}
      />
    )

    const button = screen.getByRole('button', { name: /scroll to bottom/i })
    fireEvent.click(button)

    expect(mockScrollToBottom).toHaveBeenCalledTimes(1)
  })

  it('applies additional class names from the className prop', () => {
    render(
      <ButtonScrollToBottom
        isAtBottom={false}
        scrollToBottom={() => {}}
        className="custom-class"
      />
    )

    const button = screen.getByRole('button', { name: /scroll to bottom/i })
    expect(button).toHaveClass('custom-class')
  })
})
