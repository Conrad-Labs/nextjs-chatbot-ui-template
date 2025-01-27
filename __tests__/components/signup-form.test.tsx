import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignupForm from '@/components/signup-form'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import { signup } from '@/app/signup/actions'
import { getMessageFromCode } from '@/lib/utils'
import { ErrorMessage } from '@/app/constants'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormState: jest.fn(),
  useFormStatus: jest.fn()
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/app/signup/actions', () => ({
  signup: jest.fn()
}))

jest.mock('@/lib/utils', () => ({
  getMessageFromCode: jest.fn()
}))

jest.mock('@/app/constants', () => ({
  ErrorMessage: { message: 'ERROR_MESSAGE' }
}))

jest.mock('@/components/ui/icons', () => ({
  IconSpinner: () => <div data-testid="icon-spinner">Icon Spinner</div>
}))

const mockUseFormState = useFormState as jest.Mock
const mockUseFormStatus = useFormStatus as jest.Mock
const mockRouter = useRouter as jest.Mock
const mockGetMessageFromCode = getMessageFromCode as jest.Mock

;(mockRouter as unknown as jest.Mock).mockReturnValue({
  push: mockRouter,
  refresh: jest.fn()
})

describe('SignupForm Component', () => {
  const mockResult = { type: '', resultCode: '' }
  const mockDispatch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseFormState.mockReturnValue([mockResult, mockDispatch])
    mockUseFormStatus.mockReturnValue({ pending: false })
    mockGetMessageFromCode.mockImplementation(
      code => `Mocked message for ${code}`
    )
  })

  it('renders the form correctly', () => {
    render(<SignupForm />)

    expect(screen.getByAltText('logo')).toBeInTheDocument()
    expect(screen.getByText('Sign up for an account!')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Enter your email address')
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create account' })
    ).toBeInTheDocument()
    expect(screen.getByText('Log in')).toBeInTheDocument()
  })

  it('dispatches the signup action on form submission', async () => {
    render(<SignupForm />)

    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('Enter password'), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled()
    })
  })

  it('shows success toast and refreshes router on successful signup', async () => {
    mockResult.type = 'SUCCESS'
    mockResult.resultCode = 'SUCCESS_CODE'

    render(<SignupForm />)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Mocked message for SUCCESS_CODE'
      )
      expect(mockRouter).toHaveBeenCalled()
    })
  })

  it('shows error toast on failed signup', async () => {
    mockResult.type = ErrorMessage.message
    mockResult.resultCode = 'ERROR_CODE'

    render(<SignupForm />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Mocked message for ERROR_CODE')
    })
  })

  it('disables the signup button when form submission is pending', () => {
    mockUseFormStatus.mockReturnValue({ pending: true })

    render(<SignupForm />)

    const signupButton = screen.getByRole('button', { name: 'Icon Spinner' })
    expect(signupButton).toBeInTheDocument()
    expect(signupButton).toHaveAttribute('aria-disabled', 'true')
  })
})
