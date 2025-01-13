import React from 'react'
import { render, screen } from '@testing-library/react'
import ChatLayout from '@/app/(chat)/layout'
import resolveAsync from '@/__tests__/utils/resolve-async'

jest.mock('@/components/sidebar-desktop', () => ({
  SidebarDesktop: () => <div data-testid="sidebar-desktop">Sidebar</div>
}))

describe('ChatLayout', () => {
  it('renders the SidebarDesktop component', async () => {
    const ResolvedChatLayout: any = await resolveAsync(ChatLayout, {})
    render(<ResolvedChatLayout />)

    expect(screen.getByTestId('sidebar-desktop')).toBeInTheDocument()
    expect(screen.getByText('Sidebar')).toBeInTheDocument()
  })

  it('renders the children passed into the component', async () => {
    const ResolvedChatLayout: any = await resolveAsync(ChatLayout, {
      children: <div data-testid="child-component">Child Component</div>
    })
    render(<ResolvedChatLayout />)

    expect(screen.getByTestId('child-component')).toBeInTheDocument()
    expect(screen.getByText('Child Component')).toBeInTheDocument()
  })
})
