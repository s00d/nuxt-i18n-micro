import { createPathStrategy } from '../src'
import { makeRouterAdapter } from './test-utils'
import type { PathStrategyContext } from '../src'

describe('getClientRedirect', () => {
  describe('prefix strategy', () => {
    const makeContext = (extra?: Partial<PathStrategyContext>): PathStrategyContext => ({
      strategy: 'prefix',
      defaultLocale: 'en',
      locales: [{ code: 'en' }, { code: 'de' }, { code: 'ru' }],
      localizedRouteNamePrefix: 'localized-',
      router: makeRouterAdapter(),
      ...extra,
    })

    it('redirects from / to /en for default locale', () => {
      const strategy = createPathStrategy(makeContext())
      const result = strategy.getClientRedirect('/', 'en')
      expect(result).toBe('/en')
    })

    it('redirects from / to /de for non-default locale', () => {
      const strategy = createPathStrategy(makeContext())
      const result = strategy.getClientRedirect('/', 'de')
      expect(result).toBe('/de')
    })

    it('redirects from /page to /en/page', () => {
      const strategy = createPathStrategy(makeContext())
      const result = strategy.getClientRedirect('/page', 'en')
      expect(result).toBe('/en/page')
    })

    it('does not redirect when already on correct locale path', () => {
      const strategy = createPathStrategy(makeContext())
      const result = strategy.getClientRedirect('/en/page', 'en')
      expect(result).toBeNull()
    })

    it('does not redirect when URL has locale prefix (user explicit navigation)', () => {
      const strategy = createPathStrategy(makeContext())
      const result = strategy.getClientRedirect('/de/page', 'en')
      // URL has locale prefix - don't redirect, user explicitly navigated there
      expect(result).toBeNull()
    })

    it('uses custom path from globalLocaleRoutes', () => {
      const strategy = createPathStrategy(makeContext({
        globalLocaleRoutes: {
          page2: {
            en: '/custom-page2-en',
            de: '/custom-page2-de',
          },
        },
      }))
      const result = strategy.getClientRedirect('/page2', 'en')
      expect(result).toBe('/en/custom-page2-en')
    })

    it('uses custom path for non-default locale', () => {
      const strategy = createPathStrategy(makeContext({
        globalLocaleRoutes: {
          page2: {
            en: '/custom-page2-en',
            de: '/custom-page2-de',
          },
        },
      }))
      const result = strategy.getClientRedirect('/page2', 'de')
      expect(result).toBe('/de/custom-page2-de')
    })

    it('returns null for unlocalized routes', () => {
      const strategy = createPathStrategy(makeContext({
        globalLocaleRoutes: {
          unlocalized: false,
        },
      }))
      const result = strategy.getClientRedirect('/unlocalized', 'en')
      expect(result).toBeNull()
    })

    it('removes trailing slash from target path', () => {
      const strategy = createPathStrategy(makeContext())
      // When redirecting from /, target should be /en not /en/
      const result = strategy.getClientRedirect('/', 'en')
      expect(result).toBe('/en')
      expect(result?.endsWith('/')).toBe(false)
    })
  })

  describe('prefix_except_default strategy', () => {
    const makeContext = (extra?: Partial<PathStrategyContext>): PathStrategyContext => ({
      strategy: 'prefix_except_default',
      defaultLocale: 'en',
      locales: [{ code: 'en' }, { code: 'de' }, { code: 'ru' }],
      localizedRouteNamePrefix: 'localized-',
      router: makeRouterAdapter(),
      ...extra,
    })

    it('does not redirect from / when preferred is default locale', () => {
      const strategy = createPathStrategy(makeContext())
      const result = strategy.getClientRedirect('/', 'en')
      expect(result).toBeNull()
    })

    it('redirects from / to /de when preferred is non-default', () => {
      const strategy = createPathStrategy(makeContext())
      const result = strategy.getClientRedirect('/', 'de')
      expect(result).toBe('/de')
    })

    it('redirects from /page to /de/page when preferred is non-default', () => {
      const strategy = createPathStrategy(makeContext())
      const result = strategy.getClientRedirect('/page', 'de')
      expect(result).toBe('/de/page')
    })

    it('does not redirect from /page when preferred is default locale', () => {
      const strategy = createPathStrategy(makeContext())
      const result = strategy.getClientRedirect('/page', 'en')
      expect(result).toBeNull()
    })

    it('does not redirect when URL has locale prefix', () => {
      const strategy = createPathStrategy(makeContext())
      const result = strategy.getClientRedirect('/de/page', 'en')
      expect(result).toBeNull()
    })

    it('uses custom path from globalLocaleRoutes for non-default locale', () => {
      const strategy = createPathStrategy(makeContext({
        globalLocaleRoutes: {
          page2: {
            en: '/custom-page2-en',
            de: '/custom-page2-de',
          },
        },
      }))
      const result = strategy.getClientRedirect('/page2', 'de')
      expect(result).toBe('/de/custom-page2-de')
    })

    it('uses custom path for default locale (no prefix)', () => {
      const strategy = createPathStrategy(makeContext({
        globalLocaleRoutes: {
          page2: {
            en: '/custom-page2-en',
            de: '/custom-page2-de',
          },
        },
      }))
      const result = strategy.getClientRedirect('/page2', 'en')
      expect(result).toBe('/custom-page2-en')
    })

    it('returns null for unlocalized routes', () => {
      const strategy = createPathStrategy(makeContext({
        globalLocaleRoutes: {
          unlocalized: false,
        },
      }))
      const result = strategy.getClientRedirect('/unlocalized', 'de')
      expect(result).toBeNull()
    })

    it('removes trailing slash from target path', () => {
      const strategy = createPathStrategy(makeContext())
      const result = strategy.getClientRedirect('/', 'de')
      expect(result).toBe('/de')
      expect(result?.endsWith('/')).toBe(false)
    })

    describe('with includeDefaultLocaleRoute: true', () => {
      const makeContextWithInclude = (extra?: Partial<PathStrategyContext>): PathStrategyContext => ({
        strategy: 'prefix_except_default',
        defaultLocale: 'en',
        locales: [{ code: 'en' }, { code: 'de' }, { code: 'ru' }],
        localizedRouteNamePrefix: 'localized-',
        router: makeRouterAdapter(),
        includeDefaultLocaleRoute: true,
        ...extra,
      })

      it('redirects from / to /en when preferred is default locale', () => {
        const strategy = createPathStrategy(makeContextWithInclude())
        const result = strategy.getClientRedirect('/', 'en')
        expect(result).toBe('/en')
      })

      it('redirects from /page to /en/page when preferred is default locale', () => {
        const strategy = createPathStrategy(makeContextWithInclude())
        const result = strategy.getClientRedirect('/page', 'en')
        expect(result).toBe('/en/page')
      })

      it('uses custom path with prefix for default locale', () => {
        const strategy = createPathStrategy(makeContextWithInclude({
          globalLocaleRoutes: {
            page2: {
              en: '/custom-page2-en',
              de: '/custom-page2-de',
            },
          },
        }))
        const result = strategy.getClientRedirect('/page2', 'en')
        expect(result).toBe('/en/custom-page2-en')
      })
    })
  })

  describe('no_prefix strategy', () => {
    const makeContext = (extra?: Partial<PathStrategyContext>): PathStrategyContext => ({
      strategy: 'no_prefix',
      defaultLocale: 'en',
      locales: [{ code: 'en' }, { code: 'de' }, { code: 'ru' }],
      localizedRouteNamePrefix: 'localized-',
      router: makeRouterAdapter(),
      ...extra,
    })

    it('always returns null (no redirects for no_prefix)', () => {
      const strategy = createPathStrategy(makeContext())
      expect(strategy.getClientRedirect('/', 'en')).toBeNull()
      expect(strategy.getClientRedirect('/', 'de')).toBeNull()
      expect(strategy.getClientRedirect('/page', 'en')).toBeNull()
      expect(strategy.getClientRedirect('/page', 'de')).toBeNull()
    })
  })

  describe('prefix_and_default strategy', () => {
    const makeContext = (extra?: Partial<PathStrategyContext>): PathStrategyContext => ({
      strategy: 'prefix_and_default',
      defaultLocale: 'en',
      locales: [{ code: 'en' }, { code: 'de' }, { code: 'ru' }],
      localizedRouteNamePrefix: 'localized-',
      router: makeRouterAdapter(),
      ...extra,
    })

    it('does not redirect from / (both / and /<locale> are valid)', () => {
      const strategy = createPathStrategy(makeContext())
      // In prefix_and_default, root path is valid for any locale
      expect(strategy.getClientRedirect('/', 'en')).toBeNull()
      expect(strategy.getClientRedirect('/', 'de')).toBeNull()
    })

    it('does not redirect when URL has locale prefix', () => {
      const strategy = createPathStrategy(makeContext())
      const result = strategy.getClientRedirect('/en/page', 'de')
      // URL has locale prefix - don't redirect
      expect(result).toBeNull()
    })
  })
})
