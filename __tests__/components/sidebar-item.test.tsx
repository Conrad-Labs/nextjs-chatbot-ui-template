import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { SidebarItem } from '@/components/sidebar-item'
import { usePathname } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { Chat } from '@/lib/types'
import { TooltipProvider } from '@radix-ui/react-tooltip'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

jest.mock('@/lib/hooks/use-local-storage', () => ({
  useLocalStorage: jest.fn()
}))

describe('SidebarItem', () => {
  const mockChat: Chat = {
    id: '1',
    path: '/chat/1',
    title: 'Test Chat',
    createdAt: new Date(),
    messages: [],
    threadId: '123'
  }
  beforeAll(() => {
    global.scrollTo = jest.fn()
  })

  beforeEach(() => {
    ;(usePathname as jest.Mock).mockReturnValue('/chat/1')
    ;(useLocalStorage as jest.Mock).mockReturnValue([null, jest.fn()])
  })

  it('should render SidebarItem with valid props', () => {
    render(
      <SidebarItem index={0} chat={mockChat}>
        Some content
      </SidebarItem>
    )

    const chatTitle = screen.getByText('Test Chat')
    expect(chatTitle).toBeInTheDocument()

    const content = screen.getByText('Some content')
    expect(content).toBeInTheDocument()
  })

  it('should apply active styles when the path matches the current URL', () => {
    render(
      <SidebarItem index={0} chat={mockChat}>
        Some content
      </SidebarItem>
    )

    const link = screen.getByRole('link', { name: /Test Chat/i })
    expect(link).toHaveClass('bg-zinc-200')
    expect(link).toHaveClass('font-semibold')
  })

  it('should trigger animation when the chat is new', async () => {
    ;(useLocalStorage as jest.Mock).mockReturnValue([123, jest.fn()])

    render(
      <SidebarItem index={0} chat={mockChat}>
        Some content
      </SidebarItem>
    )

    await waitFor(() => {
      const chatTitle = screen.getByTitle(mockChat.title)
      expect(chatTitle).toBeInTheDocument()

      const motionSpans = Array.from(chatTitle.querySelectorAll('span')).filter(
        span => !span.classList.contains('whitespace-nowrap')
      )
      expect(motionSpans.length).toBe(mockChat.title.length)
      motionSpans.forEach(span => {
        expect(span.style.opacity).toBe('1')
      })
    })
  })

  it('should show tooltip when the chat is shared', () => {
    const sharedChat = { ...mockChat, sharePath: '/shared/1' }

    render(
      <TooltipProvider>
        <SidebarItem index={0} chat={sharedChat}>
          Some content
        </SidebarItem>
      </TooltipProvider>
    )

    const tooltipTrigger = screen.getByRole('button')
    fireEvent.mouseOver(tooltipTrigger)
    waitFor(() => {
      const tooltipContent = screen.getByText('This is a shared chat.')
      expect(tooltipContent).toBeInTheDocument()
    })
  })

  it('should forward the children and handle link correctly', () => {
    render(
      <SidebarItem index={0} chat={mockChat}>
        Some content
      </SidebarItem>
    )
    const link = screen.getByRole('link', { name: /Test Chat/i })
    expect(link).toHaveAttribute('href', '/chat/1')

    const content = screen.getByText('Some content')
    expect(content).toBeInTheDocument()
  })
})
