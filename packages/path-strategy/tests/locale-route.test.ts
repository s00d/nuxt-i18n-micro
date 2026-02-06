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

const currentRoute: ResolvedRouteLike = {
  name: 'localized-about-en',
  path: '/about',
  fullPath: '/about',
  params: {},
  query: {},
  hash: '',
}

describe('localeRoute - no_prefix', () => {
  test('string path: returns path as-is (no prefix)', () => {
    const strategy = createPathStrategy(makeCtx('no_prefix'))
    const result = { en: strategy.localeRoute('en', '/about', currentRoute), de: strategy.localeRoute('de', '/about', currentRoute) }
    expect(result.en.path).toBe('/about')
    expect(result.de.path).toBe('/about')
    expect(result).toMatchSnapshot()
  })

  test('{ name: "index" } returns root path /', () => {
    const router = makeRouterAdapter(['index', 'page', 'localized-page-de'])
    const strategy = createPathStrategy(makeCtx('no_prefix', { router }))
    const result = { en: strategy.localeRoute('en', { name: 'index' }), de: strategy.localeRoute('de', { name: 'index' }) }
    expect(result.en.path).toBe('/')
    expect(result.de.path).toBe('/')
    expect(result).toMatchSnapshot()
  })

  test('object with name: returns route with localized name when router has it', () => {
    const router = makeRouterAdapter(['localized-about-en', 'localized-about-de', 'localized-about-ru'])
    const strategy = createPathStrategy(makeCtx('no_prefix', { router }))
    const result = strategy.localeRoute('de', { name: 'localized-about-en', path: '/about' }, currentRoute)
    expect(result.name).toBe('localized-about-de')
    expect(result).toMatchSnapshot()
  })
})

describe('localeRoute - prefix', () => {
  test('string path: adds locale prefix', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    const result = { en: strategy.localeRoute('en', '/about', currentRoute), de: strategy.localeRoute('de', '/about', currentRoute) }
    expect(result.en.path).toBe('/en/about')
    expect(result.de.path).toBe('/de/about')
    expect(result).toMatchSnapshot()
  })

  test('{ name: "index" } returns localized root path', () => {
    const router = makeRouterAdapter(['index', 'localized-index', 'localized-index-de'])
    // Override resolve to return correct path for localized-index-de
    const originalResolve = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = originalResolve(to) as ResolvedRouteLike
      if (r.name === 'localized-index-de') {
        return { ...r, path: '/de', fullPath: '/de' }
      }
      return r
    }
    const strategy = createPathStrategy(makeCtx('prefix', { router }))
    const result = strategy.localeRoute('de', { name: 'index' })
    expect(result.path).toBe('/de')
    // When route exists with locale suffix, name is preserved
    expect(result.name).toBe('localized-index-de')
    expect(result).toMatchSnapshot()
  })

  test('object with name: returns route with correct name', () => {
    const router = makeRouterAdapter(['about', 'localized-about-en', 'localized-about-de', 'localized-about-ru'])
    const strategy = createPathStrategy(makeCtx('prefix', { router }))
    const result = {
      en: strategy.localeRoute('en', { name: 'localized-about-de', path: '/de/about' }, currentRoute),
      de: strategy.localeRoute('de', { name: 'about', path: '/about' }, currentRoute),
    }
    expect(result.en.name).toBe('localized-about-en')
    expect(result.de.name).toBe('localized-about-de')
    expect(result).toMatchSnapshot()
  })

  test('with globalLocaleRoutes: uses custom path for locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix', {
      globalLocaleRoutes: { '/about': { en: '/about-us', de: '/ueber-uns', ru: '/o-nas' } },
    }))
    const result = { en: strategy.localeRoute('en', '/about', currentRoute), de: strategy.localeRoute('de', '/about', currentRoute) }
    expect(result.en.path).toBe('/en/about-us')
    expect(result.de.path).toBe('/de/ueber-uns')
    expect(result).toMatchSnapshot()
  })
})

describe('localeRoute - prefix_except_default', () => {
  test('string path: default locale no prefix, others have prefix', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const result = { en: strategy.localeRoute('en', '/about', currentRoute), de: strategy.localeRoute('de', '/about', currentRoute) }
    expect(result.en.path).toBe('/about')
    expect(result.de.path).toBe('/de/about')
    expect(result).toMatchSnapshot()
  })

  test('{ name: "index" } returns root path for target locale (not current page path)', () => {
    const router = makeRouterAdapter(['index', 'page', 'localized-page-de'])
    const strategy = createPathStrategy(makeCtx('prefix_except_default', { router }))
    const currentOnPage: ResolvedRouteLike = {
      name: 'localized-page-de',
      path: '/de/page',
      fullPath: '/de/page',
      params: {},
      query: {},
      hash: '',
    }
    const result = strategy.localeRoute('de', { name: 'index' }, currentOnPage)
    expect(result).toMatchSnapshot()
  })

  test('{ name: "index" } default locale returns / (no prefix)', () => {
    const router = makeRouterAdapter(['index', 'page', 'localized-page-de'])
    const strategy = createPathStrategy(makeCtx('prefix_except_default', { router }))
    const result = strategy.localeRoute('en', { name: 'index' })
    expect(result.path).toBe('/')
    expect(result).toMatchSnapshot()
  })

  test('with globalLocaleRoutes: custom paths per locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default', {
      globalLocaleRoutes: { '/about': { en: '/about-us', de: '/ueber-uns' } },
    }))
    const result = { en: strategy.localeRoute('en', '/about', currentRoute), de: strategy.localeRoute('de', '/about', currentRoute) }
    expect(result.en.path).toBe('/about-us')
    expect(result.de.path).toBe('/de/ueber-uns')
    expect(result).toMatchSnapshot()
  })

  test('object with name: returns route with correct name', () => {
    const router = makeRouterAdapter(['about', 'localized-about-de', 'localized-about-ru'])
    const strategy = createPathStrategy(makeCtx('prefix_except_default', { router }))
    const result = {
      en: strategy.localeRoute('en', { name: 'localized-about-de', path: '/de/about' }, currentRoute),
      de: strategy.localeRoute('de', { name: 'about', path: '/about' }, currentRoute),
    }
    expect(result.en.name).toBe('about')
    expect(result.de.name).toBe('localized-about-de')
    expect(result).toMatchSnapshot()
  })
})

describe('localeRoute - prefix_and_default', () => {
  test('string path: all locales get prefix', () => {
    const strategy = createPathStrategy(makeCtx('prefix_and_default'))
    const result = { en: strategy.localeRoute('en', '/about', currentRoute), de: strategy.localeRoute('de', '/about', currentRoute) }
    expect(result.en.path).toBe('/en/about')
    expect(result.de.path).toBe('/de/about')
    expect(result).toMatchSnapshot()
  })

  test('{ name: "index" } returns localized root path for each locale', () => {
    const router = makeRouterAdapter(['index', 'page', 'localized-page-de'])
    const strategy = createPathStrategy(makeCtx('prefix_and_default', { router }))
    const result = { en: strategy.localeRoute('en', { name: 'index' }), de: strategy.localeRoute('de', { name: 'index' }) }
    expect(result).toMatchSnapshot()
  })

  test('object with name: returns route with correct name', () => {
    const router = makeRouterAdapter(['about', 'localized-about-en', 'localized-about-de', 'localized-about-ru'])
    const strategy = createPathStrategy(makeCtx('prefix_and_default', { router }))
    const result = {
      en: strategy.localeRoute('en', { name: 'localized-about-de', path: '/de/about' }, currentRoute),
      de: strategy.localeRoute('de', { name: 'about', path: '/about' }, currentRoute),
    }
    expect(result).toMatchSnapshot()
  })

  test('with globalLocaleRoutes: custom path with prefix', () => {
    const strategy = createPathStrategy(makeCtx('prefix_and_default', { globalLocaleRoutes: { '/about': { de: '/ueber-uns' } } }))
    const result = strategy.localeRoute('de', '/about', currentRoute)
    expect(result.path).toBe('/de/ueber-uns')
    expect(result).toMatchSnapshot()
  })

  test('with globalLocaleRoutes unlocalized: false returns path without locale prefix', () => {
    const strategy = createPathStrategy(makeCtx('prefix_and_default', {
      globalLocaleRoutes: { unlocalized: false, page2: { en: '/custom-page2-en', de: '/custom-page2-de' } },
    }))
    const result = { en: strategy.localeRoute('en', { name: 'unlocalized' }), de: strategy.localeRoute('de', { name: 'unlocalized' }) }
    expect(result).toMatchSnapshot()
  })
})

describe('snapshots (documentation: how localeRoute works per strategy)', () => {
  test('localeRoute: path /about per strategy and locale en/de', () => {
    const strategies = ['no_prefix', 'prefix', 'prefix_except_default', 'prefix_and_default'] as const
    const currentRoute: ResolvedRouteLike = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {},
      query: {},
      hash: '',
    }
    const out: Record<string, { en: RouteLike, de: RouteLike }> = {}
    for (const s of strategies) {
      const strategy = createPathStrategy(makeCtx(s))
      out[s] = {
        en: strategy.localeRoute('en', '/about', currentRoute),
        de: strategy.localeRoute('de', '/about', currentRoute),
      }
    }
    expect(out).toMatchSnapshot()
  })

  test('localeRoute: object with name and path returns RouteLike with path/fullPath', () => {
    const router = makeRouterAdapter(['localized-about-en', 'localized-about-de'])
    const strategy = createPathStrategy(makeCtx('prefix_except_default', { router }))
    const currentRoute: ResolvedRouteLike = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {},
      query: {},
      hash: '',
    }
    const resultEn = strategy.localeRoute('en', { name: 'localized-about-en', path: '/about' }, currentRoute)
    const resultDe = strategy.localeRoute('de', { name: 'localized-about-en', path: '/about' }, currentRoute)
    expect({ resultEn, resultDe }).toMatchSnapshot()
  })

  test('localeRoute with globalLocaleRoutes: custom paths per locale', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default', {
      globalLocaleRoutes: { '/about': { en: '/about-us', de: '/ueber-uns', ru: '/o-nas' } },
    }))
    const currentRoute: ResolvedRouteLike = {
      name: 'localized-about-en',
      path: '/about',
      fullPath: '/about',
      params: {},
      query: {},
      hash: '',
    }
    const out = {
      en: strategy.localeRoute('en', '/about', currentRoute),
      de: strategy.localeRoute('de', '/about', currentRoute),
      ru: strategy.localeRoute('ru', '/about', currentRoute),
    }
    expect(out).toMatchSnapshot()
  })
})
