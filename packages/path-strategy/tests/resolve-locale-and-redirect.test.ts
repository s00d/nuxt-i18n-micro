import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike } from '../src'
import { createPathStrategy } from '../src'
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

function makeCtx(strategy: NonNullable<ModuleOptionsExtend['strategy']>, extra?: Partial<PathStrategyContext>): PathStrategyContext {
  return makePathStrategyContext(baseConfig, strategy, extra)
}

describe('getLocaleFromPath', () => {
  test('returns first segment when it is a locale code', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    expect(strategy.getLocaleFromPath('/en/about')).toBe('en')
    expect(strategy.getLocaleFromPath('/de/ueber-uns')).toBe('de')
    expect(strategy.getLocaleFromPath('/ru')).toBe('ru')
    const result = {
      '/en/about': strategy.getLocaleFromPath('/en/about'),
      '/de/ueber-uns': strategy.getLocaleFromPath('/de/ueber-uns'),
      '/ru': strategy.getLocaleFromPath('/ru'),
    }
    expect(result).toMatchSnapshot()
  })

  test('returns null for root or path without locale prefix', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    expect(strategy.getLocaleFromPath('/')).toBe(null)
    expect(strategy.getLocaleFromPath('/about')).toBe(null)
    const result = { '/': strategy.getLocaleFromPath('/'), '/about': strategy.getLocaleFromPath('/about') }
    expect(result).toMatchSnapshot()
  })

  test('strips query and hash before parsing', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    expect(strategy.getLocaleFromPath('/en/about?foo=1')).toBe('en')
    expect(strategy.getLocaleFromPath('/de/page#section')).toBe('de')
    const result = {
      withQuery: strategy.getLocaleFromPath('/en/about?foo=1'),
      withHash: strategy.getLocaleFromPath('/de/page#section'),
    }
    expect(result).toMatchSnapshot()
  })
})

describe('resolveLocaleFromPath', () => {
  test('prefix: first segment is locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    expect(strategy.resolveLocaleFromPath('/en/about')).toBe('en')
    expect(strategy.resolveLocaleFromPath('/')).toBe(null)
    expect(strategy.resolveLocaleFromPath('/about')).toBe(null)
    const result = {
      '/en/about': strategy.resolveLocaleFromPath('/en/about'),
      '/de/ueber-uns': strategy.resolveLocaleFromPath('/de/ueber-uns'),
      '/ru': strategy.resolveLocaleFromPath('/ru'),
      '/': strategy.resolveLocaleFromPath('/'),
      '/about': strategy.resolveLocaleFromPath('/about'),
    }
    expect(result).toMatchSnapshot()
  })

  test('prefix_except_default: first segment or default', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    expect(strategy.resolveLocaleFromPath('/about')).toBe('en')
    expect(strategy.resolveLocaleFromPath('/')).toBe('en')
    const result = {
      '/en/about': strategy.resolveLocaleFromPath('/en/about'),
      '/de/about': strategy.resolveLocaleFromPath('/de/about'),
      '/about': strategy.resolveLocaleFromPath('/about'),
      '/': strategy.resolveLocaleFromPath('/'),
    }
    expect(result).toMatchSnapshot()
  })

  test('no_prefix: cannot determine from path', () => {
    const strategy = createPathStrategy(makeCtx('no_prefix'))
    expect(strategy.resolveLocaleFromPath('/about')).toBe(null)
    const result = { '/about': strategy.resolveLocaleFromPath('/about'), '/en/about': strategy.resolveLocaleFromPath('/en/about') }
    expect(result).toMatchSnapshot()
  })

  test('prefix_and_default: first segment is locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix_and_default'))
    expect(strategy.resolveLocaleFromPath('/en/about')).toBe('en')
    expect(strategy.resolveLocaleFromPath('/about')).toBe(null)
    const result = { '/en/about': strategy.resolveLocaleFromPath('/en/about'), '/about': strategy.resolveLocaleFromPath('/about') }
    expect(result).toMatchSnapshot()
  })
})

describe('getRedirect', () => {
  test('prefix: root redirects to /locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    expect(strategy.getRedirect('/', 'en')).toBe('/en')
    expect(strategy.getRedirect('/en/about', 'en')).toBe(null)
    const result = {
      rootEn: strategy.getRedirect('/', 'en'),
      rootDe: strategy.getRedirect('/', 'de'),
      aboutEn: strategy.getRedirect('/about', 'en'),
      enAboutEn: strategy.getRedirect('/en/about', 'en'),
      deAboutDe: strategy.getRedirect('/de/about', 'de'),
    }
    expect(result).toMatchSnapshot()
  })

  test('prefix_except_default: default locale no prefix', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    expect(strategy.getRedirect('/', 'en')).toBe(null)
    expect(strategy.getRedirect('/en/about', 'en')).toBe('/about')
    expect(strategy.getRedirect('/about', 'de')).toBe('/de/about')
    const result = {
      rootEn: strategy.getRedirect('/', 'en'),
      aboutEn: strategy.getRedirect('/about', 'en'),
      enAboutToEn: strategy.getRedirect('/en/about', 'en'),
      aboutDe: strategy.getRedirect('/about', 'de'),
      deAboutDe: strategy.getRedirect('/de/about', 'de'),
    }
    expect(result).toMatchSnapshot()
  })

  test('no_prefix: no redirect when noPrefixRedirect is false', () => {
    const strategy = createPathStrategy(makeCtx('no_prefix', { noPrefixRedirect: false }))
    expect(strategy.getRedirect('/en/about', 'en')).toBe(null)
    const result = { aboutEn: strategy.getRedirect('/about', 'en'), enAboutEn: strategy.getRedirect('/en/about', 'en') }
    expect(result).toMatchSnapshot()
  })

  test('no_prefix: strips locale prefix when noPrefixRedirect is true (default)', () => {
    const strategy = createPathStrategy(makeCtx('no_prefix'))
    expect(strategy.getRedirect('/en/about', 'en')).toBe('/about')
    expect(strategy.getRedirect('/en', 'en')).toBe('/')
    const result = {
      enAboutEn: strategy.getRedirect('/en/about', 'en'),
      deUeberDe: strategy.getRedirect('/de/ueber-uns', 'de'),
      enRootEn: strategy.getRedirect('/en', 'en'),
    }
    expect(result).toMatchSnapshot()
  })

  test('prefix_and_default: root redirects to /locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix_and_default'))
    const result = { rootEn: strategy.getRedirect('/', 'en'), aboutDe: strategy.getRedirect('/about', 'de') }
    expect(result).toMatchSnapshot()
  })

  test('prefix_except_default: no redirect when path matches and only query/hash differs (hash preservation)', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const result = {
      withQueryHash: strategy.getRedirect('/de/news/2?search=vue&page=1#top', 'de'),
      withQuery: strategy.getRedirect('/de/news/2?search=vue&page=1', 'de'),
      withHash: strategy.getRedirect('/de/news/2#top', 'de'),
      pathOnly: strategy.getRedirect('/de/news/2', 'de'),
    }
    expect(result).toMatchSnapshot()
  })

  test('no circular redirect: second getRedirect on result returns null (idempotent)', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const redirect1 = strategy.getRedirect('/about', 'de')
    expect(redirect1).toBe('/de/about')
    const redirect2 = redirect1 ? strategy.getRedirect(redirect1, 'de') : null
    expect(redirect2).toBe(null)
    expect({ redirect1, redirect2 }).toMatchSnapshot()
  })

  test('no circular redirect: prefix strategy', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    const redirect1 = strategy.getRedirect('/about', 'en')
    expect(redirect1).toBe('/en/about')
    const redirect2 = redirect1 ? strategy.getRedirect(redirect1, 'en') : null
    expect(redirect2).toBe(null)
    expect({ redirect1, redirect2 }).toMatchSnapshot()
  })
})

describe('getSeoAttributes', () => {
  test('returns canonical and hreflangs', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const route = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {} as Record<string, unknown>,
      query: {} as Record<string, unknown>,
      hash: '',
    }
    const seo = strategy.getSeoAttributes(route)
    expect(seo.canonical).toBeDefined()
    expect(seo.hreflangs).toHaveLength(3)
    expect(seo.hreflangs!.every((t) => t.rel === 'alternate' && t.hreflang && t.href)).toBe(true)
    expect(seo).toMatchSnapshot()
  })

  test('respects routeLocales by path: only allowed locales get hreflang', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default', { routeLocales: { '/about': ['en', 'de'] } }))
    const route = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {} as Record<string, unknown>,
      query: {} as Record<string, unknown>,
      hash: '',
    }
    const seo = strategy.getSeoAttributes(route)
    expect(seo.hreflangs).toHaveLength(2)
    expect(seo.hreflangs!.map((t) => t.hreflang).sort()).toEqual(['de', 'en'])
    expect(strategy.getSeoAttributes(route)).toMatchSnapshot()
  })

  test('respects routeLocales by base name', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default', { routeLocales: { about: ['en', 'ru'] } }))
    const route = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {} as Record<string, unknown>,
      query: {} as Record<string, unknown>,
      hash: '',
    }
    const seo = strategy.getSeoAttributes(route)
    expect(seo.hreflangs!.map((t) => t.hreflang).sort()).toEqual(['en', 'ru'])
    expect(strategy.getSeoAttributes(route)).toMatchSnapshot()
  })

  test('respects routesLocaleLinks when resolving routeLocales key', () => {
    const strategy = createPathStrategy(
      makeCtx('prefix_except_default', {
        routesLocaleLinks: { 'products-id': 'products' },
        routeLocales: { products: ['en', 'de'] },
      }),
    )
    const route = {
      name: 'localized-products-id-en',
      path: '/en/products/1',
      fullPath: '/en/products/1',
      params: { id: '1' },
      query: {} as Record<string, unknown>,
      hash: '',
    }
    const seo = strategy.getSeoAttributes(route)
    expect(seo.hreflangs!.map((t) => t.hreflang).sort()).toEqual(['de', 'en'])
    expect(strategy.getSeoAttributes(route)).toMatchSnapshot()
  })

  test('no routeLocales: all locales in hreflangs', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const route = {
      name: 'localized-index-en',
      path: '/',
      fullPath: '/',
      params: {} as Record<string, unknown>,
      query: {} as Record<string, unknown>,
      hash: '',
    }
    const seo = strategy.getSeoAttributes(route)
    expect(seo.hreflangs).toHaveLength(3)
    expect(strategy.getSeoAttributes(route)).toMatchSnapshot()
  })

  test('no_prefix: returns canonical and hreflangs for all locales', () => {
    const strategy = createPathStrategy(makeCtx('no_prefix'))
    const route = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {} as Record<string, unknown>,
      query: {} as Record<string, unknown>,
      hash: '',
    }
    expect(strategy.getSeoAttributes(route)).toMatchSnapshot()
  })

  test('prefix: returns canonical and hreflangs with locale prefix in href', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    const route = {
      name: 'localized-about-en',
      path: '/en/about',
      fullPath: '/en/about',
      params: {} as Record<string, unknown>,
      query: {} as Record<string, unknown>,
      hash: '',
    }
    expect(strategy.getSeoAttributes(route)).toMatchSnapshot()
  })

  test('prefix_and_default: returns canonical and hreflangs', () => {
    const strategy = createPathStrategy(makeCtx('prefix_and_default'))
    const route = {
      name: 'localized-about-en',
      path: '/en/about',
      fullPath: '/en/about',
      params: {} as Record<string, unknown>,
      query: {} as Record<string, unknown>,
      hash: '',
    }
    expect(strategy.getSeoAttributes(route)).toMatchSnapshot()
  })

  test('routesLocaleLinks with multiple keys: each linked name used for routeLocales lookup', () => {
    const strategy = createPathStrategy(
      makeCtx('prefix_except_default', {
        routesLocaleLinks: { 'products-id': 'products', 'blog-slug': 'blog', 'news-id': 'news' },
        routeLocales: { products: ['en', 'de'], blog: ['en'], news: ['en', 'de', 'ru'] },
      }),
    )
    const routeNews: ResolvedRouteLike = {
      name: 'localized-news-id-en',
      path: '/news/1',
      fullPath: '/news/1',
      params: { id: '1' },
      query: {},
      hash: '',
    }
    expect(strategy.getSeoAttributes(routeNews)).toMatchSnapshot()
  })

  test('getSeoAttributes with baseUrl: canonical and hreflang href include baseUrl when locale has baseUrl', () => {
    const localesWithBase = [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE', baseUrl: 'https://de.example.com' },
    ]
    const strategy = createPathStrategy(makeCtx('prefix_except_default', { locales: localesWithBase as PathStrategyContext['locales'] }))
    const route = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {} as Record<string, unknown>,
      query: {} as Record<string, unknown>,
      hash: '',
    }
    expect(strategy.getSeoAttributes(route)).toMatchSnapshot()
  })
})

describe('snapshots (documentation: how resolveLocaleFromPath, getRedirect, getSeoAttributes work)', () => {
  test('resolveLocaleFromPath: result per strategy for set of paths', () => {
    const paths = ['/', '/about', '/en/about', '/de/about', '/de/ueber-uns']
    const strategies = ['no_prefix', 'prefix', 'prefix_except_default', 'prefix_and_default'] as const
    const out: Record<string, Record<string, string | null>> = {}
    for (const s of strategies) {
      const strategy = createPathStrategy(makeCtx(s))
      out[s] = {}
      for (const p of paths) {
        out[s][p] = strategy.resolveLocaleFromPath(p)
      }
    }
    expect(out).toMatchSnapshot()
  })

  test('getRedirect: path and target locale → where to redirect (null = no redirect)', () => {
    const cases: Array<{ path: string; targetLocale: string; strategy: NonNullable<ModuleOptionsExtend['strategy']> }> = [
      { path: '/', targetLocale: 'en', strategy: 'prefix' },
      { path: '/', targetLocale: 'en', strategy: 'prefix_except_default' },
      { path: '/about', targetLocale: 'de', strategy: 'prefix_except_default' },
      { path: '/en/about', targetLocale: 'en', strategy: 'prefix_except_default' },
      { path: '/en/about', targetLocale: 'en', strategy: 'no_prefix' },
      { path: '/de/about', targetLocale: 'de', strategy: 'prefix_except_default' },
    ]
    const out = cases.map(({ path, targetLocale, strategy }) => {
      const s = createPathStrategy(makeCtx(strategy))
      return { path, targetLocale, strategy, redirect: s.getRedirect(path, targetLocale) }
    })
    expect(out).toMatchSnapshot()
  })

  test('getSeoAttributes: canonical and hreflangs for /about page (prefix_except_default)', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const route = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {} as Record<string, unknown>,
      query: {} as Record<string, unknown>,
      hash: '',
    }
    const seo = strategy.getSeoAttributes(route)
    expect(seo).toMatchSnapshot()
  })

  test('getSeoAttributes with routeLocales: only en and de in hreflangs', () => {
    const strategy = createPathStrategy(
      makeCtx('prefix_except_default', {
        routeLocales: { '/about': ['en', 'de'] },
      }),
    )
    const route = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {} as Record<string, unknown>,
      query: {} as Record<string, unknown>,
      hash: '',
    }
    const seo = strategy.getSeoAttributes(route)
    expect(seo).toMatchSnapshot()
  })

  test('getSeoAttributes with routesLocaleLinks: products-id → products for routeLocales', () => {
    const strategy = createPathStrategy(
      makeCtx('prefix_except_default', {
        routesLocaleLinks: { 'products-id': 'products' },
        routeLocales: { products: ['en', 'de'] },
      }),
    )
    const route: ResolvedRouteLike = {
      name: 'localized-products-id-en',
      path: '/products/1',
      fullPath: '/products/1',
      params: { id: '1' },
      query: {},
      hash: '',
    }
    const seo = strategy.getSeoAttributes(route)
    expect(seo).toMatchSnapshot()
  })
})
