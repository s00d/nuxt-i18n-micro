import { FormatService } from '../src'

describe('FormatService', () => {
  let formatService: FormatService

  beforeEach(() => {
    formatService = new FormatService()
  })

  describe('formatNumber', () => {
    test('should format number with default options', () => {
      const result = formatService.formatNumber(123456.789, 'en-US')
      expect(result).toBe('123,456.789')
    })

    test('should format number with custom options', () => {
      const result = formatService.formatNumber(123456.789, 'de-DE', {
        style: 'currency',
        currency: 'EUR',
      })
      expect(result).toBe('123.456,79 €')
    })

    test('should handle invalid locale by falling back to default formatting', () => {
      const result = formatService.formatNumber(123456.789, 'invalid-locale')
      expect(result).toBe('123,456.789') // Fallback to default formatting
    })
  })

  describe('formatDate', () => {
    test('should format date with default options', () => {
      const date = new Date('2023-10-05T12:34:56Z')
      const result = formatService.formatDate(date, 'en-US')
      expect(result).toBe('10/5/2023')
    })

    test('should format date with custom options', () => {
      const date = new Date('2023-10-05T12:34:56Z')
      const result = formatService.formatDate(date, 'de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      expect(result).toBe('5. Oktober 2023')
    })

    test('should handle invalid date by returning "Invalid Date"', () => {
      const result = formatService.formatDate('invalid-date', 'en-US')
      expect(result).toBe('Invalid Date')
    })
  })

  describe('formatRelativeTime', () => {
    test('should format relative time for seconds', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 30 * 1000) // 30 seconds ago
      const result = formatService.formatRelativeTime(past, 'en-US')
      expect(result).toBe('30 seconds ago')
    })

    test('should format relative time for minutes', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 5 * 60 * 1000) // 5 minutes ago
      const result = formatService.formatRelativeTime(past, 'en-US')
      expect(result).toBe('5 minutes ago')
    })

    test('should format relative time for hours', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
      const result = formatService.formatRelativeTime(past, 'en-US')
      expect(result).toBe('2 hours ago')
    })

    test('should format relative time for days', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      const result = formatService.formatRelativeTime(past, 'en-US')
      expect(result).toBe('3 days ago')
    })

    test('should format relative time for months', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) // ~2 months ago
      const result = formatService.formatRelativeTime(past, 'en-US')
      expect(result).toBe('2 months ago')
    })

    test('should format relative time for years', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      const result = formatService.formatRelativeTime(past, 'en-US')
      expect(result).toBe('1 year ago')
    })

    test('should handle invalid date by returning "0 seconds ago"', () => {
      const result = formatService.formatRelativeTime('invalid-date', 'en-US')
      expect(result).toBe('in 0 seconds')
    })
  })
})
