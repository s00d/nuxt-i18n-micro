/**
 * Tests for getCurrentLocale, getPluginRouteName, getCurrentLocaleName, extractLocaleFromPath
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike } from '../src'
import {
  createPathStrategy,
  PrefixExceptDefaultPathStrategy,
  PrefixPathStrategy,
  PrefixAndDefaultPathStrategy,
  NoPrefixPathStrategy,
} from '../src'
import { makePathStrategyContext } from './test-utils'

const baseConfig: ModuleOptionsExtend = {
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  locales: [
    { code: 'en', iso: 'en-US', displayName: 'English' },
    { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
    { code: 'ru', iso: 'ru-RU', displayName: 'Русский' },
  ],
  dateBuild: 0,
  hashMode: false,
  isSSG: false,
  apiBaseUrl: '',
  disablePageLocales: false,
}

function makeCtx(strategy: NonNullable<ModuleOptionsExtend['strategy']>, extra?: Partial<PathStrategyContext>): PathStrategyContext {
  return makePathStrategyContext(baseConfig, strategy, extra)
}

describe('getCurrentLocale', () => {
  describe('hashMode', () => {
    test('returns locale from getter when hashMode is true', () => {
      const ctx = makeCtx('prefix_except_default', { hashMode: true })
      const strategy = createPathStrategy(ctx)
      const route: ResolvedRouteLike = { name: 'index', path: '/', fullPath: '/', params: {} }

      expect(strategy.getCurrentLocale(route, () => 'de')).toBe('de')
    })

    test('returns defaultLocale when hashMode is true and no getter', () => {
      const ctx = makeCtx('prefix_except_default', { hashMode: true })
      const strategy = createPathStrategy(ctx)
      const route: ResolvedRouteLike = { name: 'index', path: '/', fullPath: '/', params: {} }

      expect(strategy.getCurrentLocale(route)).toBe('en')
    })
  })

  describe('no_prefix strategy', () => {
    test('returns locale from getter', () => {
      const strategy = new NoPrefixPathStrategy(makeCtx('no_prefix'))
      const route: ResolvedRouteLike = { name: 'about', path: '/about', fullPath: '/about', params: {} }

      expect(strategy.getCurrentLocale(route, () => 'ru')).toBe('ru')
    })

    test('returns defaultLocale when no getter', () => {
      const strategy = new NoPrefixPathStrategy(makeCtx('no_prefix'))
      const route: ResolvedRouteLike = { name: 'about', path: '/about', fullPath: '/about', params: {} }

      expect(strategy.getCurrentLocale(route)).toBe('en')
    })
  })

  describe('prefix_and_default at root', () => {
    test('returns locale from getter when at root path', () => {
      const strategy = new PrefixAndDefaultPathStrategy(makeCtx('prefix_and_default'))
      const route: ResolvedRouteLike = { name: 'index', path: '/', fullPath: '/', params: {} }

      expect(strategy.getCurrentLocale(route, () => 'de')).toBe('de')
    })

    test('returns locale from getter when path is empty', () => {
      const strategy = new PrefixAndDefaultPathStrategy(makeCtx('prefix_and_default'))
      const route: ResolvedRouteLike = { name: 'index', path: '', fullPath: '', params: {} }

      expect(strategy.getCurrentLocale(route, () => 'ru')).toBe('ru')
    })
  })

  describe('locale from route.params', () => {
    test('returns locale from route.params.locale', () => {
      const strategy = new PrefixPathStrategy(makeCtx('prefix'))
      const route: ResolvedRouteLike = { name: 'localized-about', path: '/de/about', fullPath: '/de/about', params: { locale: 'de' } }

      expect(strategy.getCurrentLocale(route)).toBe('de')
    })
  })

  describe('locale from path extraction', () => {
    test('extracts locale from path when params not available', () => {
      const strategy = new PrefixPathStrategy(makeCtx('prefix'))
      const route: ResolvedRouteLike = { name: 'not-found', path: '/ru/some-page', fullPath: '/ru/some-page', params: {} }

      expect(strategy.getCurrentLocale(route)).toBe('ru')
    })

    test('handles path with query params', () => {
      const strategy = new PrefixPathStrategy(makeCtx('prefix'))
      const route: ResolvedRouteLike = { name: 'page', path: '/de/page?foo=bar', fullPath: '/de/page?foo=bar', params: {} }

      expect(strategy.getCurrentLocale(route)).toBe('de')
    })

    test('handles path with hash', () => {
      const strategy = new PrefixPathStrategy(makeCtx('prefix'))
      const route: ResolvedRouteLike = { name: 'page', path: '/ru/page#section', fullPath: '/ru/page#section', params: {} }

      expect(strategy.getCurrentLocale(route)).toBe('ru')
    })

    test('returns null for non-locale first segment', () => {
      const strategy = new PrefixPathStrategy(makeCtx('prefix'))
      const route: ResolvedRouteLike = { name: 'page', path: '/other/page', fullPath: '/other/page', params: {} }

      // Should fallback to getter or default
      expect(strategy.getCurrentLocale(route, () => 'de')).toBe('de')
    })
  })

  describe('prefix_except_default fallback', () => {
    test('returns defaultLocale for path without locale prefix', () => {
      const strategy = new PrefixExceptDefaultPathStrategy(makeCtx('prefix_except_default'))
      const route: ResolvedRouteLike = { name: 'about', path: '/about', fullPath: '/about', params: {} }

      expect(strategy.getCurrentLocale(route)).toBe('en')
    })
  })

  describe('edge cases', () => {
    test('handles empty path', () => {
      const strategy = new PrefixPathStrategy(makeCtx('prefix'))
      const route: ResolvedRouteLike = { name: 'index', path: '', fullPath: '', params: {} }

      expect(strategy.getCurrentLocale(route, () => 'de')).toBe('de')
    })

    test('handles root path', () => {
      const strategy = new PrefixPathStrategy(makeCtx('prefix'))
      const route: ResolvedRouteLike = { name: 'index', path: '/', fullPath: '/', params: {} }

      expect(strategy.getCurrentLocale(route, () => 'ru')).toBe('ru')
    })

    test('handles null/undefined path', () => {
      const strategy = new PrefixPathStrategy(makeCtx('prefix'))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const route: ResolvedRouteLike = { name: 'index', params: {} } as any

      expect(strategy.getCurrentLocale(route, () => 'de')).toBe('de')
    })
  })
})

describe('getPluginRouteName', () => {
  test('returns "general" when disablePageLocales is true', () => {
    const ctx = makeCtx('prefix_except_default', { disablePageLocales: true })
    const strategy = createPathStrategy(ctx)
    const route: ResolvedRouteLike = { name: 'localized-about-en', path: '/about', fullPath: '/about', params: {} }

    expect(strategy.getPluginRouteName(route, 'en')).toBe('general')
  })

  test('returns base name from route', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const route: ResolvedRouteLike = { name: 'localized-about-en', path: '/about', fullPath: '/about', params: {} }

    expect(strategy.getPluginRouteName(route, 'en')).toBe('about')
  })

  test('returns route name without prefix when baseName not found', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const route: ResolvedRouteLike = { name: 'custom-route', path: '/custom', fullPath: '/custom', params: {} }

    expect(strategy.getPluginRouteName(route, 'en')).toBe('custom-route')
  })

  test('strips locale suffix from fallback name', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const route: ResolvedRouteLike = { name: 'localized-page-en', path: '/page', fullPath: '/page', params: {} }

    expect(strategy.getPluginRouteName(route, 'en')).toBe('page')
  })
})

describe('getCurrentLocaleName', () => {
  test('returns displayName of current locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const route: ResolvedRouteLike = { name: 'about', path: '/about', fullPath: '/about', params: {} }

    expect(strategy.getCurrentLocaleName(route)).toBe('English')
  })

  test('returns displayName for locale with prefix', () => {
    const strategy = new PrefixPathStrategy(makeCtx('prefix'))
    const route: ResolvedRouteLike = { name: 'localized-about', path: '/de/about', fullPath: '/de/about', params: { locale: 'de' } }

    expect(strategy.getCurrentLocaleName(route)).toBe('Deutsch')
  })

  test('returns null when locale not found', () => {
    const ctx = makeCtx('prefix_except_default')
    ctx.locales = [{ code: 'en', iso: 'en-US' }] // no displayName
    const strategy = createPathStrategy(ctx)
    const route: ResolvedRouteLike = { name: 'about', path: '/about', fullPath: '/about', params: {} }

    expect(strategy.getCurrentLocaleName(route)).toBeNull()
  })
})

describe('extractLocaleFromPath - edge cases', () => {
  test('returns null for empty path', () => {
    const strategy = new PrefixPathStrategy(makeCtx('prefix'))
    const route: ResolvedRouteLike = { name: 'index', path: '', fullPath: '', params: {} }

    // Will use getter fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(strategy.getCurrentLocale(route, () => null as any)).toBe('en')
  })

  test('handles path with only slashes', () => {
    const strategy = new PrefixPathStrategy(makeCtx('prefix'))
    const route: ResolvedRouteLike = { name: 'index', path: '///', fullPath: '///', params: {} }

    expect(strategy.getCurrentLocale(route, () => 'de')).toBe('de')
  })

  test('handles path with query and hash combined', () => {
    const strategy = new PrefixPathStrategy(makeCtx('prefix'))
    const route: ResolvedRouteLike = { name: 'page', path: '/de/page?a=1&b=2#section', fullPath: '/de/page?a=1&b=2#section', params: {} }

    expect(strategy.getCurrentLocale(route)).toBe('de')
  })
})
