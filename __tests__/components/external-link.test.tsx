import { render, screen } from '@testing-library/react'
import { ExternalLink } from '@/components/external-link'

describe('ExternalLink', () => {
  const testHref = 'https://example.com'
  const testChildren = 'Visit Example'

  it('renders the link with correct href and target attributes', () => {
    render(<ExternalLink href={testHref}>{testChildren}</ExternalLink>)

    const link = screen.getByRole('link', { name: testChildren })
    expect(link).toHaveAttribute('href', testHref)
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders children inside the link', () => {
    render(<ExternalLink href={testHref}>{testChildren}</ExternalLink>)
    expect(screen.getByText(testChildren)).toBeInTheDocument()
  })

  it('renders the SVG icon', () => {
    const { container } = render(
      <ExternalLink href={testHref}>{testChildren}</ExternalLink>
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('has the correct CSS classes for styling', () => {
    render(<ExternalLink href={testHref}>{testChildren}</ExternalLink>)

    const link = screen.getByRole('link', { name: testChildren })
    expect(link).toHaveClass(
      'inline-flex flex-1 justify-center gap-1 leading-4 hover:underline'
    )
  })
})
