import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserMenu, type UserMenuProps } from '@/components/user-menu'
import { signOut } from '@/auth'

jest.mock('@/auth', () => ({
  signOut: jest.fn()
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  )
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  DropdownMenuSeparator: () => <div role="separator" />
}))

describe('UserMenu Component', () => {
  const mockUser: UserMenuProps['user'] = {
    id: 'user123',
    email: 'test.user@example.com'
  }

  it('renders user initials and email', async () => {
    render(<UserMenu user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('te')).toBeInTheDocument()
      expect(
        screen
          .getAllByText(mockUser.email)
          .filter(el => !el.className.includes('hidden'))[0]
      ).toBeInTheDocument()
    })
  })

  it('opens dropdown menu on trigger click', () => {
    render(<UserMenu user={mockUser} />)

    const trigger = screen.getByRole('button', { name: `te ${mockUser.email}` })
    fireEvent.click(trigger)

    expect(
      screen
        .getAllByText(mockUser.email)
        .filter(el => !el.className.includes('hidden'))[0]
    ).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('calls signOut on clicking "Sign Out"', async () => {
    render(<UserMenu user={mockUser} />)

    const trigger = screen.getByRole('button', { name: `te ${mockUser.email}` })
    fireEvent.click(trigger)

    const signOutButton = screen.getByText('Sign Out')
    fireEvent.click(signOutButton)

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1)
    })
  })

  it('shows initials correctly for single-word names', () => {
    const singleNameUser = { ...mockUser, email: 'single@example.com' }

    render(<UserMenu user={singleNameUser} />)

    expect(screen.getByText('si')).toBeInTheDocument()
  })
})
