import type { NuxtPage } from '@nuxt/schema'
import { RouteGenerator } from '../src/index'
import { defaultLocaleCode, locales } from './helpers'

describe('RouteGenerator - Paths, alias, edge cases', () => {
  test('should handle internal paths correctly', () => {
    const excludePatterns = ['/admin/**', /^\/api\//]
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
      excludePatterns,
    })

    const pages: NuxtPage[] = [
      { path: '/test', name: 'test' },
      { path: '/admin/dashboard', name: 'admin-dashboard' },
      { path: '/api/users', name: 'api-users' },
    ]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle pages without names correctly', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: undefined }]

    expect(() => generator.extendPages(pages)).not.toThrow()
    expect(pages.length).toBeGreaterThan(0)
  })

  test('should handle alias routes correctly', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [
      {
        path: '/about',
        name: 'about',
        alias: ['/about-us', '/company'],
      },
    ]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle alias routes with locale restrictions', () => {
    const routeLocales = { '/about': ['en', 'de'] }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales,
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [
      {
        path: '/about',
        name: 'about',
        alias: ['/about-us', '/company'],
      },
    ]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle complex nested routes with multiple levels', () => {
    const globalLocaleRoutes = {
      '/products': { en: '/products', de: '/produkte' },
      '/products/category': { en: '/products/category', de: '/produkte/kategorie' },
      '/products/category/item': { en: '/products/category/item', de: '/produkte/kategorie/artikel' },
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
        path: '/products',
        name: 'products',
        children: [
          {
            path: 'category',
            name: 'products-category',
            children: [{ path: 'item', name: 'products-category-item' }],
          },
        ],
      },
    ]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle prefix strategy with default locale removal', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('prefix strategy: filtered pages when no fallback redirect path', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle no_prefix strategy with noPrefixRedirect', () => {
    const globalLocaleRoutes = {
      test: { en: '/test-en', de: '/test-de' },
    }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'no_prefix',
      globalLocaleRoutes,
      routeLocales: {},
      noPrefixRedirect: true,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle custom regex in buildFullPath', () => {
    const customRegexMatcher = /^[a-z]{2}$/
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
      customRegexMatcher,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should create route for default locale when localeRoutes is defined by path (like $defineI18nRoute)', () => {
    const globalLocaleRoutes = {
      '/product': {
        en: '/our-products',
        de: '/unsere-produkte',
        ru: '/nashi-produkty',
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

    const pages: NuxtPage[] = [{ path: '/product', name: 'product' }]

    generator.extendPages(pages)

    expect(pages.length).toBeGreaterThanOrEqual(2)
    expect(pages).toMatchSnapshot()
  })

  test('should handle filesLocaleRoutes fallback', () => {
    const filesLocaleRoutes = {
      test: { en: '/test-en', de: '/test-de', ru: '/test-ru' },
    }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      filesLocaleRoutes,
      routeLocales: {},
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle prefix_and_default strategy with custom paths', () => {
    const globalLocaleRoutes = {
      test: { en: '/test-en', de: '/test-de' },
    }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_and_default',
      globalLocaleRoutes,
      routeLocales: {},
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle edge case with empty locale codes array', () => {
    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    const routeLocales = { '/test': [] }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales,
      noPrefixRedirect: false,
    })
    generator.extendPages(pages)

    expect(pages.length).toBeGreaterThan(1)
    expect(pages).toMatchSnapshot()
  })

  test('should handle edge case with undefined page path', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]

    ;(pages[0] as unknown as { path?: string }).path = undefined

    expect(() => generator.extendPages(pages)).toThrow()
  })

  test('should handle redirect-only pages correctly', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })

    const pages: NuxtPage[] = [
      {
        path: '/redirect',
        name: 'redirect',
        redirect: '/target',
      },
    ]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle alias with custom path (globalLocaleRoutes): alias routes get prefixed path', () => {
    const globalLocaleRoutes = {
      '/about': { en: '/about', de: '/ueber-uns' },
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
        path: '/about',
        name: 'about',
        alias: ['/about-us'],
      },
    ]

    generator.extendPages(pages)

    const defaultRoute = pages.find((p) => p.path === '/about' && p.name === 'about')
    expect(defaultRoute).toBeDefined()
    const deMain = pages.find((p) => p.name === 'localized-about-de')
    expect(deMain).toBeDefined()
    expect(deMain!.path).toMatch(/ueber-uns/)
    const aliasRoute = pages.find((p) => p.path?.includes('about-us'))
    expect(aliasRoute).toBeDefined()
    expect(pages).toMatchSnapshot()
  })

  test('should handle complex scenario with mixed restrictions and custom paths', () => {
    const globalLocaleRoutes = {
      '/restricted': { en: '/restricted-en', de: '/restricted-de' },
      '/unrestricted': { en: '/unrestricted-en', de: '/unrestricted-de', ru: '/unrestricted-ru' },
    }

    const routeLocales = { '/restricted': ['en', 'de'] }

    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes,
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
})
