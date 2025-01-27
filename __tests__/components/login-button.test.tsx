import { render, screen, fireEvent } from '@testing-library/react'
import { LoginButton } from '@/components/login-button'
import { signIn } from 'next-auth/react'

jest.mock('next-auth/react', () => ({
  signIn: jest.fn()
}))

jest.mock('@/components/ui/icons', () => ({
  IconGitHub: () => <svg data-testid="icon-github" />,
  IconSpinner: () => <svg data-testid="icon-spinner" />
}))

describe('LoginButton', () => {
  it('renders the button with default text and GitHub icon', () => {
    render(<LoginButton />)

    const button = screen.getByRole('button', { name: /login with github/i })
    expect(button).toBeInTheDocument()
    expect(screen.getByTestId('icon-github')).toBeInTheDocument()
  })

  it('renders the button with custom text and without GitHub icon', () => {
    render(<LoginButton text="Sign in" showGithubIcon={false} />)

    const button = screen.getByRole('button', { name: /sign in/i })
    expect(button).toBeInTheDocument()
    expect(screen.queryByTestId('icon-github')).not.toBeInTheDocument()
  })

  it('shows loading spinner and disables the button when clicked', () => {
    render(<LoginButton />)

    const button = screen.getByRole('button', { name: /login with github/i })
    fireEvent.click(button)

    expect(screen.getByTestId('icon-spinner')).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('calls signIn with correct provider and callbackUrl', () => {
    render(<LoginButton />)

    const button = screen.getByRole('button', { name: /login with github/i })
    fireEvent.click(button)

    expect(signIn).toHaveBeenCalledWith('github', { callbackUrl: '/' })
  })

  it('applies custom className and additional props', () => {
    render(<LoginButton className="custom-class" data-testid="custom-button" />)

    const button = screen.getByTestId('custom-button')
    expect(button).toHaveClass('custom-class')
  })
})
