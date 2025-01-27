import { render, screen, waitFor } from '@testing-library/react'
import LoginPage from '@/app/login/page'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import resolveAsync from '@/__tests__/utils/resolve-async'

jest.mock('@/auth', () => ({
  auth: jest.fn()
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

jest.mock('@/components/login-form', () => ({
  __esModule: true,
  default: () => <div data-testid="login-form">Login Form</div>
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to the home page if the user is authenticated', async () => {
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: '123', email: 'test@example.com' }
    })

    await LoginPage()

    expect(auth).toHaveBeenCalledTimes(1)
    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('renders the login form if the user is not authenticated', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)

    const ResolvedLoginPage = await resolveAsync(LoginPage, {})
    render(<ResolvedLoginPage />)

    await waitFor(() => {
      expect(auth).toHaveBeenCalledTimes(1)
      expect(redirect).not.toHaveBeenCalled()
    })
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })
})
