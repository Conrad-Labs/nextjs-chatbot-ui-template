import { render, screen, fireEvent } from '@testing-library/react'
import FilePreview from '@/components/file-preview'

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid="remove-button" {...props}>
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/icons', () => ({
  IconClose: () => <span data-testid="icon-close">X</span>
}))

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  )
}))

jest.mock('@/components/file-layout', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="file-layout">File Layout</div>)
}))

describe('FilePreview', () => {
  const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
  const mockPreviewUrl = 'https://example.com/preview.pdf'
  const mockOnRemove = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly when a file is provided', () => {
    render(
      <FilePreview
        file={mockFile}
        previewUrl={mockPreviewUrl}
        onRemove={mockOnRemove}
      />
    )

    expect(screen.getByTestId('remove-button')).toBeInTheDocument()
    expect(screen.getByTestId('icon-close')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
      'Remove file'
    )
    expect(screen.getByTestId('file-layout')).toBeInTheDocument()
  })

  it('calls onRemove when the remove button is clicked', () => {
    render(
      <FilePreview
        file={mockFile}
        previewUrl={mockPreviewUrl}
        onRemove={mockOnRemove}
      />
    )

    const removeButton = screen.getByTestId('remove-button')
    fireEvent.click(removeButton)

    expect(mockOnRemove).toHaveBeenCalledTimes(1)
  })

  it('passes the correct props to FileLayout', () => {
    const { default: MockFileLayout } = require('@/components/file-layout')

    render(
      <FilePreview
        file={mockFile}
        previewUrl={mockPreviewUrl}
        onRemove={mockOnRemove}
      />
    )

    expect(MockFileLayout).toHaveBeenCalledWith(
      {
        fileType: mockFile.type,
        name: mockFile.name,
        previewUrl: mockPreviewUrl
      },
      undefined
    )
  })

  it('does not render anything if no file is provided', () => {
    const { container } = render(
      <FilePreview file={null} previewUrl={null} onRemove={mockOnRemove} />
    )
    expect(container.firstChild).toBeNull()
  })
})
