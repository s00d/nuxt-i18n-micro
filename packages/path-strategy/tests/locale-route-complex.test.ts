/**
 * Complex path-strategy scenarios: baseUrl, buildPathFromBaseNameAndParams,
 * nested globalLocaleRoutes, i18nRouteParams.
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike } from '../src'
import { createPathStrategy } from '../src'
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

describe('localeRoute with baseUrl', () => {
  test('localeRoute applies baseUrl when locale has baseUrl', () => {
    const localesWithBase = [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE', baseUrl: 'https://de.example.com' },
      { code: 'ru', iso: 'ru-RU', baseUrl: 'https://ru.example.com/' },
    ]
    const strategy = createPathStrategy(
      makeCtx('prefix_except_default', {
        locales: localesWithBase as PathStrategyContext['locales'],
      }),
    )
    const current: ResolvedRouteLike = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {},
      query: {},
      hash: '',
    }
    const result = {
      en: strategy.localeRoute('en', '/about', current),
      de: strategy.localeRoute('de', '/about', current),
      ru: strategy.localeRoute('ru', '/about', current),
    }
    expect(result).toMatchSnapshot()
  })
})

describe('buildPathFromBaseNameAndParams (router does not have route)', () => {
  test('prefix_except_default: route with params, path from resolved route when router returns path', () => {
    const router = makeRouterAdapter(['localized-products-id-en'])
    const strategy = createPathStrategy(makeCtx('prefix_except_default', { router }))
    const current: ResolvedRouteLike = {
      name: 'localized-products-id-en',
      path: '/products/1',
      fullPath: '/products/1',
      params: { id: '1' },
      query: {},
      hash: '',
    }
    const result = strategy.localeRoute('de', { name: 'localized-products-id-en', path: '/products/1', params: { id: '1' } }, current)
    expect(result).toMatchSnapshot()
  })

  test('prefix_except_default: when source has no path and router throws on base name resolve, path built from baseName+params', () => {
    const router = makeRouterAdapter(['localized-products-id-en'], { throwOnUnknownName: true })
    const strategy = createPathStrategy(makeCtx('prefix_except_default', { router }))
    const current: ResolvedRouteLike = {
      name: 'localized-products-id-en',
      path: '/',
      fullPath: '/',
      params: { id: '1' },
      query: {},
      hash: '',
    }
    const result = strategy.localeRoute('de', { name: 'localized-products-id-en', params: { id: '1' } }, current)
    expect(result).toMatchSnapshot()
  })

  test('prefix: route name test-id with param id, router throws → hyphen form path test-:id', () => {
    const router = makeRouterAdapter(['localized-test-id-en'], { throwOnUnknownName: true })
    const strategy = createPathStrategy(makeCtx('prefix', { router }))
    const current: ResolvedRouteLike = {
      name: 'localized-test-id-en',
      path: '/test/42',
      fullPath: '/test/42',
      params: { id: '42' },
      query: {},
      hash: '',
    }
    const result = strategy.localeRoute('de', { name: 'localized-test-id-en', params: { id: '42' } }, current)
    expect(result).toMatchSnapshot()
  })
})

describe('nested globalLocaleRoutes (parent key)', () => {
  test('prefix_except_default: nested route uses full path from globalLocaleRoutes when key matches path', () => {
    const strategy = createPathStrategy(
      makeCtx('prefix_except_default', {
        globalLocaleRoutes: {
          '/parent/child': { en: '/parent-en/child', de: '/eltern/kind' },
        },
      }),
    )
    const current: ResolvedRouteLike = {
      name: 'localized-parent-child-en',
      path: '/parent/child',
      fullPath: '/parent/child',
      params: {},
      query: {},
      hash: '',
    }
    const result = {
      en: strategy.localeRoute('en', '/parent/child', current),
      de: strategy.localeRoute('de', '/parent/child', current),
    }
    expect(result).toMatchSnapshot()
  })
})

describe('switchLocaleRoute with i18nRouteParams', () => {
  test('i18nRouteParams override and extend params for target locale', () => {
    const router = makeRouterAdapter(['localized-products-id-en', 'localized-products-id-de'])
    router.resolve = (to: RouteLike | string) => {
      if (typeof to === 'string') {
        return { name: to, path: to, fullPath: to, params: {}, query: {}, hash: '' }
      }
      const r = to as RouteLike
      const name = r.name?.toString() ?? ''
      const id = (r.params?.id ?? '') as string
      const path = name ? `/products/${id}` : (r.path ?? '/')
      return {
        name: r.name ?? null,
        path,
        fullPath: path,
        params: r.params ?? {},
        query: r.query ?? {},
        hash: r.hash ?? '',
      }
    }
    const strategy = createPathStrategy(makeCtx('prefix_except_default', { router }))
    const route: ResolvedRouteLike = {
      name: 'localized-products-id-en',
      path: '/products/1',
      fullPath: '/products/1',
      params: { id: '1' },
      query: {},
      hash: '',
    }
    const result = strategy.switchLocaleRoute('en', 'de', route, {
      i18nRouteParams: { de: { id: '2', slug: 'product-2' } },
    }) as RouteLike
    expect(result).toMatchSnapshot()
  })
})

describe('localeRoute with query and hash preserved when using baseUrl', () => {
  test('applyBaseUrl on RouteLike preserves query and hash in fullPath', () => {
    const localesWithBase = [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE', baseUrl: 'https://de.example.com' },
    ]
    const strategy = createPathStrategy(
      makeCtx('prefix_except_default', {
        locales: localesWithBase as PathStrategyContext['locales'],
      }),
    )
    const current: ResolvedRouteLike = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about?tab=info#section',
      params: {},
      query: { tab: 'info' },
      hash: '#section',
    }
    const result = strategy.localeRoute('de', { name: 'localized-about-en', path: '/de/about', query: { tab: 'info' }, hash: '#section' }, current)
    expect(result).toMatchSnapshot()
  })
})

describe('getRedirect edge cases for all strategies', () => {
  test('no_prefix: no redirect for path without locale segment', () => {
    const strategy = createPathStrategy(makeCtx('no_prefix'))
    const result = { aboutEn: strategy.getRedirect('/about', 'en'), productsDe: strategy.getRedirect('/products/1', 'de') }
    expect(result).toMatchSnapshot()
  })

  test('prefix: redirect root to /locale for every locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    const result = { rootEn: strategy.getRedirect('/', 'en'), rootRu: strategy.getRedirect('/', 'ru') }
    expect(result).toMatchSnapshot()
  })

  test('prefix_and_default: redirect / to /en, /about to /de/about', () => {
    const strategy = createPathStrategy(makeCtx('prefix_and_default'))
    const result = {
      rootEn: strategy.getRedirect('/', 'en'),
      aboutDe: strategy.getRedirect('/about', 'de'),
      enAboutEn: strategy.getRedirect('/en/about', 'en'),
    }
    expect(result).toMatchSnapshot()
  })

  test('prefix_except_default: redirect /de to /en, /de/about to /en/about when target is default locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const result = { deToEn: strategy.getRedirect('/de', 'en'), deAboutToEn: strategy.getRedirect('/de/about', 'en') }
    expect(result).toMatchSnapshot()
  })
})

describe('snapshots (documentation: baseUrl, routesLocaleLinks, switchLocaleRoute)', () => {
  test('localeRoute with baseUrl: path per locale with baseUrl', () => {
    const localesWithBase = [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE', baseUrl: 'https://de.example.com' },
      { code: 'ru', iso: 'ru-RU', baseUrl: 'https://ru.example.com/' },
    ]
    const strategy = createPathStrategy(
      makeCtx('prefix_except_default', {
        locales: localesWithBase as PathStrategyContext['locales'],
      }),
    )
    const current: ResolvedRouteLike = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {},
      query: {},
      hash: '',
    }
    const out = {
      en: strategy.localeRoute('en', '/about', current),
      de: strategy.localeRoute('de', '/about', current),
      ru: strategy.localeRoute('ru', '/about', current),
    }
    expect(out).toMatchSnapshot()
  })

  test('switchLocaleRoute with i18nRouteParams: merged params result', () => {
    const router = makeRouterAdapter(['localized-products-id-en', 'localized-products-id-de'])
    router.resolve = (to: RouteLike | string) => {
      if (typeof to === 'string') {
        return { name: to, path: to, fullPath: to, params: {}, query: {}, hash: '' }
      }
      const r = to as RouteLike
      const name = r.name?.toString() ?? ''
      const id = (r.params?.id ?? '') as string
      const path = name ? `/products/${id}` : (r.path ?? '/')
      return {
        name: r.name ?? null,
        path,
        fullPath: path,
        params: r.params ?? {},
        query: r.query ?? {},
        hash: r.hash ?? '',
      }
    }
    const strategy = createPathStrategy(makeCtx('prefix_except_default', { router }))
    const route: ResolvedRouteLike = {
      name: 'localized-products-id-en',
      path: '/products/1',
      fullPath: '/products/1',
      params: { id: '1' },
      query: {},
      hash: '',
    }
    const result = strategy.switchLocaleRoute('en', 'de', route, {
      i18nRouteParams: { de: { id: '2', slug: 'product-2' } },
    })
    expect(result).toMatchSnapshot()
  })
})
