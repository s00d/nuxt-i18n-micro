import { FormatService } from '../src'
import { beforeEach, describe, expect, test, vi } from 'vitest'

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

    test('should reuse cached Intl.NumberFormat instances', () => {
      const spy = vi.spyOn(Intl, 'NumberFormat')
      formatService.formatNumber(1, 'en-US', { style: 'currency', currency: 'USD' })
      formatService.formatNumber(2, 'en-US', { style: 'currency', currency: 'USD' })
      formatService.formatNumber(3, 'en-US', { style: 'currency', currency: 'USD' })
      expect(spy).toHaveBeenCalledTimes(1)
      spy.mockRestore()
    })

    test('should create separate formatters for different options', () => {
      const spy = vi.spyOn(Intl, 'NumberFormat')
      formatService.formatNumber(1, 'en-US', { style: 'currency', currency: 'USD' })
      formatService.formatNumber(1, 'en-US', { style: 'currency', currency: 'EUR' })
      expect(spy).toHaveBeenCalledTimes(2)
      spy.mockRestore()
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

    test('should reuse cached Intl.DateTimeFormat instances', () => {
      const spy = vi.spyOn(Intl, 'DateTimeFormat')
      const date = new Date('2023-10-05T12:34:56Z')
      formatService.formatDate(date, 'en-US', { year: 'numeric' })
      formatService.formatDate(date, 'en-US', { year: 'numeric' })
      expect(spy).toHaveBeenCalledTimes(1)
      spy.mockRestore()
    })
  })

  describe('named formats', () => {
    test('resolveNumberFormat returns locale-specific options', () => {
      const service = new FormatService({
        numberFormats: {
          en: { currency: { style: 'currency', currency: 'USD' } },
          de: { currency: { style: 'currency', currency: 'EUR' } },
        },
      })
      expect(service.resolveNumberFormat('en', 'currency')).toEqual({ style: 'currency', currency: 'USD' })
      expect(service.resolveNumberFormat('de', 'currency')).toEqual({ style: 'currency', currency: 'EUR' })
      expect(service.resolveNumberFormat('fr', 'currency')).toBeUndefined()
    })

    test('resolveNumberFormat falls back to language subtag', () => {
      const service = new FormatService({
        numberFormats: {
          en: { currency: { style: 'currency', currency: 'USD' } },
        },
      })
      expect(service.resolveNumberFormat('en-US', 'currency')).toEqual({ style: 'currency', currency: 'USD' })
    })

    test('resolveDateTimeFormat returns named datetime options', () => {
      const service = new FormatService({
        datetimeFormats: {
          en: { short: { year: 'numeric', month: 'short', day: 'numeric' } },
        },
      })
      expect(service.resolveDateTimeFormat('en', 'short')).toEqual({
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
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

    test('should format relative time with RelativeTimeFormatOptions', () => {
      const past = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      const result = formatService.formatRelativeTime(past, 'en-US', {
        numeric: 'always',
        style: 'short',
      })
      expect(result).toMatch(/2 hr\. ago|2 hours ago/)
    })

    test('should handle invalid date by returning "0 seconds ago"', () => {
      const result = formatService.formatRelativeTime('invalid-date', 'en-US')
      expect(result).toBe('in 0 seconds')
    })

    test('should reuse cached Intl.RelativeTimeFormat instances', () => {
      const past = new Date(Date.now() - 60_000)
      const a = formatService.getRelativeTimeFormatter('en-US')
      const b = formatService.getRelativeTimeFormatter('en-US')
      expect(a).toBe(b)
      formatService.formatRelativeTime(past, 'en-US')
      expect(formatService.getRelativeTimeFormatter('en-US')).toBe(a)
    })
  })
})
