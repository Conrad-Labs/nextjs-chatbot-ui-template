import React from 'react'
import '@testing-library/jest-dom'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within
} from '@testing-library/react'
import VectorStorePopover from '@/components/vector-store-popover'
import { toast } from 'sonner'
import OpenAI from 'openai'

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn()
  }
}))

jest.mock('openai', () =>
  jest.fn(() => ({
    files: {
      create: jest.fn(),
      del: jest.fn()
    },
    beta: {
      vectorStores: {
        files: {
          create: jest.fn(),
          del: jest.fn()
        }
      }
    }
  }))
)

jest.mock('@/components/ui/icons', () => ({
  IconAddFile: () => <span data-testid="icon-add-file" />,
  IconFile: () => <span data-testid="icon-file" />,
  IconFolder: () => <span data-testid="icon-folder" />,
  IconSpinner: () => <span data-testid="icon-spinner" />
}))

describe('VectorStorePopover', () => {
  let mockOpenAI: OpenAI
  let mockRefreshFiles: jest.Mock<any, any, any>
  const mockOpenAIVectorStoreId = 'mock-vector-store-id'

  beforeEach(() => {
    mockOpenAI = new OpenAI()
    mockRefreshFiles = jest.fn()
    jest.clearAllMocks()
  })

  it('renders correctly with no files', async () => {
    render(
      <VectorStorePopover
        files={[]}
        openai={mockOpenAI}
        refreshFiles={mockRefreshFiles}
      />
    )

    const button = await screen.findByRole('button')
    fireEvent.click(button)
    await waitFor(() => {
      expect(screen.getByText('No files uploaded.')).toBeInTheDocument()
      expect(screen.getByTestId('icon-folder')).toBeInTheDocument()
    })
  })

  it('renders a list of files', async () => {
    const files = [
      { id: '1', filename: 'file1.txt', bytes: 1024 },
      { id: '2', filename: 'file2.pdf', bytes: 2048 }
    ]

    render(
      <VectorStorePopover
        files={files}
        openai={mockOpenAI}
        refreshFiles={mockRefreshFiles}
      />
    )

    const button = await screen.findByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('file1.txt')).toBeInTheDocument()
      expect(screen.getByText('file2.pdf')).toBeInTheDocument()
    })
  })

  it('handles file uploads successfully', async () => {
    let files: any[] = []
    const mockFile = new File(['file content'], 'test.txt', {
      type: 'text/plain'
    })

    ;(mockOpenAI.files.create as jest.Mock).mockResolvedValueOnce({ id: '123' })
    ;(
      mockOpenAI.beta.vectorStores.files.create as jest.Mock
    ).mockResolvedValueOnce({})

    const mockRefreshFiles = jest.fn(() => {
      files = [...files, { id: '123', filename: 'test.txt', bytes: 1024 }]
    })

    const { rerender } = render(
      <VectorStorePopover
        files={files}
        openai={mockOpenAI}
        refreshFiles={mockRefreshFiles}
      />
    )

    const viewStoreButton = screen.getByRole('button', {
      name: /view vector store/i
    })
    fireEvent.click(viewStoreButton)

    const inputElement = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    expect(inputElement).toBeInTheDocument()

    Object.defineProperty(inputElement, 'files', {
      value: [mockFile],
      writable: false
    })
    fireEvent.change(inputElement)

    await waitFor(() =>
      expect(mockOpenAI.files.create).toHaveBeenCalledWith({
        file: mockFile,
        purpose: 'assistants'
      })
    )
    expect(mockOpenAI.files.create).toHaveBeenCalledTimes(1)
    expect(mockOpenAI.beta.vectorStores.files.create).toHaveBeenCalledWith(
      'mock-vector-store-id',
      { file_id: '123' }
    )

    expect(toast.success).toHaveBeenCalledWith('Success!', {
      description: 'The file test.txt has been uploaded to the vector store.'
    })

    rerender(
      <VectorStorePopover
        files={files}
        openai={mockOpenAI}
        refreshFiles={mockRefreshFiles}
      />
    )
    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument()
    })
  })

  it('handles file upload errors', async () => {
    const files: any[] = []
    const mockFile = new File(['test content'], 'test.txt', {
      type: 'text/plain'
    })

    ;(mockOpenAI.files.create as jest.Mock).mockRejectedValueOnce(
      new Error('Upload failed')
    )

    render(
      <VectorStorePopover
        files={files}
        openai={mockOpenAI}
        refreshFiles={mockRefreshFiles}
      />
    )

    const viewStoreButton = screen.getByRole('button', {
      name: /view vector store/i
    })
    fireEvent.click(viewStoreButton)

    const uploadButton = screen.getByRole('button', {
      name: /upload new file/i
    })
    fireEvent.click(uploadButton)

    const inputElement = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    expect(inputElement).toBeInTheDocument()

    Object.defineProperty(inputElement, 'files', {
      value: [mockFile],
      writable: false
    })
    fireEvent.change(inputElement)

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Something went wrong...', {
        description: 'Error uploading file: Error: Upload failed'
      })
    )

    expect(mockRefreshFiles).not.toHaveBeenCalled()
  })

  it('handles file deletions successfully', async () => {
    let files = [{ id: '1', filename: 'file1.txt', bytes: 1024 }]

    ;(
      mockOpenAI.beta.vectorStores.files.del as jest.Mock
    ).mockResolvedValueOnce({})
    ;(mockOpenAI.files.del as jest.Mock).mockResolvedValueOnce({})

    const mockRefreshFiles = jest.fn(() => {
      files = files.filter(file => file.id !== '1')
    })

    const { rerender } = render(
      <VectorStorePopover
        files={files}
        openai={mockOpenAI}
        refreshFiles={mockRefreshFiles}
      />
    )

    const viewStoreButton = screen.getByRole('button', {
      name: /view vector store/i
    })
    fireEvent.click(viewStoreButton)

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    const confirmButton = screen.getByText('Confirm Delete', {
      selector: 'h2:not(.sr-only)'
    })
    fireEvent.click(confirmButton)

    const confirmationDialog = screen.getByRole('dialog')
    const confirmDeleteButton = within(confirmationDialog).getByRole('button', {
      name: 'Delete'
    })
    fireEvent.click(confirmDeleteButton)

    // @jest-ignore
    await waitFor(() =>
      expect(mockOpenAI.beta.vectorStores.files.del).toHaveBeenCalledWith(
        mockOpenAIVectorStoreId,
        '1'
      )
    )
    await waitFor(() => expect(mockOpenAI.files.del).toHaveBeenCalledWith('1'))

    expect(toast.success).toHaveBeenCalledWith('Success!', {
      description:
        'The file has been successfully deleted from the vector store.'
    })

    rerender(
      <VectorStorePopover
        files={files}
        openai={mockOpenAI}
        refreshFiles={mockRefreshFiles}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument()
    })
  })

  it('handles file deletion errors', async () => {
    const files = [{ id: '1', filename: 'file1.txt', bytes: 1024 }]

    ;(
      mockOpenAI.beta.vectorStores.files.del as jest.Mock
    ).mockRejectedValueOnce(new Error('Delete failed'))

    render(
      <VectorStorePopover
        files={files}
        openai={mockOpenAI}
        refreshFiles={mockRefreshFiles}
      />
    )

    const viewStoreButton = screen.getByRole('button', {
      name: /view vector store/i
    })
    fireEvent.click(viewStoreButton)

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    const confirmButton = screen.getByText('Confirm Delete', {
      selector: 'h2:not(.sr-only)'
    })
    fireEvent.click(confirmButton)

    const confirmationDialog = screen.getByRole('dialog')
    const confirmDeleteButton = within(confirmationDialog).getByRole('button', {
      name: 'Delete'
    })
    fireEvent.click(confirmDeleteButton)

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Something went wrong...', {
        description: 'Error deleting file: Error: Delete failed'
      })
    )
    expect(mockRefreshFiles).not.toHaveBeenCalled()
  })
})
