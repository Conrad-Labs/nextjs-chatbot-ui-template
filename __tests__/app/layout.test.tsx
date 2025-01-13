import { render, screen } from '@testing-library/react'
import RootLayout from '@/app/layout'

jest.mock('geist/font/sans', () => ({
  GeistSans: { variable: 'mock-sans-variable' }
}))

jest.mock('geist/font/mono', () => ({
  GeistMono: { variable: 'mock-mono-variable' }
}))

jest.mock('@/components/tailwind-indicator', () => ({
  TailwindIndicator: () => <div data-testid="tailwind-indicator" />
}))

jest.mock('@/components/providers', () => ({
  Providers: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="providers">{children}</div>
  )
}))

jest.mock('@/components/header', () => ({
  Header: () => <header data-testid="header">Header Component</header>
}))

jest.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster" />
}))

jest.mock('@/lib/utils', () => ({
  cn: (...args: string[]) => args.join(' ')
}))

jest.mock('@/app/globals.css', () => jest.fn())

describe('RootLayout', () => {
  it('should render the layout with children and all components', () => {
    const consoleErrorMock = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    render(
      <RootLayout>
        <div data-testid="child-content">Child Content</div>
      </RootLayout>
    )

    expect(document.documentElement.lang).toBe('en')
    expect(document.body).toHaveClass(
      'font-sans antialiased mock-sans-variable mock-mono-variable'
    )
    expect(screen.getByTestId('toaster')).toBeInTheDocument()
    expect(screen.getByTestId('providers')).toBeInTheDocument()
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('tailwind-indicator')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toHaveTextContent(
      'Child Content'
    )

    consoleErrorMock.mockRestore()
  })
})
