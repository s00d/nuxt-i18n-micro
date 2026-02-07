import { RouteGenerator } from '../src/index'
import { defaultLocaleCode, locales } from './helpers'

describe('RouteGenerator', () => {
  describe('Initialization', () => {
    test('should correctly calculate active locale codes for `prefix_except_default`', () => {
      const generator = new RouteGenerator({
        locales,
        defaultLocaleCode,
        strategy: 'prefix_except_default',
        globalLocaleRoutes: {},
        routeLocales: {},
        noPrefixRedirect: false,
      })
      expect(generator.activeLocaleCodes).toEqual(['de', 'ru'])
    })

    test('should correctly calculate active locale codes for `prefix`', () => {
      const generator = new RouteGenerator({
        locales,
        defaultLocaleCode,
        strategy: 'prefix',
        globalLocaleRoutes: {},
        routeLocales: {},
        noPrefixRedirect: false,
      })
      expect(generator.activeLocaleCodes).toEqual(['en', 'de', 'ru'])
    })

    test('should find the default locale correctly', () => {
      const generator = new RouteGenerator({
        locales,
        defaultLocaleCode,
        strategy: 'prefix_except_default',
        globalLocaleRoutes: {},
        routeLocales: {},
        noPrefixRedirect: false,
      })
      expect(generator.defaultLocale).toEqual({ code: 'en', iso: 'en-US' })
    })
  })
})
