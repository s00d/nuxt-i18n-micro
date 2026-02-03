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

const routeEn: ResolvedRouteLike = {
  name: 'localized-about-en',
  path: '/about',
  fullPath: '/about',
  params: {},
  query: {},
  hash: '',
}

describe('getCanonicalPath - prefix', () => {
  test('with globalLocaleRoutes: returns prefixed custom path', () => {
    const strategy = createPathStrategy(makeCtx('prefix', {
      globalLocaleRoutes: { '/about': { en: '/about-us', de: '/ueber-uns', ru: '/o-nas' } },
    }))
    const result = { en: strategy.getCanonicalPath(routeEn, 'en'), de: strategy.getCanonicalPath(routeEn, 'de') }
    expect(result.en).toBe('/en/about-us')
    expect(result.de).toBe('/de/ueber-uns')
    expect(result).toMatchSnapshot()
  })

  test('no globalLocaleRoutes for route: returns null', () => {
    const strategy = createPathStrategy(makeCtx('prefix'))
    const result = { en: strategy.getCanonicalPath(routeEn, 'en'), de: strategy.getCanonicalPath(routeEn, 'de') }
    expect(result.en).toBe(null)
    expect(result.de).toBe(null)
    expect(result).toMatchSnapshot()
  })
})

describe('getCanonicalPath - prefix_except_default', () => {
  test('with globalLocaleRoutes: default locale without prefix, others with prefix', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default', {
      globalLocaleRoutes: { '/about': { en: '/about-us', de: '/ueber-uns' } },
    }))
    const result = { en: strategy.getCanonicalPath(routeEn, 'en'), de: strategy.getCanonicalPath(routeEn, 'de') }
    expect(result.en).toBe('/about-us')
    expect(result.de).toBe('/de/ueber-uns')
    expect(result).toMatchSnapshot()
  })

  test('no globalLocaleRoutes: returns null', () => {
    const strategy = createPathStrategy(makeCtx('prefix_except_default'))
    const result = { en: strategy.getCanonicalPath(routeEn, 'en') }
    expect(result.en).toBe(null)
    expect(result).toMatchSnapshot()
  })
})

describe('getCanonicalPath - prefix_and_default', () => {
  test('with globalLocaleRoutes: all get prefix', () => {
    const strategy = createPathStrategy(makeCtx('prefix_and_default', {
      globalLocaleRoutes: { '/about': { de: '/ueber-uns' } },
    }))
    const result = { de: strategy.getCanonicalPath(routeEn, 'de') }
    expect(result.de).toBe('/de/ueber-uns')
    expect(result).toMatchSnapshot()
  })
})

describe('getCanonicalPath - no_prefix', () => {
  test('with globalLocaleRoutes: returns path without locale prefix', () => {
    const strategy = createPathStrategy(makeCtx('no_prefix', {
      globalLocaleRoutes: { '/about': { en: '/about-us', de: '/ueber-uns' } },
    }))
    const result = { en: strategy.getCanonicalPath(routeEn, 'en'), de: strategy.getCanonicalPath(routeEn, 'de') }
    expect(result.en).toBe('/about-us')
    expect(result.de).toBe('/ueber-uns')
    expect(result).toMatchSnapshot()
  })
})

describe('snapshots (documentation: how getCanonicalPath works per strategy)', () => {
  test('getCanonicalPath with globalLocaleRoutes: result per strategy and locale', () => {
    const gr = { '/about': { en: '/about-us', de: '/ueber-uns', ru: '/o-nas' } }
    const strategies = ['prefix', 'prefix_except_default', 'prefix_and_default', 'no_prefix'] as const
    const out: Record<string, { en: string | null, de: string | null, ru: string | null }> = {}
    for (const s of strategies) {
      const strategy = createPathStrategy(makeCtx(s, { globalLocaleRoutes: gr }))
      out[s] = {
        en: strategy.getCanonicalPath(routeEn, 'en'),
        de: strategy.getCanonicalPath(routeEn, 'de'),
        ru: strategy.getCanonicalPath(routeEn, 'ru'),
      }
    }
    expect(out).toMatchSnapshot()
  })
})
