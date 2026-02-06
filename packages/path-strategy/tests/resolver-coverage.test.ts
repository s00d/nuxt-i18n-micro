/**
 * Tests for resolver.ts - coverage for uncovered lines
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike } from '../src'
import { RouteResolver } from '../src/core/resolver'
import { makePathStrategyContext } from './test-utils'

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

describe('PathResolver - getPathForUnlocalizedRoute', () => {
  test('returns path when globalLocaleRoutes has entry set to false', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: { about: false },
    })
    const resolver = new RouteResolver(ctx)
    const route: ResolvedRouteLike = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {},
    }

    const result = resolver.getPathForUnlocalizedRoute(route)
    expect(result).toBe('/about')
  })

  test('returns pathWithoutLocale when key matches exactly', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: { 'special-page': false },
    })
    const resolver = new RouteResolver(ctx)
    const route: ResolvedRouteLike = {
      name: 'localized-special-page-en',
      path: '/special/page',
      fullPath: '/special/page',
      params: {},
    }

    const result = resolver.getPathForUnlocalizedRoute(route)
    expect(result).toBe('/special/page')
  })

  test('returns transformed path from baseRouteName', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: { 'my-page': false },
    })
    const resolver = new RouteResolver(ctx)
    const route: ResolvedRouteLike = {
      name: 'localized-my-page-en',
      path: '/my/page',
      fullPath: '/my/page',
      params: {},
    }

    const result = resolver.getPathForUnlocalizedRoute(route)
    expect(result).toBe('/my/page')
  })

  test('returns null when no matching globalLocaleRoutes', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: { other: { en: '/other-en', de: '/other-de' } },
    })
    const resolver = new RouteResolver(ctx)
    const route: ResolvedRouteLike = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {},
    }

    const result = resolver.getPathForUnlocalizedRoute(route)
    expect(result).toBeNull()
  })
})

describe('PathResolver - getPathForUnlocalizedRouteByName', () => {
  test('returns path when route name is set to false', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: { about: false },
    })
    const resolver = new RouteResolver(ctx)

    const result = resolver.getPathForUnlocalizedRouteByName('about')
    expect(result).toBe('/about')
  })

  test('returns path with leading slash variant', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: { '/contact': false },
    })
    const resolver = new RouteResolver(ctx)

    const result = resolver.getPathForUnlocalizedRouteByName('/contact')
    expect(result).toBe('/contact')
  })

  test('returns null when route is not unlocalized', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: { page: { en: '/page-en', de: '/seite' } },
    })
    const resolver = new RouteResolver(ctx)

    const result = resolver.getPathForUnlocalizedRouteByName('page')
    expect(result).toBeNull()
  })

  test('returns null when globalLocaleRoutes is empty', () => {
    const ctx = makeCtx({})
    const resolver = new RouteResolver(ctx)

    const result = resolver.getPathForUnlocalizedRouteByName('page')
    expect(result).toBeNull()
  })
})

describe('PathResolver - getAllowedLocalesForRoute', () => {
  test('returns all locales when routeLocales is empty', () => {
    const ctx = makeCtx({})
    const resolver = new RouteResolver(ctx)
    const route: ResolvedRouteLike = {
      name: 'about',
      path: '/about',
      fullPath: '/about',
      params: {},
    }

    const result = resolver.getAllowedLocalesForRoute(route)
    expect(result).toEqual(['en', 'de', 'ru'])
  })

  test('returns filtered locales when routeLocales has entry', () => {
    const ctx = makeCtx({
      routeLocales: { about: ['en', 'de'] },
    })
    const resolver = new RouteResolver(ctx)
    const route: ResolvedRouteLike = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {},
    }

    const result = resolver.getAllowedLocalesForRoute(route)
    expect(result).toEqual(['en', 'de'])
  })

  test('filters out invalid locale codes', () => {
    const ctx = makeCtx({
      routeLocales: { page: ['en', 'fr', 'invalid'] },
    })
    const resolver = new RouteResolver(ctx)
    const route: ResolvedRouteLike = {
      name: 'localized-page-en',
      path: '/page',
      fullPath: '/page',
      params: {},
    }

    const result = resolver.getAllowedLocalesForRoute(route)
    // Only en is valid from the list
    expect(result).toEqual(['en'])
  })

  test('uses routesLocaleLinks to find allowed locales', () => {
    const ctx = makeCtx({
      routeLocales: { 'main-page': ['en', 'ru'] },
      routesLocaleLinks: { about: 'main-page' },
    })
    const resolver = new RouteResolver(ctx)
    const route: ResolvedRouteLike = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {},
    }

    const result = resolver.getAllowedLocalesForRoute(route)
    expect(result).toEqual(['en', 'ru'])
  })
})

describe('PathResolver - getParentPathForNested', () => {
  test('returns "/" for single segment', () => {
    const ctx = makeCtx({})
    const resolver = new RouteResolver(ctx)

    const result = resolver.getParentPathForNested(['index'], 'en')
    expect(result).toBe('/')
  })

  test('returns parent path from globalLocaleRoutes', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: {
        docs: { en: '/documentation', de: '/dokumentation' },
      },
    })
    const resolver = new RouteResolver(ctx)

    const result = resolver.getParentPathForNested(['docs', 'intro'], 'en')
    expect(result).toBe('/documentation')
  })

  test('returns parent path for different locale', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: {
        docs: { en: '/documentation', de: '/dokumentation' },
      },
    })
    const resolver = new RouteResolver(ctx)

    const result = resolver.getParentPathForNested(['docs', 'intro'], 'de')
    expect(result).toBe('/dokumentation')
  })

  test('returns joined path when no globalLocaleRoutes match', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: { other: { en: '/other' } },
    })
    const resolver = new RouteResolver(ctx)

    const result = resolver.getParentPathForNested(['docs', 'guide', 'intro'], 'en')
    expect(result).toBe('/docs/guide')
  })

  test('returns joined path when globalLocaleRoutes is empty', () => {
    const ctx = makeCtx({})
    const resolver = new RouteResolver(ctx)

    const result = resolver.getParentPathForNested(['parent', 'child'], 'de')
    expect(result).toBe('/parent')
  })

  test('handles deep nesting', () => {
    const ctx = makeCtx({
      globalLocaleRoutes: {
        'a-b-c': { en: '/nested/path', de: '/verschachtelt/pfad' },
      },
    })
    const resolver = new RouteResolver(ctx)

    const result = resolver.getParentPathForNested(['a', 'b', 'c', 'd'], 'de')
    expect(result).toBe('/verschachtelt/pfad')
  })
})
