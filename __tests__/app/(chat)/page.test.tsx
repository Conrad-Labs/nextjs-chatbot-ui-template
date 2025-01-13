import { render, screen, waitFor } from '@testing-library/react'
import IndexPage from '@/app/(chat)/page'
import { nanoid } from '@/lib/utils'
import { auth } from '@/auth'
import { getMissingKeys } from '@/app/actions'
import { redirect } from 'next/navigation'
import resolveAsync from '@/__tests__/utils/resolve-async'

jest.mock('@/auth', () => ({
  auth: jest.fn()
}))

jest.mock('@/lib/utils', () => ({
  nanoid: jest.fn()
}))

jest.mock('@/app/actions', () => ({
  getMissingKeys: jest.fn()
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

jest.mock('@/components/chat', () => ({
  Chat: () => <div data-testid="chat-component">Chat Component</div>
}))

describe('IndexPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to login if the session is null', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)
    ;(nanoid as jest.Mock).mockReturnValue('mock-id')
    ;(getMissingKeys as jest.Mock).mockResolvedValue([])

    const ResolvedIndexPage = await resolveAsync(IndexPage, {})
    render(<ResolvedIndexPage />)

    expect(auth).toHaveBeenCalled()
    await waitFor(() => {
      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  it('renders the Chat component with correct props when session exists', async () => {
    const mockSession = { user: { id: 'user-id', email: 'test@example.com' } }
    ;(auth as jest.Mock).mockResolvedValue(mockSession)
    ;(nanoid as jest.Mock).mockReturnValue('mock-id')
    ;(getMissingKeys as jest.Mock).mockResolvedValue(['key1'])

    const ResolvedIndexPage = await resolveAsync(IndexPage, {})
    render(<ResolvedIndexPage />)

    expect(auth).toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.getByTestId('chat-component')).toBeInTheDocument()
    })
  })
})
