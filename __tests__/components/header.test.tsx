import { render, screen, waitFor } from '@testing-library/react'
import { Header } from '@/components/header'
import { auth } from '@/auth'
import resolveAsync from '../utils/resolve-async'

jest.mock('@/auth', () => ({
  auth: jest.fn(() =>
    Promise.resolve({ user: { id: '123', name: 'John Doe' } })
  )
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  )
}))

jest.mock('@/components/user-menu', () => ({
  UserMenu: ({ user }: { user: any }) => (
    <div data-testid="user-menu">{user.name}</div>
  )
}))

jest.mock('@/components/chat-history', () => ({
  ChatHistory: ({ userId }: { userId: string }) => (
    <div>Chat history for {userId}</div>
  )
}))

jest.mock('@/components/sidebar-mobile', () => ({
  SidebarMobile: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
}))

jest.mock('@/components/sidebar-toggle', () => ({
  SidebarToggle: () => <div>Sidebar Toggle</div>
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <a>{children}</a>
}))

describe('Header', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders user menu and chat history when the user is logged in', async () => {
    const HeaderResolved = await resolveAsync(Header, {})
    render(<HeaderResolved />)

    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('src', './logo.png')
    expect(logo).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Chat history for 123')).toBeInTheDocument()
      expect(screen.getByTestId('user-menu')).toHaveTextContent('John Doe')
    })
  })

  it('renders login button when no user is logged in', async () => {
    ;(auth as any).mockResolvedValueOnce({ user: null })
    const HeaderResolved = await resolveAsync(Header, {})
    render(<HeaderResolved />)

    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('src', './logo.png')
    expect(logo).toBeInTheDocument()

    const loginButton = screen.getByRole('button', { name: /login/i })
    expect(loginButton).toBeInTheDocument()

    expect(screen.queryByTestId('user-menu')).toBeNull()
  })

  it('renders the sidebar and chat history when user is logged in', async () => {
    const HeaderResolved = await resolveAsync(Header, {})
    render(<HeaderResolved />)

    await waitFor(() => {
      expect(screen.getByText('Sidebar Toggle')).toBeInTheDocument()
      expect(screen.getByText('Chat history for 123')).toBeInTheDocument()
    })
  })

  it('renders only the logo when the user is not logged in', async () => {
    ;(auth as any).mockResolvedValueOnce({ user: null })

    const HeaderResolved = await resolveAsync(Header, {})
    render(<HeaderResolved />)

    expect(screen.queryByText('Sidebar Toggle')).toBeNull()
    expect(screen.queryByText('Chat history for')).toBeNull()
  })
})
