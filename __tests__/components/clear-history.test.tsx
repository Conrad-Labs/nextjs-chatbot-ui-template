import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { ClearHistory } from '@/components/clear-history'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() }))
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}))

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ open, onOpenChange, children }: any) => (
    <div data-testid="alert-dialog">
      {children}
      <button data-testid="trigger" onClick={() => onOpenChange(true)}>
        Trigger Dialog
      </button>
    </div>
  ),
  AlertDialogTrigger: ({ children }: any) => <>{children}</>,
  AlertDialogContent: ({ children }: any) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogCancel: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  AlertDialogAction: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  )
}))

jest.mock('@/components/ui/icons', () => ({
  IconSpinner: () => <span data-testid="spinner">Spinner</span>
}))

describe('ClearHistory', () => {
  const mockClearChats = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders ClearHistory button correctly', () => {
    render(<ClearHistory isEnabled={true} clearChats={mockClearChats} />)
    expect(screen.getByText('Clear history')).toBeInTheDocument()
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
  })

  it('disables the button when isEnabled is false', () => {
    render(<ClearHistory isEnabled={false} clearChats={mockClearChats} />)
    expect(screen.getByText('Clear history')).toBeDisabled()
  })

  it('opens the dialog on button click', () => {
    render(<ClearHistory isEnabled={true} clearChats={mockClearChats} />)
    fireEvent.click(screen.getByTestId('trigger'))
    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument()
  })

  it('calls clearChats on action click', async () => {
    mockClearChats.mockResolvedValueOnce(undefined)

    const { getByTestId, getByText } = render(
      <ClearHistory isEnabled={true} clearChats={mockClearChats} />
    )
    fireEvent.click(getByTestId('trigger'))
    const deleteButton = getByText('Delete')
    fireEvent.click(deleteButton)
    await waitFor(() => expect(mockClearChats).toHaveBeenCalledTimes(1))
  })

  it('displays error toast on failure', async () => {
    const mockError = { error: 'An error occurred' }
    mockClearChats.mockResolvedValueOnce(mockError)

    const toast = require('sonner').toast

    render(<ClearHistory isEnabled={true} clearChats={mockClearChats} />)
    fireEvent.click(screen.getByTestId('trigger'))

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('An error occurred')
    )
  })
})
