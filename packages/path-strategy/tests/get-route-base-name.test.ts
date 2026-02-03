import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { ResolvedRouteLike } from '../src'
import { getRouteBaseName, PrefixExceptDefaultPathStrategy, NoPrefixPathStrategy, PrefixPathStrategy } from '../src'
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

const locales = baseConfig.locales!

describe('getRouteBaseName (utility)', () => {
  test('strips localized prefix and locale suffix', () => {
    const result = {
      localizedAboutEn: getRouteBaseName({ name: 'localized-about-en', path: '/about' }, { locales }),
      localizedAboutDe: getRouteBaseName({ name: 'localized-about-de' }, { locales }),
      localizedProductsIdRu: getRouteBaseName({ name: 'localized-products-id-ru' }, { locales }),
    }
    expect(result.localizedAboutEn).toBe('about')
    expect(result.localizedAboutDe).toBe('about')
    expect(result.localizedProductsIdRu).toBe('products-id')
    expect(result).toMatchSnapshot()
  })

  test('name without prefix: strips only locale suffix', () => {
    const result = getRouteBaseName({ name: 'about-en' }, { locales })
    expect(result).toBe('about')
    expect(result).toMatchSnapshot()
  })

  test('name without locale suffix: returns as-is after removing prefix', () => {
    const result = {
      localizedAbout: getRouteBaseName({ name: 'localized-about' }, { locales }),
      about: getRouteBaseName({ name: 'about' }, { locales }),
    }
    expect(result.localizedAbout).toBe('about')
    expect(result.about).toBe('about')
    expect(result).toMatchSnapshot()
  })

  test('custom localizedRouteNamePrefix', () => {
    const result = getRouteBaseName(
      { name: 'i18n-about-en' },
      { locales, localizedRouteNamePrefix: 'i18n-' },
    )
    expect(result).toBe('about')
    expect(result).toMatchSnapshot()
  })

  test('returns null when name is null/undefined', () => {
    const result = {
      nameNull: getRouteBaseName({ name: null, path: '/x' }, { locales }),
      noName: getRouteBaseName({ path: '/x' }, { locales }),
    }
    expect(result.nameNull).toBe(null)
    expect(result.noName).toBe(null)
    expect(result).toMatchSnapshot()
  })

  test('does not strip -en when it is part of a word (product-screen)', () => {
    const result = {
      localizedProductScreenEn: getRouteBaseName({ name: 'localized-product-screen-en' }, { locales }),
      productScreen: getRouteBaseName({ name: 'product-screen' }, { locales }),
    }
    expect(result.localizedProductScreenEn).toBe('product-screen')
    expect(result.productScreen).toBe('product-screen')
    expect(result).toMatchSnapshot()
  })

  test('longer locale checked first: en-US before en', () => {
    const localesEnUS = [
      { code: 'en', iso: 'en' },
      { code: 'en-US', iso: 'en-US' },
    ]
    const result = {
      homeEnUS: getRouteBaseName({ name: 'localized-home-en-US' }, { locales: localesEnUS }),
      homeEn: getRouteBaseName({ name: 'localized-home-en' }, { locales: localesEnUS }),
    }
    expect(result.homeEnUS).toBe('home')
    expect(result.homeEn).toBe('home')
    expect(result).toMatchSnapshot()
  })
})

describe('getRouteBaseName (strategy method)', () => {
  test('PrefixExceptDefaultPathStrategy returns base name', () => {
    const strategy = new PrefixExceptDefaultPathStrategy(makePathStrategyContext(baseConfig, 'prefix_except_default'))
    const route: ResolvedRouteLike = {
      name: 'localized-about-de',
      path: '/de/about',
      fullPath: '/de/about',
      params: {},
      query: {},
      hash: '',
    }
    const result = strategy.getRouteBaseName(route)
    expect(result).toBe('about')
    expect(result).toMatchSnapshot()
  })

  test('NoPrefixPathStrategy returns base name', () => {
    const strategy = new NoPrefixPathStrategy(makePathStrategyContext(baseConfig, 'no_prefix'))
    const result = strategy.getRouteBaseName({ name: 'localized-contact-en' })
    expect(result).toBe('contact')
    expect(result).toMatchSnapshot()
  })

  test('custom localizedRouteNamePrefix in context', () => {
    const strategy = new PrefixPathStrategy(makePathStrategyContext(baseConfig, 'prefix', {
      localizedRouteNamePrefix: 'i18n-',
    }))
    const result = strategy.getRouteBaseName({ name: 'i18n-about-en' })
    expect(result).toBe('about')
    expect(result).toMatchSnapshot()
  })
})

describe('snapshots (documentation: how getRouteBaseName works)', () => {
  test('getRouteBaseName: result for set of route names', () => {
    const names = [
      'localized-about-en',
      'localized-about-de',
      'localized-products-id-ru',
      'localized-index-en',
      'about',
      'localized-product-screen-en',
    ]
    const out: Record<string, string | null> = {}
    for (const name of names) {
      out[name] = getRouteBaseName({ name }, { locales })
    }
    expect(out).toMatchSnapshot()
  })
})
