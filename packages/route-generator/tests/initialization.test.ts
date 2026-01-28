import { RouteGenerator } from '../src/index'
import { locales, defaultLocaleCode } from './helpers'

describe('RouteGenerator', () => {
  describe('Initialization', () => {
    test('should correctly calculate active locale codes for `prefix_except_default`', () => {
      const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, {}, false)
      expect(generator.activeLocaleCodes).toEqual(['de', 'ru'])
    })

    test('should correctly calculate active locale codes for `prefix`', () => {
      const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix', undefined, {}, {}, false)
      expect(generator.activeLocaleCodes).toEqual(['en', 'de', 'ru'])
    })

    test('should find the default locale correctly', () => {
      const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, {}, false)
      expect(generator.defaultLocale).toEqual({ code: 'en', iso: 'en-US' })
    })
  })
})
