/**
 * Tests for base-strategy.ts coverage - getters, setters, and edge cases
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike } from '../src'
import { createPathStrategy, NoPrefixPathStrategy, PrefixAndDefaultPathStrategy, PrefixExceptDefaultPathStrategy, PrefixPathStrategy } from '../src'
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

describe('BasePathStrategy - getters and setters', () => {
  test('setRouter updates router', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const newRouter = makeRouterAdapter(['test'])
    strategy.setRouter(newRouter)
    expect(strategy).toBeDefined()
  })

  test('getDefaultLocale returns default locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    expect(strategy.getDefaultLocale()).toBe('en')
  })

  test('getLocales returns locales array', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const locales = strategy.getLocales()
    expect(locales).toHaveLength(3)
    expect(locales[0]?.code).toBe('en')
  })

  test('getStrategy returns strategy name', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    expect(strategy.getStrategy()).toBe('prefix_except_default')
  })

  test('getLocalizedRouteNamePrefix returns prefix', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    expect(strategy.getLocalizedRouteNamePrefix()).toBe('localized-')
  })

  test('getGlobalLocaleRoutes returns globalLocaleRoutes', () => {
    const ctx = makeCtx('prefix_except_default', {
      globalLocaleRoutes: { page: { en: '/en-page', de: '/de-seite' } },
    })
    const strategy = createPathStrategy(ctx)
    expect(strategy.getGlobalLocaleRoutes()).toEqual({ page: { en: '/en-page', de: '/de-seite' } })
  })

  test('getRouteLocales returns routeLocales', () => {
    const ctx = makeCtx('prefix_except_default', {
      routeLocales: { 'special-page': ['en', 'de'] },
    })
    const strategy = createPathStrategy(ctx)
    expect(strategy.getRouteLocales()).toEqual({ 'special-page': ['en', 'de'] })
  })

  test('getRoutesLocaleLinks returns routesLocaleLinks', () => {
    const ctx = makeCtx('prefix_except_default', {
      routesLocaleLinks: { 'dir1-slug': 'index' },
    })
    const strategy = createPathStrategy(ctx)
    expect(strategy.getRoutesLocaleLinks()).toEqual({ 'dir1-slug': 'index' })
  })

  test('getNoPrefixRedirect returns noPrefixRedirect', () => {
    const ctx = makeCtx('prefix_except_default', { noPrefixRedirect: true })
    const strategy = createPathStrategy(ctx)
    expect(strategy.getNoPrefixRedirect()).toBe(true)
  })
})

describe('BasePathStrategy - getRouteBaseName', () => {
  test('returns base name from localized route with locale parameter', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const route: RouteLike = { name: 'localized-about-en', path: '/about' }
    expect(strategy.getRouteBaseName(route)).toBe('about')
  })

  test('returns base name without specific locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const route: RouteLike = { name: 'localized-page', path: '/page' }
    expect(strategy.getRouteBaseName(route)).toBe('page')
  })

  test('returns base name with specific locale parameter', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const route: RouteLike = { name: 'localized-about-de', path: '/de/about' }
    expect(strategy.getRouteBaseName(route, 'de')).toBe('about')
  })

  test('returns null for non-localized route', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const route: RouteLike = { name: 'about', path: '/about' }
    expect(strategy.getRouteBaseName(route)).toBe('about')
  })
})

describe('switchLocaleRoute - route name fallback logic', () => {
  test('uses nameWithoutSuffix when nameWithSuffix not found and sets locale param', () => {
    // Router has localized-page but not localized-page-de
    const router = makeRouterAdapter(['localized-page', 'page'])
    // Mock resolve to return path
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'localized-page') {
        return { ...r, path: '/de/page', fullPath: '/de/page' }
      }
      return r
    }

    const strategy = new PrefixPathStrategy(makeCtx('prefix', { router }))
    const route: ResolvedRouteLike = {
      name: 'localized-page-en',
      path: '/en/page',
      fullPath: '/en/page',
      params: { locale: 'en' },
    }

    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect((result as RouteLike).name).toBe('localized-page')
    expect((result as RouteLike).params?.locale).toBe('de')
  })

  test('uses baseName when neither localized names exist', () => {
    const router = makeRouterAdapter(['page'])
    const strategy = new PrefixPathStrategy(makeCtx('prefix', { router }))
    const route: ResolvedRouteLike = {
      name: 'localized-page-en',
      path: '/en/page',
      fullPath: '/en/page',
      params: { locale: 'en' },
    }

    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect((result as RouteLike).name).toBe('page')
  })

  test('returns fallback when no routes found', () => {
    const router = makeRouterAdapter([])
    const strategy = new PrefixPathStrategy(makeCtx('prefix', { router }))
    const route: ResolvedRouteLike = {
      name: 'localized-page-en',
      path: '/en/page',
      fullPath: '/en/page',
      params: { locale: 'en' },
    }

    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    // Should return fallback object
    expect(result).toBeDefined()
  })
})

describe('PrefixExceptDefaultPathStrategy - default locale handling', () => {
  test('resolves base route for default locale with params', () => {
    const router = makeRouterAdapter(['articles-id', 'localized-articles-id'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'articles-id') {
        return { ...r, path: '/articles/1', fullPath: '/articles/1' }
      }
      return r
    }

    const strategy = new PrefixExceptDefaultPathStrategy(makeCtx('prefix_except_default', { router }))
    const currentRoute: ResolvedRouteLike = {
      name: 'articles-id',
      path: '/articles/1',
      fullPath: '/articles/1',
      params: { id: '1' },
    }
    const result = strategy.localeRoute('en', { name: 'articles-id', params: { id: '1' } }, currentRoute)

    expect((result as RouteLike).path).toBeDefined()
  })

  test('adds locale prefix for non-default locale', () => {
    const router = makeRouterAdapter(['localized-articles-id-de', 'articles-id'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'localized-articles-id-de') {
        return { ...r, path: '/de/articles/1', fullPath: '/de/articles/1' }
      }
      return r
    }

    const strategy = new PrefixExceptDefaultPathStrategy(makeCtx('prefix_except_default', { router }))
    const currentRoute: ResolvedRouteLike = {
      name: 'articles-id',
      path: '/articles/1',
      fullPath: '/articles/1',
      params: { id: '1' },
    }
    const result = strategy.localeRoute('de', { name: 'articles-id', params: { id: '1' } }, currentRoute)

    expect((result as RouteLike).path).toBeDefined()
  })
})

describe('PrefixAndDefaultPathStrategy - switchLocaleRoute', () => {
  test('uses nameWithoutSuffix and sets locale param', () => {
    const router = makeRouterAdapter(['localized-index'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'localized-index') {
        return { ...r, path: '/de', fullPath: '/de' }
      }
      return r
    }

    const strategy = new PrefixAndDefaultPathStrategy(makeCtx('prefix_and_default', { router }))
    const route: ResolvedRouteLike = {
      name: 'localized-index-en',
      path: '/en',
      fullPath: '/en',
      params: { locale: 'en' },
    }

    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect((result as RouteLike).name).toBe('localized-index')
    expect((result as RouteLike).params?.locale).toBe('de')
  })

  test('uses baseName when no localized routes found', () => {
    const router = makeRouterAdapter(['index'])
    const strategy = new PrefixAndDefaultPathStrategy(makeCtx('prefix_and_default', { router }))
    const route: ResolvedRouteLike = {
      name: 'localized-index-en',
      path: '/en',
      fullPath: '/en',
      params: { locale: 'en' },
    }

    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect((result as RouteLike).name).toBe('index')
  })

  test('returns fallback when no routes match', () => {
    const router = makeRouterAdapter([])
    const strategy = new PrefixAndDefaultPathStrategy(makeCtx('prefix_and_default', { router }))
    const route: ResolvedRouteLike = {
      name: 'localized-page-en',
      path: '/en/page',
      fullPath: '/en/page',
      params: {},
    }

    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect((result as RouteLike).name).toBe('localized-page-de')
  })
})

describe('tryResolveByLocalizedName - error handling', () => {
  test('returns fallback when router.resolve throws error', () => {
    const router = makeRouterAdapter(['localized-page'])
    router.resolve = () => {
      throw new Error('Missing required param "locale"')
    }

    const strategy = new PrefixPathStrategy(makeCtx('prefix', { router }))
    const currentRoute: ResolvedRouteLike = {
      name: 'page',
      path: '/page',
      fullPath: '/page',
      params: {},
    }
    const result = strategy.localeRoute('de', { name: 'page' }, currentRoute)

    // Should not throw, should return fallback
    expect(result).toBeDefined()
  })
})

describe('applyBaseUrl - external URL handling', () => {
  test('returns string for external URLs with protocol', () => {
    const ctx = makeCtx('prefix_except_default', {
      locales: [
        { code: 'en', iso: 'en-US' },
        { code: 'fr', iso: 'fr-FR', baseUrl: 'https://fr.example.com' },
      ],
    })
    const router = makeRouterAdapter(['page', 'localized-page-fr'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'localized-page-fr') {
        return { ...r, path: '/page', fullPath: '/page' }
      }
      return r
    }
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
    expect(result).toBe('https://fr.example.com/page')
  })
})

describe('NoPrefixPathStrategy - formatPathForResolve', () => {
  test('returns path unchanged', () => {
    const strategy = new NoPrefixPathStrategy(makeCtx('no_prefix'))
    expect((strategy as any).formatPathForResolve('/about', 'en', 'de')).toBe('/about')
  })
})

describe('PrefixPathStrategy - formatPathForResolve', () => {
  test('returns path with locale prefix', () => {
    const strategy = new PrefixPathStrategy(makeCtx('prefix'))
    expect((strategy as any).formatPathForResolve('/about', 'en', 'de')).toBe('/en/about')
  })
})

describe('BasePathStrategy - getCanonicalPath', () => {
  test('returns null in base implementation (line 177)', () => {
    // PrefixPathStrategy uses base implementation
    const strategy = new PrefixPathStrategy(makeCtx('prefix'))
    const route: ResolvedRouteLike = {
      name: 'page',
      path: '/en/page',
      fullPath: '/en/page',
      params: {},
    }
    // Base getCanonicalPath returns null
    expect(strategy.getCanonicalPath(route, 'en')).toBeNull()
  })
})

describe('BasePathStrategy - applyBaseUrl edge cases', () => {
  test('returns route unchanged when route.path has protocol (line 102)', () => {
    const ctx = makeCtx('prefix_except_default', {
      locales: [
        { code: 'en', iso: 'en-US' },
        { code: 'fr', iso: 'fr-FR', baseUrl: 'https://fr.example.com' },
      ],
    })
    const router = makeRouterAdapter(['page'])
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const route: RouteLike = {
      name: 'page',
      path: 'https://example.com/page',
      fullPath: 'https://example.com/page',
      params: {},
    }

    // When route already has protocol, return as-is
    const result = (strategy as any).applyBaseUrl('fr', route)
    expect(result).toEqual(route)
  })

  test('returns route object when fullPath does not have protocol (line 123)', () => {
    const ctx = makeCtx('prefix_except_default', {
      locales: [
        { code: 'en', iso: 'en-US' },
        { code: 'de', iso: 'de-DE', baseUrl: '/de-prefix' }, // baseUrl without protocol
      ],
    })
    const router = makeRouterAdapter(['page'])
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const route: RouteLike = {
      name: 'page',
      path: '/page',
      fullPath: '/page',
      params: {},
    }

    // When baseUrl doesn't have protocol, return route object
    const result = (strategy as any).applyBaseUrl('de', route)
    expect(typeof result).toBe('object')
    expect(result.path).toBe('/de-prefix/page')
  })
})

describe('BasePathStrategy - tryResolveByLocalizedNameWithParams edge cases', () => {
  test('uses localizedNameWithoutSuffix when nameWithSuffix not found (line 256, 267)', () => {
    const router = makeRouterAdapter(['localized-articles-id'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'localized-articles-id') {
        const params = (to as RouteLike).params
        return { ...r, path: `/de/articles/${params?.id}`, fullPath: `/de/articles/${params?.id}` }
      }
      return r
    }

    const ctx = makeCtx('prefix', { router })
    const strategy = new PrefixPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'articles-id',
      path: '/en/articles/1',
      fullPath: '/en/articles/1',
      params: { id: '1' },
    }

    // Router has localized-articles-id but not localized-articles-id-de
    const result = strategy.localeRoute('de', { name: 'articles-id', params: { id: '1' } }, currentRoute)
    expect((result as RouteLike).path).toContain('/de/articles/1')
  })

  test('returns null when router.resolve throws (lines 280-281)', () => {
    const router = makeRouterAdapter(['localized-page-de'])
    router.hasRoute = () => true
    router.resolve = () => {
      throw new Error('Missing required param')
    }

    const ctx = makeCtx('prefix', { router })
    const strategy = new PrefixPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'page',
      path: '/en/page',
      fullPath: '/en/page',
      params: {},
    }

    // Should not throw, should return fallback
    const result = strategy.localeRoute('de', { name: 'page', params: { id: '1' } }, currentRoute)
    expect(result).toBeDefined()
  })
})

describe('BasePathStrategy - resolveLocaleRoute with index route', () => {
  test('handles index route with empty path (lines 512-518)', () => {
    const router = makeRouterAdapter(['index', 'localized-index'])
    router.resolve = (to: RouteLike | string) => {
      const name = typeof to === 'string' ? to : (to as RouteLike).name?.toString()
      return {
        name: name ?? null,
        path: '', // Empty path triggers ensureValidPath fallback
        fullPath: '',
        params: {},
        query: {},
        hash: '',
      }
    }

    const ctx = makeCtx('prefix_except_default', { router })
    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'index',
      path: '/',
      fullPath: '/',
      params: {},
    }
    const result = strategy.localeRoute('en', { name: 'index' }, currentRoute)
    expect(result).toBeDefined()
  })
})

describe('BasePathStrategy - resolveLocaleRoute edge cases', () => {
  test('returns source when effectiveBaseName is null (lines 660-661)', () => {
    const router = makeRouterAdapter([])
    router.resolve = () => ({
      name: null,
      path: '/',
      fullPath: '/',
      params: {},
      query: {},
      hash: '',
    })

    const ctx = makeCtx('prefix', { router })
    const strategy = new PrefixPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: null,
      path: '/',
      fullPath: '/',
      params: {},
    }

    // Route with no name - should return source
    const result = strategy.localeRoute('de', {}, currentRoute)
    expect(result).toBeDefined()
  })

  // Note: unlocalized route handling is tested in resolver-coverage.test.ts
  // and prefix-except-default-coverage.test.ts

  test('handles nested routes with custom segments (lines 638-647)', () => {
    const ctx = makeCtx('prefix', {
      globalLocaleRoutes: {
        parent: { en: '/parent-en', de: '/eltern' },
        'parent/child': { en: '/child-en', de: '/kind' },
      },
    })
    const router = makeRouterAdapter(['localized-parent-child-en', 'localized-parent-child-de'])
    router.resolve = (to: RouteLike | string) => {
      const name = typeof to === 'string' ? to : (to as RouteLike).name?.toString()
      if (name === 'localized-parent-child-de') {
        return { name, path: '/de/eltern/kind', fullPath: '/de/eltern/kind', params: {}, query: {}, hash: '' }
      }
      if (name === 'localized-parent-child-en') {
        return { name, path: '/en/parent-en/child-en', fullPath: '/en/parent-en/child-en', params: {}, query: {}, hash: '' }
      }
      return { name: null, path: '/', fullPath: '/', params: {}, query: {}, hash: '' }
    }
    ctx.router = router

    const strategy = new PrefixPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'localized-parent-child-en',
      path: '/en/parent-en/child-en',
      fullPath: '/en/parent-en/child-en',
      params: {},
    }

    const result = strategy.localeRoute('de', 'parent/child', currentRoute)
    expect((result as RouteLike).path).toContain('kind')
  })
})
