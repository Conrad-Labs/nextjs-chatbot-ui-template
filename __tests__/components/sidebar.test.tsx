import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Sidebar } from '@/components/sidebar'
import { useSidebar } from '@/lib/hooks/use-sidebar'

// Mock the useSidebar hook
jest.mock('@/lib/hooks/use-sidebar', () => ({
  useSidebar: jest.fn()
}))

describe('Sidebar', () => {
  it('should render the Sidebar component with children', () => {
    ;(useSidebar as jest.Mock).mockReturnValue({
      isSidebarOpen: false,
      isLoading: false
    })

    render(
      <Sidebar>
        <div>Test Child Content</div>
      </Sidebar>
    )

    expect(screen.getByText('Test Child Content')).toBeInTheDocument()
  })

  it('should have the correct data-state attribute when sidebar is closed', () => {
    ;(useSidebar as jest.Mock).mockReturnValue({
      isSidebarOpen: false,
      isLoading: false
    })

    const { container } = render(
      <Sidebar>
        <div>Test Child Content</div>
      </Sidebar>
    )

    const sidebar = container.querySelector('div[data-state="closed"]')
    expect(sidebar).toHaveAttribute('data-state', 'closed')
  })

  it('should have the correct data-state attribute when sidebar is open', () => {
    ;(useSidebar as jest.Mock).mockReturnValue({
      isSidebarOpen: true,
      isLoading: false
    })

    const { container } = render(
      <Sidebar>
        <div>Test Child Content</div>
      </Sidebar>
    )
    const sidebar = container.querySelector('div[data-state="open"]')
    expect(sidebar).toHaveAttribute('data-state', 'open')
  })

  it('should have "dark:bg-zinc-950" class and allow custom className', () => {
    ;(useSidebar as jest.Mock).mockReturnValue({
      isSidebarOpen: false,
      isLoading: false
    })

    const customClass = 'custom-sidebar-class'

    const { container } = render(
      <Sidebar className={customClass}>
        <div>Test Child Content</div>
      </Sidebar>
    )

    const sidebar = container.querySelector('div')
    expect(sidebar).toHaveClass('dark:bg-zinc-950')
    expect(sidebar).toHaveClass(customClass)
  })
})
