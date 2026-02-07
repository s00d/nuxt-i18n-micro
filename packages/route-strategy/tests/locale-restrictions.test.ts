import type { Locale } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'
import { RouteGenerator } from '../src/index'
import { defaultLocaleCode, locales } from './helpers'

describe('RouteGenerator - Locale restrictions ($defineI18nRoute)', () => {
  test('should respect locale restrictions from $defineI18nRoute - locales only', () => {
    const routeLocales = { '/test': ['en'] }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales,
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should respect locale restrictions from $defineI18nRoute - multiple locales', () => {
    const routeLocales = { '/test': ['en', 'de'] }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales,
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle localeRoutes from $defineI18nRoute correctly', () => {
    const globalLocaleRoutes = {
      '/test': {
        en: '/custom-test-en',
        de: '/custom-test-de',
      },
    }

    const routeLocales = { '/test': ['en', 'de'] }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes,
      routeLocales,
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle nested routes with localeRoutes from $defineI18nRoute', () => {
    const globalLocaleRoutes = {
      '/activity-locale': {
        en: '/change-activity',
        de: '/change-buchen',
      },
      '/activity-locale/skiing': {
        en: '/book-activity/skiing',
        de: '/aktivitaet-buchen/ski-fahren',
      },
    }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes,
      routeLocales: {},
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [
      {
        path: '/activity-locale',
        name: 'activity-locale',
        children: [{ path: 'skiing', name: 'activity-locale-skiing' }],
      },
    ]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('undefault fixture: activity + activity/skiing-locale with keys without leading slash (module-style)', () => {
    const globalLocaleRoutes = {
      'activity/skiing-locale': {
        en: '/book-activity/skiing',
        de: '/aktivitaet-buchen/ski-fahren',
      },
      'activity/hiking-locale': {
        en: '/book-activity/hiking',
        de: '/aktivitaet-buchen/wandern',
      },
      'activity-locale': {
        en: '/change-activity',
        de: '/change-buchen',
      },
    }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes,
      routeLocales: {},
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [
      {
        path: '/activity',
        name: 'activity',
        children: [
          { path: 'skiing', name: 'activity-skiing' },
          { path: 'skiing-locale', name: 'activity-skiing-locale' },
          { path: 'hiking', name: 'activity-hiking' },
          { path: 'hiking-locale', name: 'activity-hiking-locale' },
        ],
      },
    ]

    generator.extendPages(pages)

    const defaultRoute = pages.find((p) => p.name === 'activity' && !String(p.name).startsWith('localized-'))
    expect(defaultRoute).toBeDefined()
    expect(defaultRoute!.path).toBe('/activity')

    const defaultSkiingLocale = defaultRoute!.children?.find((c) => c.name === 'activity-skiing-locale')
    expect(defaultSkiingLocale).toBeDefined()
    expect(defaultSkiingLocale!.path).toBe('book-activity/skiing')

    const defaultHikingLocale = defaultRoute!.children?.find((c) => c.name === 'activity-hiking-locale')
    expect(defaultHikingLocale).toBeDefined()
    expect(defaultHikingLocale!.path).toBe('book-activity/hiking')

    expect(pages).toMatchSnapshot()
  })

  test('should handle locale restrictions with custom paths correctly', () => {
    const globalLocaleRoutes = {
      '/test': {
        en: '/custom-test-en',
        de: '/custom-test-de',
        ru: '/custom-test-ru',
      },
    }

    const routeLocales = { '/test': ['en', 'de'] }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes,
      routeLocales,
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle complex nested routes with localeRoutes and restrictions', () => {
    const globalLocaleRoutes = {
      '/activity-locale': {
        en: '/change-activity',
        de: '/change-buchen',
      },
      '/activity-locale/skiing': {
        en: '/book-activity/skiing',
        de: '/aktivitaet-buchen/ski-fahren',
      },
    }

    const routeLocales = {
      '/activity-locale': ['en', 'de'],
      '/activity-locale/skiing': ['en', 'de'],
    }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes,
      routeLocales,
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [
      {
        path: '/activity-locale',
        name: 'activity-locale',
        children: [{ path: 'skiing', name: 'activity-locale-skiing' }],
      },
    ]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle prefix strategy with locale restrictions', () => {
    const routeLocales = { '/test': ['en', 'de'] }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix',
      globalLocaleRoutes: {},
      routeLocales,
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle no_prefix strategy with locale restrictions', () => {
    const routeLocales = { '/test': ['en', 'de'] }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'no_prefix',
      globalLocaleRoutes: {},
      routeLocales,
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle prefix_and_default strategy with locale restrictions', () => {
    const routeLocales = { '/test': ['en', 'de'] }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_and_default',
      globalLocaleRoutes: {},
      routeLocales,
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle locale codes with hyphens in $defineI18nRoute', () => {
    const localesWithHyphens: Locale[] = [
      { code: 'en-us', iso: 'en-US' },
      { code: 'de-de', iso: 'de-DE' },
      { code: 'ru-ru', iso: 'ru-RU' },
    ]

    const routeLocales = { '/test': ['en-us', 'de-de'] }

    const generator = new RouteGenerator({
      locales: localesWithHyphens,
      defaultLocaleCode: 'en-us',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales,
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle mixed locale restrictions - some pages restricted, others not', () => {
    const routeLocales = { '/restricted': ['en'] }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales,
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [
      { path: '/restricted', name: 'restricted' },
      { path: '/unrestricted', name: 'unrestricted' },
    ]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle empty locale restrictions array', () => {
    const routeLocales = { '/test': [] }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales,
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle invalid locale codes in restrictions', () => {
    const routeLocales = { '/test': ['en', 'invalid-locale', 'de'] }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales,
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle pages with globalLocaleRoutes set to false', () => {
    const globalLocaleRoutes = { test: false }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes,
      routeLocales: {},
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })
})
