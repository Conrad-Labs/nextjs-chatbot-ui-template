import { renderHook, fireEvent } from '@testing-library/react'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'

describe('useEnterSubmit', () => {
  it('should initialize formRef as null', () => {
    const { result } = renderHook(() => useEnterSubmit())
    expect(result.current.formRef.current).toBeNull()
  })

  it('should call formRef.requestSubmit when Enter is pressed without Shift', () => {
    const { result } = renderHook(() => useEnterSubmit())

    const mockRequestSubmit = jest.fn()
    ;(result.current.formRef as any).current = {
      requestSubmit: mockRequestSubmit
    } as unknown as HTMLFormElement

    const event = {
      key: 'Enter',
      preventDefault: jest.fn(),
      shiftKey: false,
      nativeEvent: { isComposing: false }
    } as unknown as React.KeyboardEvent<HTMLTextAreaElement>

    result.current.onKeyDown(event)

    expect(mockRequestSubmit).toHaveBeenCalled()
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('should not call formRef.requestSubmit when Shift + Enter is pressed', () => {
    const { result } = renderHook(() => useEnterSubmit())

    const mockRequestSubmit = jest.fn()
    ;(result.current.formRef as any).current = {
      requestSubmit: mockRequestSubmit
    } as unknown as HTMLFormElement

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: true
    }) as unknown as React.KeyboardEvent<HTMLTextAreaElement>

    fireEvent.keyDown(document, event)
    result.current.onKeyDown(event)

    expect(mockRequestSubmit).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBeFalsy()
  })

  it('should not call formRef.requestSubmit if the event is composing', () => {
    const { result } = renderHook(() => useEnterSubmit())

    const mockRequestSubmit = jest.fn()
    ;(result.current.formRef as any).current = {
      requestSubmit: mockRequestSubmit
    } as unknown as HTMLFormElement

    const event = {
      key: 'Enter',
      preventDefault: jest.fn(),
      shiftKey: false,
      nativeEvent: { isComposing: true }
    } as unknown as React.KeyboardEvent<HTMLTextAreaElement>

    result.current.onKeyDown(event)

    expect(mockRequestSubmit).not.toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })
})
