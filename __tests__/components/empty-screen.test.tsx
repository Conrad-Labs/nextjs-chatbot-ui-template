import { render, screen } from '@testing-library/react'
import { EmptyScreen } from '@/components/empty-screen'

describe('EmptyScreen', () => {
  it('renders the component correctly', () => {
    render(<EmptyScreen />)

    expect(
      screen.getByText('Welcome to Uptime Institute AI Chatbot!')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /The Uptime Institute is a globally recognized organization that focuses on improving data center performance/
      )
    ).toBeInTheDocument()
    const container = screen
      .getByText('Welcome to Uptime Institute AI Chatbot!')
      .closest('div')
    expect(container).toHaveClass(
      'flex flex-col gap-2 rounded-lg border bg-background p-8'
    )
  })
})
