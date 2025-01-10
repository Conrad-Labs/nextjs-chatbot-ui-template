import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    const localStorageMock = (() => {
      let store: Record<string, string> = {}

      return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value
        }),
        clear: jest.fn(() => {
          store = {}
        }),
        removeItem: jest.fn((key: string) => {
          delete store[key]
        })
      }
    })()

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with the value from localStorage if it exists', () => {
    window.localStorage.setItem('testKey', JSON.stringify('storedValue'))
    const { result } = renderHook(() =>
      useLocalStorage<string>('testKey', 'initialValue')
    )
    expect(result.current[0]).toBe('storedValue')
  })

  it('should initialize with the initialValue if no localStorage value exists', () => {
    const { result } = renderHook(() =>
      useLocalStorage<string>('testKey', 'initialValue')
    )
    expect(result.current[0]).toBe('initialValue')
  })

  it('should update the state and localStorage when setValue is called', () => {
    const { result } = renderHook(() =>
      useLocalStorage<string>('testKey', 'initialValue')
    )
    act(() => {
      result.current[1]('newValue')
    })
    expect(result.current[0]).toBe('newValue')
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'testKey',
      JSON.stringify('newValue')
    )
  })

  it('should persist complex objects to localStorage', () => {
    const initialObject = { key: 'value' }
    const { result } = renderHook(() =>
      useLocalStorage<{ key: string }>('testKey', initialObject)
    )
    act(() => {
      result.current[1]({ key: 'newValue' })
    })
    expect(result.current[0]).toEqual({ key: 'newValue' })
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'testKey',
      JSON.stringify({ key: 'newValue' })
    )
  })
})
