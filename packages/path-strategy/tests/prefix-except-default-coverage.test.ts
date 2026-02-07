/**
 * Tests for prefix-except-default.ts coverage - uncovered lines
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike } from '../src'
import { PrefixExceptDefaultPathStrategy } from '../src'
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

function makeCtx(extra?: Partial<PathStrategyContext>): PathStrategyContext {
  return makePathStrategyContext(baseConfig, 'prefix_except_default', extra)
}

describe('PrefixExceptDefaultPathStrategy - localeRoute edge cases', () => {
  test('handles route with custom path segment for target locale (lines 169-184)', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: {
        about: { en: '/about-us', de: '/ueber-uns' },
      },
    })
    const router = makeRouterAdapter(['localized-about-en', 'localized-about-de'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'localized-about-de') {
        return { ...r, path: '/de/ueber-uns', fullPath: '/de/ueber-uns' }
      }
      if ((to as RouteLike).name === 'localized-about-en') {
        return { ...r, path: '/about-us', fullPath: '/about-us' }
      }
      return r
    }
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'localized-about-en',
      path: '/about-us',
      fullPath: '/about-us',
      params: {},
    }

    const result = strategy.localeRoute('de', 'about', currentRoute)
    expect((result as RouteLike).path).toContain('de')
  })

  test('handles nested route with custom parent path (lines 194-196)', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: {
        parent: { en: '/parent-en', de: '/eltern' },
        'parent-child': { en: '/child-en', de: '/kind' },
      },
    })
    const router = makeRouterAdapter(['localized-parent-child-en', 'localized-parent-child-de'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      const name = (to as RouteLike).name
      if (name === 'localized-parent-child-de') {
        return { ...r, path: '/de/eltern/kind', fullPath: '/de/eltern/kind' }
      }
      return r
    }
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'localized-parent-child-en',
      path: '/parent-en/child-en',
      fullPath: '/parent-en/child-en',
      params: {},
    }

    const result = strategy.localeRoute('de', 'parent-child', currentRoute)
    expect(result).toBeDefined()
  })

  test('handles synthetic path fallback (lines 241-255)', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: {
        'custom-page': { en: '/custom', de: '/benutzerdefiniert' },
      },
    })
    const router = makeRouterAdapter([])
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'index',
      path: '/',
      fullPath: '/',
      params: {},
    }

    const result = strategy.localeRoute('de', 'custom-page', currentRoute)
    expect((result as RouteLike).path).toContain('benutzerdefiniert')
  })

  test('handles default locale without prefix (lines 342)', () => {
    const router = makeRouterAdapter(['index', 'about'])
    const ctx = makeCtx({ router })

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'about',
      path: '/about',
      fullPath: '/about',
      params: {},
    }

    // Switch from de to en (default locale)
    const result = strategy.localeRoute('en', '/about', currentRoute)
    expect((result as RouteLike).path).toBe('/about')
    expect((result as RouteLike).path).not.toContain('/en/')
  })

  test('handles unlocalized route (lines 388, 396)', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: {
        'static-page': false, // not localized
      },
    })
    const router = makeRouterAdapter(['static-page'])
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'static-page',
      path: '/static-page',
      fullPath: '/static-page',
      params: {},
    }

    // For unlocalized routes, expect path without locale prefix for default locale
    const result = strategy.localeRoute('en', 'static-page', currentRoute)
    expect((result as RouteLike).path).toBe('/static-page')
  })

  test('handles route with routesLocaleLinks (lines 414-420)', () => {
    const ctx = makeCtx({
      routesLocaleLinks: { 'linked-page': 'main-page' },
      globalLocaleRoutes: {
        'main-page': { en: '/main', de: '/haupt' },
      },
    })
    const router = makeRouterAdapter(['localized-linked-page-en', 'localized-linked-page-de'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'localized-linked-page-de') {
        return { ...r, path: '/de/haupt', fullPath: '/de/haupt' }
      }
      return r
    }
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'localized-linked-page-en',
      path: '/main',
      fullPath: '/main',
      params: {},
    }

    const result = strategy.localeRoute('de', 'linked-page', currentRoute)
    expect(result).toBeDefined()
  })
})

describe('PrefixExceptDefaultPathStrategy - getRedirect', () => {
  test('redirects unlocalized route from /locale/path to /path (line 342)', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: {
        static: false,
      },
    })
    const router = makeRouterAdapter()
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    // When unlocalized route is accessed with locale prefix, redirect to path without locale
    const result = strategy.getRedirect('/de/static', 'de')
    expect(result).toBe('/static')
  })
})

describe('PrefixExceptDefaultPathStrategy - shouldReturn404', () => {
  test('returns 404 for default locale with prefix (lines 368-380)', () => {
    const ctx = makeCtx()
    const router = makeRouterAdapter()
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    // /en is 404 for prefix_except_default when en is default locale
    const result = strategy.shouldReturn404('/en')
    expect(result).toBe('Default locale should not have prefix')
  })

  test('returns null for non-default locale with prefix', () => {
    const ctx = makeCtx()
    const router = makeRouterAdapter()
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    // /de is OK for prefix_except_default
    const result = strategy.shouldReturn404('/de')
    expect(result).toBeNull()
  })

  test('returns null for path without locale prefix', () => {
    const ctx = makeCtx()
    const router = makeRouterAdapter()
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    // /page without locale prefix - no 404
    const result = strategy.shouldReturn404('/page')
    expect(result).toBeNull()
  })
})

describe('PrefixExceptDefaultPathStrategy - formatPathForResolve', () => {
  test('adds prefix for non-default toLocale (lines 468-471)', () => {
    const ctx = makeCtx()
    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const result = strategy.formatPathForResolve('/page', 'de', 'de')
    expect(result).toBe('/de/page')
  })

  test('returns path as-is for default locale', () => {
    const ctx = makeCtx()
    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const result = strategy.formatPathForResolve('/page', 'en', 'en')
    expect(result).toBe('/page')
  })
})

describe('PrefixExceptDefaultPathStrategy - switchLocaleRoute to default', () => {
  test('handles switch from non-default to default locale (lines 49, 60)', () => {
    const router = makeRouterAdapter(['page', 'localized-page', 'localized-page-de'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'page') {
        return { ...r, path: '/page', fullPath: '/page' }
      }
      if ((to as RouteLike).name === 'localized-page-de') {
        return { ...r, path: '/de/page', fullPath: '/de/page' }
      }
      return r
    }

    const ctx = makeCtx({ router })
    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const route: ResolvedRouteLike = {
      name: 'localized-page-de',
      path: '/de/page',
      fullPath: '/de/page',
      params: { locale: 'de' },
    }

    // Switch from de to en (default) - should use baseName without locale suffix
    const result = strategy.switchLocaleRoute('de', 'en', route, {})
    expect((result as RouteLike).name).toBe('page')
    expect((result as RouteLike).params).not.toHaveProperty('locale')
  })
})

describe('PrefixExceptDefaultPathStrategy - nested routes (lines 404, 412, 430-436)', () => {
  test('handles nested route with parent defined in globalLocaleRoutes (keyFirst variant)', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: {
        'activity/hiking': { en: '/hiking-en', de: '/wandern' },
        activity: { en: '/activity-en', de: '/aktivitaet' },
      },
    })
    const router = makeRouterAdapter(['localized-activity-hiking-en', 'localized-activity-hiking-de'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'localized-activity-hiking-de') {
        return { ...r, path: '/de/aktivitaet/wandern', fullPath: '/de/aktivitaet/wandern' }
      }
      return r
    }
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'localized-activity-hiking-en',
      path: '/activity-en/hiking-en',
      fullPath: '/activity-en/hiking-en',
      params: {},
    }

    const result = strategy.localeRoute('de', 'activity/hiking', currentRoute)
    expect((result as RouteLike).path).toContain('wandern')
  })

  test('handles getParentPathForTarget with currentRoute fallback (lines 430-432)', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: {
        'parent/child': { en: '/child-en', de: '/kind' },
        // No parent rules defined - will fallback to currentRoute.path
      },
    })
    const router = makeRouterAdapter(['localized-parent-child-en', 'localized-parent-child-de'])
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'localized-parent-child-en',
      path: '/parent/child-en',
      fullPath: '/parent/child-en',
      params: {},
    }

    const result = strategy.localeRoute('de', 'parent/child', currentRoute)
    expect(result).toBeDefined()
  })

  test('handles getParentPathForTarget with name segments fallback (lines 435-436)', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: {
        'deep/nested/child': { en: '/child-en', de: '/kind' },
        // No parent rules, no currentRoute with path
      },
    })
    const router = makeRouterAdapter([])
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    // currentRoute with no usable path
    const currentRoute: ResolvedRouteLike = {
      name: 'index',
      path: '/',
      fullPath: '/',
      params: {},
    }

    const result = strategy.localeRoute('de', 'deep/nested/child', currentRoute)
    expect((result as RouteLike).path).toContain('kind')
  })
})

describe('PrefixExceptDefaultPathStrategy - resolveLocaleRoute with resolved.name (lines 164, 169-184)', () => {
  test('handles route with custom segment and nested info', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: {
        'products/detail': { en: '/detail-en', de: '/details-de' },
        products: { en: '/products-en', de: '/produkte' },
      },
    })
    const router = makeRouterAdapter(['localized-products-detail-en', 'localized-products-detail-de'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      const name = (to as RouteLike).name
      if (name === 'localized-products-detail-de') {
        return { ...r, name: 'localized-products-detail-de', path: '/de/produkte/details-de', fullPath: '/de/produkte/details-de' }
      }
      if (name === 'localized-products-detail-en') {
        return { ...r, name: 'localized-products-detail-en', path: '/products-en/detail-en', fullPath: '/products-en/detail-en' }
      }
      return r
    }
    ctx.router = router

    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const currentRoute: ResolvedRouteLike = {
      name: 'localized-products-detail-en',
      path: '/products-en/detail-en',
      fullPath: '/products-en/detail-en',
      params: {},
    }

    const result = strategy.localeRoute('de', 'products/detail', currentRoute)
    expect((result as RouteLike).path).toContain('details-de')
  })
})

describe('PrefixExceptDefaultPathStrategy - switchLocaleRoute', () => {
  test('handles switch to locale with baseUrl', () => {
    const ctx = makeCtx({
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
    expect(result as string).toContain('fr.example.com')
  })

  test('handles switch with query and hash preserved', () => {
    const router = makeRouterAdapter(['page', 'localized-page-de'])
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if ((to as RouteLike).name === 'localized-page-de') {
        return { ...r, path: '/de/page', fullPath: '/de/page' }
      }
      return r
    }

    const strategy = new PrefixExceptDefaultPathStrategy(makeCtx({ router }))
    const route: ResolvedRouteLike = {
      name: 'page',
      path: '/page',
      fullPath: '/page?foo=bar#section',
      params: {},
      query: { foo: 'bar' },
      hash: '#section',
    }

    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect((result as RouteLike).query).toEqual({ foo: 'bar' })
    expect((result as RouteLike).hash).toBe('#section')
  })
})
