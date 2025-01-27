import { render, screen } from '@testing-library/react'
import { EmptyScreen } from '@/components/empty-screen'

describe('EmptyScreen', () => {
  it('renders the component correctly', () => {
    render(<EmptyScreen />)

    expect(
      screen.getByText('Welcome to the Conrad Labs AI Chatbot!')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /At Conrad Labs, we specialize in building cutting-edge, user-focused software solutions/
      )
    ).toBeInTheDocument()
    const container = screen
      .getByText('Welcome to the Conrad Labs AI Chatbot!')
      .closest('div')
    expect(container).toHaveClass(
      'flex flex-col gap-2 rounded-lg border bg-background p-8'
    )
  })
})
