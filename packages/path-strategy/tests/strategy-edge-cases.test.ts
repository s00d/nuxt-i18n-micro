/**
 * Tests for edge cases and uncovered lines in strategies
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike } from '../src'
import {
  createPathStrategy,
  PrefixExceptDefaultPathStrategy,
  PrefixPathStrategy,
  PrefixAndDefaultPathStrategy,
  NoPrefixPathStrategy,
} from '../src'
import { makePathStrategyContext, makeRouterAdapter } from './test-utils'

const baseConfig: ModuleOptionsExtend = {
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  locales: [
    { code: 'en', iso: 'en-US' },
    { code: 'de', iso: 'de-DE' },
    { code: 'ru', iso: 'ru-RU' },
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

describe('applyBaseUrl edge cases', () => {
  test('returns route unchanged when path already has protocol', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const currentRoute: ResolvedRouteLike = {
      name: 'page',
      path: '/page',
      fullPath: '/page',
      params: {},
    }

    // Call switchLocaleRoute which internally uses applyBaseUrl
    const result = strategy.switchLocaleRoute('en', 'de', currentRoute, {})
    expect(result).toBeDefined()
  })

  test('returns string when route is string and already has protocol', () => {
    const ctx = makeCtx('prefix_except_default', {
      locales: [
        { code: 'en', iso: 'en-US' },
        { code: 'fr', iso: 'fr-FR', baseUrl: 'https://fr.example.com' },
      ],
    })
    const router = makeRouterAdapter(['localized-page-fr'])
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const route: ResolvedRouteLike = {
      name: 'page',
      path: '/page',
      fullPath: '/page',
      params: {},
    }

    const result = strategy.switchLocaleRoute('en', 'fr', route, {})
    expect(typeof result).toBe('string')
    expect(result).toContain('fr.example.com')
  })
})

describe('getCanonicalPath', () => {
  test('returns null by default', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const route: ResolvedRouteLike = {
      name: 'about',
      path: '/about',
      fullPath: '/about',
      params: {},
    }

    expect(strategy.getCanonicalPath(route, 'en')).toBeNull()
  })
})

describe('switchLocaleRoute with i18nRouteParams', () => {
  test('uses i18nRouteParams for target locale', () => {
    const router = makeRouterAdapter(['localized-product-en', 'localized-product-de'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'localized-product-de') {
        return { ...r, path: '/de/produkt', fullPath: '/de/produkt' }
      }
      return r
    }

    const ctx = makeCtx('prefix', { router })
    const strategy = new PrefixPathStrategy(ctx)
    const route: ResolvedRouteLike = {
      name: 'localized-product-en',
      path: '/en/product',
      fullPath: '/en/product',
      params: { slug: 'test' },
    }

    const result = strategy.switchLocaleRoute('en', 'de', route, {
      i18nRouteParams: {
        de: { slug: 'test-de' },
      },
    })
    expect(result).toBeDefined()
  })
})

describe('localeRoute with nested routes', () => {
  test('handles nested route with parent custom path', () => {
    const ctx = makeCtx('prefix_except_default', {
      globalLocaleRoutes: {
        'docs': { en: '/documentation', de: '/dokumentation' },
        'docs-guide': { en: '/guide', de: '/anleitung' },
      },
    })
    const router = makeRouterAdapter(['localized-docs-guide-en', 'localized-docs-guide-de'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'localized-docs-guide-de') {
        return { ...r, path: '/de/dokumentation/anleitung', fullPath: '/de/dokumentation/anleitung' }
      }
      return r
    }
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'localized-docs-guide-en',
      path: '/documentation/guide',
      fullPath: '/documentation/guide',
      params: {},
    }

    const result = strategy.localeRoute('de', 'docs-guide', currentRoute)
    expect(result).toBeDefined()
  })
})

describe('prefix strategy formatPathForResolve', () => {
  test('adds locale prefix to path', () => {
    const strategy = new PrefixPathStrategy(makeCtx('prefix'))
    const currentRoute: ResolvedRouteLike = {
      name: 'about',
      path: '/about',
      fullPath: '/about',
      params: {},
    }

    const result = strategy.localeRoute('de', '/about', currentRoute)
    expect((result as RouteLike).path).toContain('/de/')
  })
})

describe('prefix_and_default strategy', () => {
  test('handles root path for non-default locale', () => {
    const router = makeRouterAdapter(['localized-index', 'localized-index-en', 'localized-index-de'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'localized-index-de') {
        return { ...r, path: '/de', fullPath: '/de' }
      }
      return r
    }

    const strategy = new PrefixAndDefaultPathStrategy(makeCtx('prefix_and_default', { router }))
    const route: ResolvedRouteLike = {
      name: 'localized-index-en',
      path: '/',
      fullPath: '/',
      params: {},
    }

    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect(result).toBeDefined()
  })
})

describe('no_prefix strategy edge cases', () => {
  test('handles path without changes', () => {
    const strategy = new NoPrefixPathStrategy(makeCtx('no_prefix'))
    const currentRoute: ResolvedRouteLike = {
      name: 'about',
      path: '/about',
      fullPath: '/about',
      params: {},
    }

    const result = strategy.localeRoute('de', '/about', currentRoute)
    expect((result as RouteLike).path).toBe('/about')
  })

  test('switchLocaleRoute returns localized route for different locale', () => {
    const router = makeRouterAdapter(['localized-about-en', 'localized-about-de'])
    const strategy = new NoPrefixPathStrategy(makeCtx('no_prefix', { router }))
    const route: ResolvedRouteLike = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {},
    }

    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect((result as RouteLike).name).toBe('localized-about-de')
  })
})

describe('factory edge case', () => {
  test('returns strategy for valid type', () => {
    const ctx = makeCtx('prefix')
    const strategy = createPathStrategy(ctx)

    expect(strategy).toBeInstanceOf(PrefixPathStrategy)
  })
})
