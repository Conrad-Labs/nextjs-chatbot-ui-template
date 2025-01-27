import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CitationsPopover from '@/components/citations-popover'
import { Citation } from '@/lib/types'

jest.mock('@/components/ui/button', () => {
  const React = require('react')
  return {
    Button: React.forwardRef(
      ({ children, ...props }: any, ref: React.Ref<HTMLButtonElement>) => (
        <button data-testid="button" ref={ref} {...props}>
          {children}
        </button>
      )
    )
  }
})

jest.mock('@/components/ui/icons', () => ({
  IconBrackets: () => <span data-testid="icon-brackets">[Icon]</span>
}))

describe('CitationsPopover', () => {
  const mockCitations: Citation[] = [
    {
      index: 1,
      text: '[ Citation 1 ]',
      file_name: 'source1.pdf',
      start_index: 0,
      end_index: 10
    },
    {
      index: 2,
      text: '[ Citation 2 ]',
      file_name: 'source2.pdf',
      start_index: 11,
      end_index: 20
    }
  ]

  it('renders the button with the correct initial state', () => {
    render(<CitationsPopover citations={mockCitations} />)

    const button = screen.getByTestId('button')
    const icon = screen.getByTestId('icon-brackets')

    expect(button).toBeInTheDocument()
    expect(icon).toBeInTheDocument()
    expect(screen.getByText('Show Sources')).toBeInTheDocument()
  })

  it('toggles the popover state and displays citations', async () => {
    render(<CitationsPopover citations={mockCitations} />)

    const button = screen.getByTestId('button')
    expect(screen.queryByText('Citations:')).not.toBeInTheDocument()
    fireEvent.click(button)
    expect(await screen.findByText('Citations:')).toBeInTheDocument()

    const citation1 = await screen.getByText('[1]')
    const citation1Text = await screen.getByText('Citation 1')
    const source1 = screen.getByText('Source: source1.pdf')

    const citation2 = await screen.getByText('[2]')
    const citation2Text = await screen.getByText('Citation 2')
    const source2 = screen.getByText('Source: source2.pdf')

    expect(citation1).toBeInTheDocument()
    expect(citation1Text).toBeInTheDocument()
    expect(source1).toBeInTheDocument()
    expect(citation2).toBeInTheDocument()
    expect(citation2Text).toBeInTheDocument()
    expect(source2).toBeInTheDocument()

    fireEvent.click(button)
    await waitFor(() => {
      expect(screen.queryByText('Citations:')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Show Sources')).toBeInTheDocument()
  })

  it('does not render anything if citations are not provided', () => {
    const { container } = render(<CitationsPopover citations={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
