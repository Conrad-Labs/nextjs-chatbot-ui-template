import { render, screen, fireEvent, within } from '@testing-library/react'
import FileLayout from '@/components/file-layout'

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog">{children}</div>
  ),
  DialogTrigger: ({ children, ...props }: { children: React.ReactNode }) => (
    <button data-testid="dialog-trigger" {...props}>
      {children}
    </button>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-description">{children}</div>
  )
}))

jest.mock('@/components/ui/icons', () => ({
  IconPDF: () => <div data-testid="icon-pdf">PDF Icon</div>
}))

describe('FileLayout Component', () => {
  const mockProps = {
    fileType: 'application/pdf',
    name: 'Sample PDF',
    previewUrl: 'https://example.com/sample.pdf'
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing if fileType is not provided', () => {
    const { container } = render(<FileLayout fileType="" previewUrl="" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the IconPDF and name when fileType is application/pdf', () => {
    render(<FileLayout {...mockProps} />)

    expect(screen.getByTestId('icon-pdf')).toBeInTheDocument()
    const triggerButton = screen.getByTestId('dialog-trigger')
    expect(within(triggerButton).getByText('Sample PDF')).toBeInTheDocument()

    expect(screen.getByText('PDF')).toBeInTheDocument()
  })

  it('renders the dialog content when previewUrl is provided', () => {
    render(<FileLayout {...mockProps} />)
    const dialogTrigger = screen.getByTestId('dialog-trigger')
    fireEvent.click(dialogTrigger)

    expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Sample PDF')
    expect(
      screen.getByTestId('dialog-description').querySelector('iframe')
    ).toHaveAttribute('src', 'https://example.com/sample.pdf')
  })

  it('does not render the dialog content if previewUrl is not provided', () => {
    render(
      <FileLayout
        fileType="application/pdf"
        name="No Preview"
        previewUrl={null}
      />
    )
    expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument()
  })

  it('renders the file type if name is not provided', () => {
    render(
      <FileLayout
        fileType="application/pdf"
        name={undefined}
        previewUrl={null}
      />
    )
    expect(screen.getByText('application/pdf')).toBeInTheDocument()
  })
})
