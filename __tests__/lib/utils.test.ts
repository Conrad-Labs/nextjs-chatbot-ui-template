import {
  nanoid,
  fetcher,
  formatDate,
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  getStringFromBuffer,
  ResultCode,
  getMessageFromCode,
  format,
  parseISO,
  subMonths
} from '@/lib/utils'

describe('Utility Functions', () => {
  describe('nanoid', () => {
    it('generates a 7-character random string', () => {
      const id = nanoid()
      expect(id).toHaveLength(7)
      expect(/^[A-Za-z0-9]{7}$/.test(id)).toBe(true)
    })
  })

  describe('fetcher', () => {
    beforeEach(() => {
      global.fetch = jest.fn()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('fetches JSON successfully', async () => {
      const mockResponse = { data: 'test' }
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await fetcher('https://api.example.com/data')
      expect(result).toEqual(mockResponse)
    })

    it('throws an error if the response is not OK', async () => {
      const mockResponse = { error: 'Invalid request' }
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      await expect(fetcher('https://api.example.com/data')).rejects.toThrow(
        'Invalid request'
      )
    })

    it('throws a generic error if no error message is provided', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({})
      })

      await expect(fetcher('https://api.example.com/data')).rejects.toThrow(
        'An unexpected error occurred'
      )
    })
  })

  describe('formatDate', () => {
    it('formats a date correctly', () => {
      const date = new Date('2023-01-01')
      expect(formatDate(date)).toBe('January 1, 2023')
    })
  })

  describe('formatNumber', () => {
    it('formats a number as currency', () => {
      expect(formatNumber(1234.56)).toBe('$1,234.56')
    })
  })

  describe('runAsyncFnWithoutBlocking', () => {
    it('executes an async function without blocking', () => {
      const mockFn = jest.fn(async () => 'done')
      runAsyncFnWithoutBlocking(mockFn)
      expect(mockFn).toHaveBeenCalled()
    })
  })

  describe('sleep', () => {
    jest.useFakeTimers()

    it('delays execution by the specified duration', async () => {
      const callback = jest.fn()
      sleep(1000).then(callback)

      jest.advanceTimersByTime(1000)
      await Promise.resolve() // Wait for promises to resolve
      expect(callback).toHaveBeenCalled()
    })
  })

  describe('getStringFromBuffer', () => {
    it('converts a buffer to a hexadecimal string', () => {
      const buffer = new Uint8Array([255, 0, 127]).buffer
      expect(getStringFromBuffer(buffer)).toBe('ff007f')
    })
  })

  describe('getMessageFromCode', () => {
    it('returns the correct message for each result code', () => {
      expect(getMessageFromCode(ResultCode.InvalidCredentials)).toBe(
        'Invalid credentials!'
      )
      expect(getMessageFromCode(ResultCode.UserCreated)).toBe(
        'User created, welcome!'
      )
    })

    it('returns undefined for unknown result codes', () => {
      expect(getMessageFromCode('UNKNOWN')).toBeUndefined()
    })
  })

  describe('format', () => {
    it('formats a date based on the given format string', () => {
      const date = new Date(Date.UTC(2023, 0, 1, 12, 34, 56))
      expect(format(date, 'LLL dd, yyyy')).toBe('Jan 01, 2023')
    })
  })

  describe('parseISO', () => {
    it('parses an ISO date string into a Date object', () => {
      const date = parseISO('2023-01-01T12:00:00Z')
      expect(date.toISOString()).toBe('2023-01-01T12:00:00.000Z')
    })
  })

  describe('subMonths', () => {
    it('subtracts the specified number of months from a date', () => {
      const date = new Date('2023-06-15')
      expect(subMonths(date, 3).toISOString()).toBe('2023-03-15T00:00:00.000Z')
    })
  })
})
