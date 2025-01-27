import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SidebarItems } from '@/components/sidebar-items'
import { removeChat } from '@/app/actions'
import { Chat } from '@/lib/types'
import { initialMessages } from '../mock-data/initial-messages'
import { TooltipProvider } from '@/components/ui/tooltip'

jest.mock('@/app/actions', () => ({
  removeChat: jest.fn()
}))

describe('SidebarItems', () => {
  const mockChats: Chat[] = [
    {
      id: '1',
      title: 'Test Chat 1',
      path: '/chat/1',
      sharePath: '/shared/1',
      createdAt: new Date(),
      threadId: '123',
      messages: initialMessages
    },
    {
      id: '2',
      title: 'Test Chat 2',
      path: '/chat/2',
      createdAt: new Date(),
      threadId: '456',
      messages: []
    }
  ]

  it('should render SidebarItem for each chat', () => {
    render(
      <TooltipProvider>
        <SidebarItems chats={mockChats} />
      </TooltipProvider>
    )

    expect(screen.getAllByRole('link')).toHaveLength(mockChats.length)
    expect(screen.getByText('Test Chat 1')).toBeInTheDocument()
    expect(screen.getByText('Test Chat 2')).toBeInTheDocument()
  })

  it('should not render anything if there are no chats', () => {
    render(
      <TooltipProvider>
        <SidebarItems chats={[]} />
      </TooltipProvider>
    )

    expect(screen.queryByRole('link')).toBeNull()
  })

  it('should call removeChat when clicking the remove button', () => {
    render(
      <TooltipProvider>
        <SidebarItems chats={mockChats} />
      </TooltipProvider>
    )
    const removeButtons = screen.getAllByRole('button')
    fireEvent.click(removeButtons[0])

    waitFor(() => {
      expect(removeChat).toHaveBeenCalledWith(mockChats[0])
    })
  })

  it('should render the tooltip for shared chats', () => {
    render(
      <TooltipProvider>
        <SidebarItems chats={mockChats} />
      </TooltipProvider>
    )

    const tooltipTrigger = screen.getByRole('button')
    fireEvent.mouseOver(tooltipTrigger)
    waitFor(() => {
      expect(screen.getByText('This is a shared chat.')).toBeInTheDocument()
    })
  })
})
