import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SidebarMobile } from '@/components/sidebar-mobile'

jest.mock('@/components/sidebar', () => ({
  Sidebar: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ))
}))

describe('SidebarMobile', () => {
  it('should render the mobile sidebar toggle button', () => {
    render(
      <SidebarMobile>
        <div>Test Sidebar Content</div>
      </SidebarMobile>
    )

    const sidebarButton = screen.getByRole('button')
    expect(sidebarButton).toBeInTheDocument()

    const icon = document.querySelector('.size-6')
    expect(icon).toBeInTheDocument()

    const srText = screen.getByText('Toggle Sidebar')
    expect(srText).toBeInTheDocument()
  })

  it('should open the sidebar when the button is clicked', async () => {
    render(
      <SidebarMobile>
        <div>Test Sidebar Content</div>
      </SidebarMobile>
    )

    const sidebarButton = screen.getByRole('button')
    fireEvent.click(sidebarButton)

    await waitFor(() => {
      expect(screen.getByText('Test Sidebar Content')).toBeInTheDocument()
    })
  })
})
