import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import FileUploadPopover from '@/components/file-upload-popover'

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/icons', () => ({
  IconAttachment: () => <span data-testid="icon-attachment">📎</span>,
  IconAddFile: () => <span data-testid="icon-add-file">➕</span>
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover">{children}</div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  )
}))

describe('FileUploadPopover', () => {
  const mockOnFileSelect = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the popover trigger button correctly', () => {
    render(
      <FileUploadPopover onFileSelect={mockOnFileSelect} disabled={false} />
    )
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('icon-attachment')).toBeInTheDocument()
  })

  it('opens the popover content when the trigger button is clicked', () => {
    render(
      <FileUploadPopover onFileSelect={mockOnFileSelect} disabled={false} />
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])

    expect(screen.getByTestId('popover-content')).toBeInTheDocument()
  })

  it('calls handleFileUpload when "Upload from computer" button is clicked', () => {
    render(<FileUploadPopover onFileSelect={jest.fn()} disabled={false} />)
    const fileInput = screen
      .getByRole('button', { name: /Upload from computer/i })
      .parentElement!.querySelector('input') as HTMLInputElement
    const clickSpy = jest.spyOn(fileInput, 'click')
    fireEvent.click(screen.getByText('Upload from computer'))
    expect(clickSpy).toHaveBeenCalled()
  })

  it('calls onFileSelect with correct file data for non-image files', async () => {
    const file = new File(['dummy content'], 'test.pdf', {
      type: 'application/pdf'
    })
    const fileEvent = {
      target: { files: [file] }
    } as unknown as React.ChangeEvent<HTMLInputElement>

    render(
      <FileUploadPopover onFileSelect={mockOnFileSelect} disabled={false} />
    )
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    expect(input).toBeInTheDocument()

    fireEvent.change(input, fileEvent)

    await waitFor(() =>
      expect(mockOnFileSelect).toHaveBeenCalledWith([
        { file, previewUrl: null, fileType: 'application' }
      ])
    )
  })

  it('calls onFileSelect with correct file data for image files', async () => {
    const file = new File(['dummy image content'], 'test.jpg', {
      type: 'image/jpeg'
    })
    const fileEvent = {
      target: { files: [file] }
    } as unknown as React.ChangeEvent<HTMLInputElement>

    const readerMock = {
      readAsDataURL: jest.fn(),
      onloadend: jest.fn(),
      result: 'data:image/jpeg;base64,test'
    }

    jest
      .spyOn(window, 'FileReader')
      .mockImplementation(() => readerMock as unknown as FileReader)

    render(
      <FileUploadPopover onFileSelect={mockOnFileSelect} disabled={false} />
    )

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    expect(input).toBeInTheDocument()

    fireEvent.change(input, fileEvent)
    readerMock.onloadend?.()

    await waitFor(() =>
      expect(mockOnFileSelect).toHaveBeenCalledWith([
        { file, previewUrl: 'data:image/jpeg;base64,test', fileType: 'image' }
      ])
    )
  })

  it('does not open popover content when disabled', async () => {
    render(
      <FileUploadPopover onFileSelect={mockOnFileSelect} disabled={true} />
    )
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveStyle('display: none')
  })
})
