/**
 * Deep tests: large configs for all strategies, full state in snapshots.
 * Documents resolveLocaleFromPath, getRedirect, localeRoute, getSeoAttributes, switchLocaleRoute, getCanonicalPath behavior.
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike } from '../src'
import { createPathStrategy } from '../src'
import { makePathStrategyContext, makeRouterAdapter } from './test-utils'

type StrategyName = 'no_prefix' | 'prefix' | 'prefix_except_default' | 'prefix_and_default'

const localesWithBaseUrl = [
  { code: 'en', iso: 'en-US' },
  { code: 'de', iso: 'de-DE', baseUrl: 'https://de.example.com' },
  { code: 'ru', iso: 'ru-RU', baseUrl: 'https://ru.example.com' },
  { code: 'fr', iso: 'fr-FR' },
] as PathStrategyContext['locales']

const globalLocaleRoutes = {
  '/about': { en: '/about-us', de: '/ueber-uns', ru: '/o-nas', fr: '/a-propos' },
  '/products': { en: '/products', de: '/produkte', ru: '/produkty', fr: '/produits' },
  'products-id': { en: '/products/:id', de: '/produkte/:id', ru: '/produkty/:id', fr: '/produits/:id' },
  '/parent/child': { en: '/parent-en/child', de: '/eltern/kind', ru: '/roditel/rebenok', fr: '/parent/enfant' },
  'parent-child': { en: '/parent-en/child', de: '/eltern/kind' },
  'unlocalized': false as const,
}

const routeLocales: Record<string, string[]> = {
  '/about': ['en', 'de', 'ru'],
  'about': ['en', 'de', 'ru'],
  'products-id': ['en', 'de'],
  'products': ['en', 'de'],
  'blog-slug': ['en'],
  'parent-child': ['en', 'de', 'ru'],
}

const routesLocaleLinks: Record<string, string> = {
  'products-id': 'products',
  'blog-slug': 'blog',
}

const routeNames = [
  'index',
  'about',
  'localized-about-en',
  'localized-about-de',
  'localized-about-ru',
  'localized-products-id-en',
  'localized-products-id-de',
  'localized-parent-child-en',
  'localized-parent-child-de',
  'localized-blog-slug-en',
]

const baseConfig: ModuleOptionsExtend = {
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  locales: localesWithBaseUrl,
  dateBuild: 0,
  hashMode: false,
  isSSG: false,
  apiBaseUrl: '',
  disablePageLocales: false,
}

function buildDeepContext(strategy: StrategyName): PathStrategyContext {
  return makePathStrategyContext(baseConfig, strategy, {
    locales: localesWithBaseUrl,
    globalLocaleRoutes,
    routeLocales,
    routesLocaleLinks,
    router: makeRouterAdapter(routeNames),
  })
}

const pathsToResolve = ['/', '/about', '/about-us', '/en/about', '/de/about', '/de/ueber-uns', '/ru/o-nas', '/products/1', '/parent/child', '/en/parent-en/child']

const targetLocales = ['en', 'de', 'ru', 'fr']

const currentRouteAbout: ResolvedRouteLike = {
  name: 'localized-about-en',
  path: '/about',
  fullPath: '/about',
  params: {},
  query: {},
  hash: '',
}

const currentRouteProducts: ResolvedRouteLike = {
  name: 'localized-products-id-en',
  path: '/products/1',
  fullPath: '/products/1',
  params: { id: '1' },
  query: {},
  hash: '',
}

const currentRouteWithQuery: ResolvedRouteLike = {
  name: 'localized-about-en',
  path: '/about',
  fullPath: '/about?tab=info#section',
  params: {},
  query: { tab: 'info' },
  hash: '#section',
}

function snapshotState(strategyName: StrategyName) {
  const strategy = createPathStrategy(buildDeepContext(strategyName))

  const resolveLocaleFromPath: Record<string, string | null> = {}
  for (const p of pathsToResolve) {
    resolveLocaleFromPath[p] = strategy.resolveLocaleFromPath(p)
  }

  const getLocaleFromPath: Record<string, string | null> = {}
  for (const p of pathsToResolve) {
    getLocaleFromPath[p] = strategy.getLocaleFromPath(p)
  }

  const getRedirect: Array<{ path: string, targetLocale: string, redirect: string | null }> = []
  for (const p of ['/', '/about', '/en/about', '/de/about', '/de/ueber-uns']) {
    for (const loc of targetLocales) {
      getRedirect.push({ path: p, targetLocale: loc, redirect: strategy.getRedirect(p, loc) })
    }
  }

  const localeRouteByPath: Record<string, Record<string, RouteLike>> = {}
  for (const loc of targetLocales) {
    localeRouteByPath[loc] = {}
    for (const p of ['/about', '/products/1', '/parent/child']) {
      localeRouteByPath[loc][p] = strategy.localeRoute(loc, p, currentRouteAbout)
    }
  }

  const localeRouteByName: Record<string, RouteLike> = {}
  for (const loc of targetLocales) {
    localeRouteByName[loc] = strategy.localeRoute(loc, { name: 'localized-about-en', path: '/about' }, currentRouteAbout)
  }

  const getSeoAbout = strategy.getSeoAttributes(currentRouteAbout)
  const getSeoProducts = strategy.getSeoAttributes(currentRouteProducts)
  const getSeoWithQuery = strategy.getSeoAttributes(currentRouteWithQuery)

  const switchFromEnToDe = strategy.switchLocaleRoute('en', 'de', currentRouteAbout, {})
  const switchWithParams = strategy.switchLocaleRoute('en', 'de', currentRouteProducts, {
    i18nRouteParams: { de: { id: '2' } },
  })

  const getCanonical: Record<string, string | null> = {}
  for (const loc of targetLocales) {
    getCanonical[loc] = strategy.getCanonicalPath(currentRouteAbout, loc)
  }

  return {
    resolveLocaleFromPath,
    getLocaleFromPath,
    getRedirect,
    localeRouteByPath,
    localeRouteByName,
    getSeoAbout,
    getSeoProducts,
    getSeoWithQuery,
    switchFromEnToDe,
    switchWithParams,
    getCanonical,
  }
}

describe('strategies deep snapshots (large configs, full state)', () => {
  test('no_prefix: full state', () => {
    expect(snapshotState('no_prefix')).toMatchSnapshot()
  })

  test('prefix: full state', () => {
    expect(snapshotState('prefix')).toMatchSnapshot()
  })

  test('prefix_except_default: full state', () => {
    expect(snapshotState('prefix_except_default')).toMatchSnapshot()
  })

  test('prefix_and_default: full state', () => {
    expect(snapshotState('prefix_and_default')).toMatchSnapshot()
  })
})

describe('strategies deep snapshots — no_prefix with noPrefixRedirect: false', () => {
  test('no_prefix noPrefixRedirect false: getRedirect and localeRoute', () => {
    const ctx = makePathStrategyContext(baseConfig, 'no_prefix', {
      locales: localesWithBaseUrl,
      globalLocaleRoutes,
      routeLocales,
      routesLocaleLinks,
      router: makeRouterAdapter(routeNames),
      noPrefixRedirect: false,
    })
    const strategy = createPathStrategy(ctx)
    const redirects = [
      { path: '/about', locale: 'en', redirect: strategy.getRedirect('/about', 'en') },
      { path: '/en/about', locale: 'en', redirect: strategy.getRedirect('/en/about', 'en') },
      { path: '/de/about', locale: 'de', redirect: strategy.getRedirect('/de/about', 'de') },
    ]
    const localeRoutes = {
      en: strategy.localeRoute('en', '/about', currentRouteAbout),
      de: strategy.localeRoute('de', '/about', currentRouteAbout),
    }
    expect({ redirects, localeRoutes }).toMatchSnapshot()
  })
})

describe('strategies deep snapshots — defaultLocale and two locales only', () => {
  const minimalLocales = [
    { code: 'en', iso: 'en-US' },
    { code: 'de', iso: 'de-DE' },
  ]
  const minimalConfig: ModuleOptionsExtend = {
    ...baseConfig,
    locales: minimalLocales as ModuleOptionsExtend['locales'],
  }

  test('prefix_except_default with two locales: state', () => {
    const ctx = makePathStrategyContext(minimalConfig, 'prefix_except_default', {
      locales: minimalLocales as PathStrategyContext['locales'],
      globalLocaleRoutes: { '/about': { en: '/about-us', de: '/ueber-uns' } },
      router: makeRouterAdapter(['localized-about-en', 'localized-about-de']),
    })
    const strategy = createPathStrategy(ctx)
    const resolveFromPath: Record<string, string | null> = {}
    for (const p of pathsToResolve.slice(0, 6)) {
      resolveFromPath[p] = strategy.resolveLocaleFromPath(p)
    }
    const redirects: Array<{ path: string, locale: string, redirect: string | null }> = []
    for (const p of ['/', '/about', '/de/about']) {
      for (const loc of ['en', 'de'] as const) {
        redirects.push({ path: p, locale: loc, redirect: strategy.getRedirect(p, loc) })
      }
    }
    const state = {
      resolveLocaleFromPath: resolveFromPath,
      getRedirect: redirects,
      localeRouteResult: {
        en: strategy.localeRoute('en', '/about', currentRouteAbout),
        de: strategy.localeRoute('de', '/about', currentRouteAbout),
      },
      seoResult: strategy.getSeoAttributes(currentRouteAbout),
      canonicalResult: { en: strategy.getCanonicalPath(currentRouteAbout, 'en'), de: strategy.getCanonicalPath(currentRouteAbout, 'de') },
    }
    expect(state).toMatchSnapshot()
  })
})
