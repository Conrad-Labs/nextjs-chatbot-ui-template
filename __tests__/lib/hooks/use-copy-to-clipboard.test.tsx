import { renderHook, act } from '@testing-library/react'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'

const mockWriteText = jest.fn(() => Promise.resolve())

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText
  }
})

describe('useCopyToClipboard', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('should initialize with `isCopied` as false', () => {
    const { result } = renderHook(() => useCopyToClipboard({}))
    expect(result.current.isCopied).toBe(false)
  })

  it('should copy text to clipboard and set `isCopied` to true', async () => {
    jest.useFakeTimers()

    const { result } = renderHook(() => useCopyToClipboard({ timeout: 1000 }))
    const { copyToClipboard } = result.current
    await act(async () => {
      copyToClipboard('Test text')
    })

    expect(mockWriteText).toHaveBeenCalledWith('Test text')
    expect(result.current.isCopied).toBe(true)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current.isCopied).toBe(false)
  })

  it('should not copy text if `value` is empty', () => {
    const { result } = renderHook(() => useCopyToClipboard({}))
    const { copyToClipboard } = result.current

    act(() => {
      copyToClipboard('')
    })

    expect(mockWriteText).not.toHaveBeenCalled()
    expect(result.current.isCopied).toBe(false)
  })

  it('should not copy text if `navigator.clipboard.writeText` is not available', () => {
    const originalWriteText = navigator.clipboard?.writeText

    if (navigator.clipboard) {
      ;(navigator.clipboard.writeText as any) = undefined
    }

    const { result } = renderHook(() => useCopyToClipboard({}))
    const { copyToClipboard } = result.current

    act(() => {
      copyToClipboard('Test text')
    })

    expect(mockWriteText).not.toHaveBeenCalled()
    expect(result.current.isCopied).toBe(false)

    if (navigator.clipboard) {
      navigator.clipboard.writeText = originalWriteText
    }
  })
})
