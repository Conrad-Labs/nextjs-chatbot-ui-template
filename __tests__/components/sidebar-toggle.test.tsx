import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarToggle } from '@/components/sidebar-toggle'
import { useSidebar } from '@/lib/hooks/use-sidebar'

jest.mock('@/lib/hooks/use-sidebar', () => ({
  useSidebar: jest.fn()
}))

describe('SidebarToggle', () => {
  it('should render the button with the appropriate icon and screen reader text', () => {
    const mockToggleSidebar = jest.fn()
    ;(useSidebar as jest.Mock).mockReturnValue({
      toggleSidebar: mockToggleSidebar
    })

    render(<SidebarToggle />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()

    expect(screen.getByText('Toggle Sidebar')).toHaveClass('sr-only')
  })

  it('should call toggleSidebar when the button is clicked', () => {
    const mockToggleSidebar = jest.fn()
    ;(useSidebar as jest.Mock).mockReturnValue({
      toggleSidebar: mockToggleSidebar
    })

    render(<SidebarToggle />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockToggleSidebar).toHaveBeenCalledTimes(1)
  })
})
