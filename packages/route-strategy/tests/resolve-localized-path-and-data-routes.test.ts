import type { NuxtPage } from '@nuxt/schema'
import { RouteGenerator } from '../src/index'
import { createBasicPages, defaultLocaleCode, locales } from './helpers'

describe('RouteGenerator.resolveLocalizedPath', () => {
  test('no_prefix: returns path without locale prefix for any locale', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'no_prefix',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.resolveLocalizedPath('/about', 'en')).toBe('/about')
    expect(generator.resolveLocalizedPath('/about', 'de')).toBe('/about')
    expect(generator.resolveLocalizedPath('/about', 'ru')).toBe('/about')
    expect(generator.resolveLocalizedPath('/', 'de')).toBe('/')
  })

  test('prefix: always returns path with locale prefix', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.resolveLocalizedPath('/about', 'en')).toBe('/en/about')
    expect(generator.resolveLocalizedPath('/about', 'de')).toBe('/de/about')
    expect(generator.resolveLocalizedPath('/', 'de')).toBe('/de')
  })

  test('prefix_except_default: default locale without prefix, others with prefix', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.resolveLocalizedPath('/about', 'en')).toBe('/about')
    expect(generator.resolveLocalizedPath('/about', 'de')).toBe('/de/about')
    expect(generator.resolveLocalizedPath('/about', 'ru')).toBe('/ru/about')
    expect(generator.resolveLocalizedPath('/', 'en')).toBe('/')
    expect(generator.resolveLocalizedPath('/', 'de')).toBe('/de')
  })

  test('prefix_and_default: always returns path with locale prefix', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_and_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.resolveLocalizedPath('/about', 'en')).toBe('/en/about')
    expect(generator.resolveLocalizedPath('/about', 'de')).toBe('/de/about')
    expect(generator.resolveLocalizedPath('/', 'en')).toBe('/en')
  })

  test('uses custom path from globalLocaleRoutes when present', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {
        '/about': { en: '/about', de: '/ueber-uns', ru: '/o-nas' },
      },
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.resolveLocalizedPath('/about', 'en')).toBe('/about')
    expect(generator.resolveLocalizedPath('/about', 'de')).toBe('/de/ueber-uns')
    expect(generator.resolveLocalizedPath('/about', 'ru')).toBe('/ru/o-nas')
  })

  test('prefix + globalLocaleRoutes: custom path with prefix for all locales', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix',
      globalLocaleRoutes: {
        '/about': { en: '/about-us', de: '/ueber-uns', ru: '/o-nas' },
      },
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.resolveLocalizedPath('/about', 'en')).toBe('/en/about-us')
    expect(generator.resolveLocalizedPath('/about', 'de')).toBe('/de/ueber-uns')
    expect(generator.resolveLocalizedPath('/about', 'ru')).toBe('/ru/o-nas')
  })

  test('lookup by pathKey without leading slash (about same as /about)', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {
        about: { de: '/ueber-uns' },
      },
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.resolveLocalizedPath('/about', 'de')).toBe('/de/ueber-uns')
  })

  test('path without custom mapping uses normalized path', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {
        '/about': { de: '/ueber-uns' },
      },
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.resolveLocalizedPath('/contact', 'de')).toBe('/de/contact')
    expect(generator.resolveLocalizedPath('/contact', 'en')).toBe('/contact')
  })

  test('root path with prefix strategy', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.resolveLocalizedPath('/', 'en')).toBe('/en')
    expect(generator.resolveLocalizedPath('/', 'de')).toBe('/de')
  })
})

describe('RouteGenerator.generateDataRoutes', () => {
  const apiBaseUrl = '_locales'

  test('returns general data route for each locale', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const routes = generator.generateDataRoutes([], apiBaseUrl, true)
    expect(routes).toContain(`/${apiBaseUrl}/general/en/data.json`)
    expect(routes).toContain(`/${apiBaseUrl}/general/de/data.json`)
    expect(routes).toContain(`/${apiBaseUrl}/general/ru/data.json`)
    expect(routes).toHaveLength(3)
  })

  test('when disablePageLocales is false, includes per-page routes for each locale', () => {
    const pages: NuxtPage[] = [
      { path: '/', name: 'index', file: '/pages/index.vue' },
      { path: '/about', name: 'about', file: '/pages/about.vue' },
    ]
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const routes = generator.generateDataRoutes(pages, apiBaseUrl, false)
    expect(routes).toContain(`/${apiBaseUrl}/general/en/data.json`)
    expect(routes).toContain(`/${apiBaseUrl}/general/de/data.json`)
    expect(routes).toContain(`/${apiBaseUrl}/index/en/data.json`)
    expect(routes).toContain(`/${apiBaseUrl}/index/de/data.json`)
    expect(routes).toContain(`/${apiBaseUrl}/about/en/data.json`)
    expect(routes).toContain(`/${apiBaseUrl}/about/de/data.json`)
    expect(routes).toHaveLength(3 + 3 * 2) // 3 general + 3 locales * 2 pages
  })

  test('when disablePageLocales is true, only general routes', () => {
    const pages = createBasicPages()
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const routes = generator.generateDataRoutes(pages, apiBaseUrl, true)
    const generalCount = 3
    expect(routes).toHaveLength(generalCount)
    expect(routes.every((r) => r.includes('/general/'))).toBe(true)
  })

  test('skips pages without name', () => {
    const pages: NuxtPage[] = [
      { path: '/about', name: 'about', file: '/pages/about.vue' },
      { path: '/noname', file: '/pages/noname.vue' },
    ]
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const routes = generator.generateDataRoutes(pages, apiBaseUrl, false)
    expect(routes).toContain(`/${apiBaseUrl}/about/en/data.json`)
    expect(routes.filter((r) => r.includes('/noname/'))).toHaveLength(0)
    expect(routes).toHaveLength(3 + 3 * 1) // 3 general + 3 locales * 1 named page
  })

  test('uses resolved locales (disabled locales excluded)', () => {
    const generator = new RouteGenerator({
      locales: [...locales, { code: 'de', disabled: true }],
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const routes = generator.generateDataRoutes([], apiBaseUrl, true)
    expect(routes).toContain(`/${apiBaseUrl}/general/en/data.json`)
    expect(routes).toContain(`/${apiBaseUrl}/general/ru/data.json`)
    expect(routes).not.toContain(`/${apiBaseUrl}/general/de/data.json`)
    expect(routes).toHaveLength(2)
  })
})
