import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  UserMessage,
  BotMessage,
  BotCard,
  SystemMessage,
  SpinnerMessage
} from '@/components/stocks/message'
import { useStreamableText } from '@/lib/hooks/use-streamable-text'
import { Citation } from '@/lib/types'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { CodeBlock } from '@/components/ui/codeblock'

jest.mock('@/components/ui/codeblock', () => ({
  CodeBlock: ({ language, value }: any) => (
    <div data-testid="code-block">
      Language: {language}, Value: {value}
    </div>
  )
}))

jest.mock('@/components/ui/icons', () => ({
  IconOpenAI: () => <div data-testid="icon-openai">IconOpenAI</div>,
  IconUser: () => <div data-testid="icon-user">IconUser</div>
}))

jest.mock('@/components/file-layout', () => ({
  __esModule: true,
  default: jest.fn(({ fileType, name, previewUrl }) => (
    <div data-testid="file-layout">
      {fileType} {name} {previewUrl}
    </div>
  ))
}))

jest.mock('@/components/ui/codeblock', () => ({
  CodeBlock: ({ language, value }: any) => (
    <div data-testid="code-block">
      {language} {value}
    </div>
  )
}))

jest.mock('@/components/stocks/spinner', () => ({
  spinner: <div data-testid="mocked-spinner">Mocked Spinner</div>
}))

jest.mock('@/components/citations-popover', () => ({
  __esModule: true,
  default: jest.fn(({ citations }) => (
    <div data-testid="citations-popover">Citations: {citations.length}</div>
  ))
}))

jest.mock('@/lib/hooks/use-streamable-text', () => ({
  useStreamableText: jest.fn()
}))

jest.mock('@/components/markdown', () => ({
  MemoizedReactMarkdown: ({ children }: any) => (
    <div data-testid="markdown">{children}</div>
  )
}))

jest.mock('remark-gfm', () => jest.fn())
jest.mock('remark-math', () => jest.fn())

describe('Message Components', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders UserMessage with content and files', () => {
    const content = {
      message: 'Hello User',
      id: '123',
      files: JSON.stringify([
        { type: 'pdf', filename: 'file1.pdf', previewUrl: 'url1' }
      ])
    }

    render(<UserMessage content={content} />)

    expect(screen.getByTestId('icon-user')).toBeInTheDocument()
    expect(screen.getByText('Hello User')).toBeInTheDocument()
    expect(screen.getByTestId('file-layout')).toBeInTheDocument()
  })

  test('renders BotMessage with content and citations', () => {
    ;(useStreamableText as jest.Mock).mockReturnValue('Streamed Content')

    const content = 'Hello Bot'
    const citations: Citation[] = [
      {
        index: 1,
        text: 'Citation 1',
        start_index: 0,
        end_index: 3,
        file_name: 'test_file.txt'
      }
    ]

    render(<BotMessage content={content} citations={citations} />)

    expect(screen.getByTestId('icon-openai')).toBeInTheDocument()
    expect(screen.getByTestId('markdown')).toHaveTextContent('Streamed Content')
    expect(screen.getByTestId('citations-popover')).toHaveTextContent('1')
  })

  test('renders BotCard with children and optional avatar', () => {
    const children = <div data-testid="child-content">Child Content</div>

    render(<BotCard showAvatar>{children}</BotCard>)
    const avatarIcon = screen.getByTestId('icon-openai')
    expect(avatarIcon).toBeInTheDocument()
    expect(avatarIcon.parentElement).not.toHaveClass('invisible')
    expect(screen.getByTestId('child-content')).toBeInTheDocument()

    render(<BotCard showAvatar={false}>{children}</BotCard>)
    const invisibleAvatarIcon = screen.getAllByTestId('icon-openai')[1]
    expect(invisibleAvatarIcon).toBeInTheDocument()
    expect(invisibleAvatarIcon.parentElement).toHaveClass('invisible')
  })

  test('renders SystemMessage with children', () => {
    const children = 'System Message Content'

    render(<SystemMessage>{children}</SystemMessage>)

    expect(screen.getByText('System Message Content')).toBeInTheDocument()
  })

  test('renders SpinnerMessage', () => {
    render(<SpinnerMessage />)

    expect(screen.getByTestId('icon-openai')).toBeInTheDocument()
    expect(screen.getByText(/spinner/i)).toBeInTheDocument()
  })

  test('renders UserMessage with malformed files JSON', () => {
    const content = {
      message: 'Hello User',
      id: '123',
      files: '{invalid: data'
    }

    render(<UserMessage content={content} />)

    expect(screen.getByTestId('icon-user')).toBeInTheDocument()
    expect(screen.getByText('Hello User')).toBeInTheDocument()

    expect(screen.queryByTestId('file-layout')).not.toBeInTheDocument()
  })

  test('renders BotMessage with custom markdown code block', () => {
    ;(useStreamableText as jest.Mock).mockReturnValue('Streamed Content')

    render(
      <MemoizedReactMarkdown
        components={{
          code: ({ children }: any) => (
            <code data-testid="custom-code">{children}</code>
          )
        }}
      >
        {'▍'}
      </MemoizedReactMarkdown>
    )

    const codeBlock = screen.getByTestId('markdown')
    expect(codeBlock).toBeInTheDocument()
    expect(codeBlock).toHaveTextContent('▍')
  })

  test('renders BotMessage with a CodeBlock component', () => {
    ;(useStreamableText as jest.Mock).mockReturnValue('Streamed Content')

    render(
      <MemoizedReactMarkdown
        components={{
          code: ({ className, children }: any) => (
            <CodeBlock
              language={'javascript'}
              value={'console.log("Hello World");'}
            />
          )
        }}
      >
        {'console.log("Hello World");'}
      </MemoizedReactMarkdown>
    )

    const codeBlock = screen.getByTestId('markdown')
    expect(codeBlock).toBeInTheDocument()
    expect(codeBlock).toHaveTextContent('console.log("Hello World");')
  })
})
