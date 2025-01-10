import { render, screen } from '@testing-library/react'
import { SidebarFooter } from '@/components/sidebar-footer'

describe('SidebarFooter', () => {
  it('should render without errors', () => {
    render(<SidebarFooter>Test</SidebarFooter>)

    const sidebarFooter = screen.getByText('Test')
    expect(sidebarFooter).toBeInTheDocument()
  })

  it('should render the children correctly', () => {
    render(<SidebarFooter>Test Content</SidebarFooter>)

    const children = screen.getByText('Test Content')
    expect(children).toBeInTheDocument()
  })

  it('should apply the provided className', () => {
    render(<SidebarFooter className="custom-class">Test Content</SidebarFooter>)

    const sidebarFooter = screen.getByText('Test Content')
    expect(sidebarFooter).toHaveClass('custom-class')
  })

  it('should forward other props to the div element', () => {
    render(
      <SidebarFooter data-testid="sidebar-footer" className="custom-class">
        Test Content
      </SidebarFooter>
    )

    const sidebarFooter = screen.getByTestId('sidebar-footer')
    expect(sidebarFooter).toBeInTheDocument()
    expect(sidebarFooter).toHaveClass('custom-class')
  })
})
