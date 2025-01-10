import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { PromptForm } from '@/components/prompt-form'
import { getChat, saveChat } from '@/app/actions'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import OpenAI from 'openai'
import { useRouter } from 'next/navigation'

jest.mock('@/app/actions', () => ({
  getChat: jest.fn(() => ({
    id: 'mockChatId',
    messages: [],
    title: 'Mock Chat Title',
    createdAt: new Date(),
    path: '/mock-chat',
    threadId: 'mockThreadId'
  })),
  saveChat: jest.fn()
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))

jest.mock('sonner', () => {
  const toast = jest.fn() as jest.Mock & {
    dismiss: jest.Mock
    success: jest.Mock
    error: jest.Mock
  }

  toast.dismiss = jest.fn()
  toast.success = jest.fn()
  toast.error = jest.fn()

  return { toast }
})

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  )
}))

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>
}))

jest.mock('@/components/ui/icons', () => ({
  IconArrowElbow: () => <span data-testid="icon-arrow-elbow" />,
  IconClose: () => <span data-testid="icon-arrow-close" />
}))

jest.mock('@/components/vector-store-popover', () => ({
  __esModule: true,
  default: ({ refreshFiles }: any) => (
    <div data-testid="vector-store-popover">
      <button onClick={() => refreshFiles()}>Refresh Files</button>
    </div>
  )
}))

jest.mock('@/components/file-upload-popover', () => ({
  __esModule: true,
  default: ({ onFileSelect }: any) => (
    <div data-testid="file-upload-popover">
      <button
        onClick={() =>
          onFileSelect([
            { file: new File(['dummy content'], 'test.txt'), previewUrl: null }
          ])
        }
      >
        Upload
      </button>
    </div>
  )
}))

jest.mock('openai', () => {
  const mockOpenAI = jest.fn(() => ({
    files: {
      create: jest.fn().mockResolvedValue({ id: '123' }),
      retrieve: jest
        .fn()
        .mockResolvedValue({ id: 'file123', filename: 'test.txt' }),
      del: jest.fn()
    },
    beta: {
      vectorStores: {
        files: {
          list: jest.fn().mockResolvedValue({
            data: [
              { id: 'file123', filename: 'test1.txt' },
              { id: 'file456', filename: 'test2.txt' }
            ]
          }),
          create: jest.fn(),
          del: jest.fn()
        }
      },
      threads: {
        create: jest.fn(),
        messages: {
          create: jest.fn()
        },
        runs: {
          stream: jest.fn(() => ({
            [Symbol.asyncIterator]() {
              return {
                next: () => Promise.resolve({ done: true })
              }
            }
          }))
        }
      }
    }
  }))
  return mockOpenAI
})

const mockDispatch = jest.fn()
const mockPush = jest.fn()
jest.mocked(useRouter).mockReturnValue({
  push: mockPush
} as any)
const mockUseSelector = (state: any) => {
  ;(useSelector as unknown as jest.Mock).mockImplementation(selectorFn =>
    selectorFn(state)
  )
}

describe('PromptForm Component', () => {
  const mockSetInput = jest.fn()
  const mockSession = { user: { id: '123', email: 'test.user@gmail.com' } }
  const mockId = 'chat123'
  const mockThreadId = 'thread123'
  let mockOpenAIInstance: any

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch)
    mockUseSelector({
      chat: {
        messages: [],
        threadId: mockThreadId
      }
    })

    mockOpenAIInstance = new OpenAI()
    ;(mockOpenAIInstance.files.create as jest.Mock).mockResolvedValue({
      id: 'file123'
    })
    ;(
      mockOpenAIInstance.beta.vectorStores.files.list as jest.Mock
    ).mockResolvedValue({
      data: [{ id: 'file123' }]
    })
    ;(mockOpenAIInstance.files.retrieve as jest.Mock).mockResolvedValue({
      id: 'file123',
      filename: 'test.txt'
    })
  })

  it('renders the form correctly', async () => {
    await act(async () => {
      render(
        <PromptForm
          input=""
          setInput={mockSetInput}
          session={mockSession}
          id={mockId}
        />
      )
    })

    expect(screen.getByPlaceholderText('Send a message.')).toBeInTheDocument()
    expect(screen.getByTestId('file-upload-popover')).toBeInTheDocument()
    expect(screen.getByTestId('vector-store-popover')).toBeInTheDocument()
  })

  it('handles message submission without files', async () => {
    render(
      <PromptForm
        input="Hello, world!"
        setInput={mockSetInput}
        session={mockSession}
        id={mockId}
      />
    )

    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSetInput).toHaveBeenCalledWith('')
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ message: 'Hello, world!' })
        })
      )
      expect(toast.dismiss).toHaveBeenCalled()
    })
  })

  it('handles file selection and submission', async () => {
    render(
      <PromptForm
        input=""
        setInput={mockSetInput}
        session={mockSession}
        id={mockId}
      />
    )

    const uploadButton = screen.getByText('Upload')
    fireEvent.click(uploadButton)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSetInput).toHaveBeenCalledWith('')
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            files: expect.any(String)
          })
        })
      )
      expect(toast.dismiss).toHaveBeenCalled()
    })
  })

  it('handles refreshFiles from VectorStorePopover', async () => {
    render(
      <PromptForm
        input=""
        setInput={mockSetInput}
        session={mockSession}
        id={mockId}
      />
    )

    const refreshButton = screen.getByText('Refresh Files')
    fireEvent.click(refreshButton)
    await waitFor(() => {
      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  it('disables the submit button under specific conditions', async () => {
    render(
      <PromptForm
        input=""
        setInput={mockSetInput}
        session={mockSession}
        id={mockId}
      />
    )

    const submitButton = screen.getByRole('button', { name: /send message/i })

    expect(submitButton).toBeDisabled()

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Send a message.'), {
        target: { value: 'Hello' }
      })
    })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })

  it('handles file upload errors gracefully', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false
    } as Response)

    render(
      <PromptForm
        input=""
        setInput={mockSetInput}
        session={mockSession}
        id={mockId}
      />
    )

    const uploadButton = screen.getByText('Upload')
    fireEvent.click(uploadButton)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong...',
        expect.objectContaining({
          description: expect.stringMatching(/Unable to save uploaded files/)
        })
      )
    })

    jest.restoreAllMocks()
  })

  it('disables inputs and buttons when assistant is running', async () => {
    render(
      <PromptForm
        input="Hello"
        setInput={mockSetInput}
        session={mockSession}
        id={mockId}
      />
    )

    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(screen.getByPlaceholderText('Send a message.')).toBeDisabled()
  })

  it('removes selected files', async () => {
    render(
      <PromptForm
        input=""
        setInput={mockSetInput}
        session={mockSession}
        id={mockId}
      />
    )

    const uploadButton = screen.getByText('Upload')
    fireEvent.click(uploadButton)

    const removeFileButton = screen.getByRole('button', { name: /remove/i })
    fireEvent.click(removeFileButton)

    await waitFor(() => {
      expect(screen.queryByTestId('file-preview')).not.toBeInTheDocument()
    })
  })
})
