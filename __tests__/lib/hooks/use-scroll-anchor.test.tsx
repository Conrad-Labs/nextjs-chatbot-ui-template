import { renderHook, act, waitFor } from '@testing-library/react'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'

describe('useScrollAnchor', () => {
  let mockIntersectionObserver: jest.Mock
  let observeMock: jest.Mock
  let disconnectMock: jest.Mock
  let scrollRefMock: HTMLDivElement
  let messagesRefMock: HTMLDivElement

  beforeAll(() => {
    // Mock IntersectionObserver
    observeMock = jest.fn()
    disconnectMock = jest.fn()
    mockIntersectionObserver = jest.fn(() => ({
      observe: observeMock,
      disconnect: disconnectMock
    }))
    global.IntersectionObserver = mockIntersectionObserver
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    scrollRefMock = {
      scrollTop: 0,
      clientHeight: 500,
      scrollHeight: 600,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    } as unknown as HTMLDivElement

    messagesRefMock = {
      scrollIntoView: jest.fn()
    } as unknown as HTMLDivElement
  })

  test('initializes refs and states correctly', () => {
    const { result } = renderHook(() => useScrollAnchor())

    expect(result.current.messagesRef.current).toBeNull()
    expect(result.current.scrollRef.current).toBeNull()
    expect(result.current.visibilityRef.current).toBeNull()
    expect(result.current.isAtBottom).toBe(true)
    expect(result.current.isVisible).toBe(false)
  })

  test('scrolls to the bottom when scrollToBottom is called', () => {
    const { result } = renderHook(() => useScrollAnchor())

    const scrollIntoViewMock = jest.fn()
    ;(result.current.messagesRef as any).current = {
      scrollIntoView: scrollIntoViewMock
    } as unknown as HTMLDivElement

    act(() => {
      result.current.scrollToBottom()
    })

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      block: 'end',
      behavior: 'smooth'
    })
  })

  test('updates isAtBottom state on scroll', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const { scrollRef } = useScrollAnchor()
      ;(scrollRef as any).current = scrollRefMock
      return <>{children}</>
    }

    const { result } = renderHook(() => useScrollAnchor(), { wrapper: Wrapper })
    const scrollEventHandler = (scrollRefMock.addEventListener as jest.Mock)
      .mock.calls[0][1] as EventListener
    expect(result.current.isAtBottom).toBe(true)

    act(() => {
      scrollRefMock.scrollTop = 50
      scrollEventHandler({
        target: scrollRefMock
      } as unknown as Event)
    })
    waitFor(() => expect(result.current.isAtBottom).toBe(false))

    act(() => {
      scrollRefMock.scrollTop = -50
      scrollEventHandler({
        target: scrollRefMock
      } as unknown as Event)
    })

    waitFor(() => expect(result.current.isAtBottom).toBe(true))
  })

  test('scrollToBottom scrolls to the bottom of messagesRef', () => {
    const { result } = renderHook(() => useScrollAnchor())

    act(() => {
      ;(result.current.messagesRef as any).current = messagesRefMock
    })

    act(() => {
      result.current.scrollToBottom()
    })

    expect(messagesRefMock.scrollIntoView).toHaveBeenCalledWith({
      block: 'end',
      behavior: 'smooth'
    })
  })
})
