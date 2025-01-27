import { render, screen, waitFor } from '@testing-library/react'
import SignupPage from '@/app/signup/page'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import resolveAsync from '@/__tests__/utils/resolve-async'

jest.mock('@/auth', () => ({
  auth: jest.fn()
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

jest.mock('@/components/signup-form', () => () => (
  <div data-testid="signup-form">SignupForm</div>
))

describe('SignupPage', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to home if the user is authenticated', async () => {
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: '123', email: 'test@example.com' }
    })

    await SignupPage()

    await waitFor(() => {
      expect(auth).toHaveBeenCalledTimes(1)
      expect(redirect).toHaveBeenCalledWith('/')
    })

    expect(screen.queryByTestId('signup-form')).not.toBeInTheDocument()
  })

  it('renders SignupForm if the user is not authenticated', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)
    const ResolvedSignupPage = await resolveAsync(SignupPage, {})
    render(<ResolvedSignupPage />)

    expect(redirect).not.toHaveBeenCalled()
    expect(screen.getByTestId('signup-form')).toBeInTheDocument()
  })
})
