import { render, screen } from '@testing-library/react'
import { FooterText } from '@/components/footer'

jest.mock('@/components/external-link', () => ({
  ExternalLink: ({
    href,
    children
  }: {
    href: string
    children: React.ReactNode
  }) => (
    <a href={href} data-testid="external-link">
      {children}
    </a>
  )
}))

describe('FooterText', () => {
  it('renders the footer text with the correct class', () => {
    render(<FooterText />)
    const footerText = screen.getByText(/open source AI chatbot built by/i)
    expect(footerText).toBeInTheDocument()
    expect(footerText).toHaveClass(
      'px-2 text-center text-xs leading-normal text-muted-foreground'
    )
  })

  it('renders the external link with the correct href and text', () => {
    render(<FooterText />)
    const externalLink = screen.getByTestId('external-link')
    expect(externalLink).toBeInTheDocument()
    expect(externalLink).toHaveAttribute('href', 'https://conradlabs.com')
    expect(externalLink).toHaveTextContent('Conrad Labs')
  })

  it('applies additional class names passed through props', () => {
    const customClass = 'custom-class'
    render(<FooterText className={customClass} />)
    const footerText = screen.getByText(/open source AI chatbot built by/i)
    expect(footerText).toHaveClass(customClass)
  })
})
