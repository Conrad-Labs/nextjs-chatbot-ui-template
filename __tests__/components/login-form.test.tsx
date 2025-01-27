import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from '@/components/login-form'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
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

jest.mock('@/app/login/actions', () => ({
  authenticate: jest.fn()
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
const mockRouter = jest.fn()
const mockGetMessageFromCode = getMessageFromCode as jest.Mock

;(useRouter as unknown as jest.Mock).mockReturnValue({
  push: mockRouter,
  refresh: jest.fn()
})

describe('LoginForm Component', () => {
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
    render(<LoginForm />)

    expect(screen.getByAltText('logo')).toBeInTheDocument()
    expect(screen.getByText('Please log in to continue.')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Enter your email address')
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('dispatches the authenticate action on form submission', async () => {
    render(<LoginForm />)

    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('Enter password'), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled()
    })
  })

  it('shows success toast and navigates on successful login', async () => {
    mockResult.type = 'SUCCESS'
    mockResult.resultCode = 'SUCCESS_CODE'

    render(<LoginForm />)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Mocked message for SUCCESS_CODE'
      )
      expect(mockRouter).toHaveBeenCalledWith('/')
    })
  })

  it('shows error toast on failed login', async () => {
    mockResult.type = ErrorMessage.message
    mockResult.resultCode = 'ERROR_CODE'

    render(<LoginForm />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Mocked message for ERROR_CODE')
    })
  })

  it('disables the login button when form submission is pending', () => {
    mockUseFormStatus.mockReturnValue({ pending: true })

    render(<LoginForm />)

    const loginButton = screen.getByRole('button', { name: 'Icon Spinner' })
    expect(loginButton).toBeInTheDocument()
  })
})
