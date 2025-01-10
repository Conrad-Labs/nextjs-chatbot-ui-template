import { renderHook, act } from '@testing-library/react'
import { useStreamableText } from '@/lib/hooks/use-streamable-text'

describe('useStreamableText', () => {
  test('initializes with string content', () => {
    const content = 'Initial Content'

    const { result } = renderHook(() => useStreamableText(content))

    expect(result.current).toBe('Initial Content')
  })

  test('updates with new string content', () => {
    const { result, rerender } = renderHook(
      ({ content }) => useStreamableText(content),
      {
        initialProps: { content: 'Initial Content' }
      }
    )

    expect(result.current).toBe('Initial Content')

    act(() => {
      rerender({ content: 'Updated Content' })
    })

    expect(result.current).toBe('Updated Content')
  })

  test('ignores non-string content', () => {
    const content = 42 as any

    const { result } = renderHook(() => useStreamableText(content))

    expect(result.current).toBe('')
  })
})
