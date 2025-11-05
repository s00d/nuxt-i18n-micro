import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { describe, it, expect } from 'vitest'
import type { NuxtPage } from '@nuxt/schema'
import type { Locale, Strategies, GlobalLocaleRoutes } from 'nuxt-i18n-micro-types'
import { PageManager } from '../src/page-manager'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const locales: Locale[] = [
  { code: 'en', iso: 'en-US' },
  { code: 'de', iso: 'de-DE' },
  { code: 'ru', iso: 'ru-RU' },
]

const defaultLocaleCode = 'en'

/** Создает базовый набор страниц для каждого теста. */
const createBasicPages = (): NuxtPage[] => [
  { path: '/', name: 'index', file: '/pages/index.vue' },
  { path: '/about', name: 'about', file: '/pages/about.vue' },
  { path: '/users/:id', name: 'users-id', file: '/pages/users/[id].vue' },
  { path: '/:slug(.*)*', name: 'catch-all', file: '/pages/[...slug].vue' },
]

/** Создает набор страниц с вложенностью. */
const createNestedPages = (): NuxtPage[] => [
  {
    path: '/parent',
    name: 'parent',
    file: '/pages/parent.vue',
    children: [
      {
        path: 'child',
        name: 'parent-child',
        file: '/pages/parent/child.vue',
        children: [
          { path: 'grandchild', name: 'parent-child-grandchild', file: '/pages/parent/child/grandchild.vue' },
        ],
      },
    ],
  },
]

/** Фабрика для создания экземпляра PageManager с нужной конфигурацией. */
const createManager = (
  strategy: Strategies,
  globalLocaleRoutes: GlobalLocaleRoutes = {},
  routeLocales: Record<string, string[]> = {},
  noPrefixRedirect = false,
  excludePatterns: (string | RegExp)[] = [],
) => {
  return new PageManager(locales, defaultLocaleCode, strategy, globalLocaleRoutes, {}, routeLocales, noPrefixRedirect, excludePatterns)
}

describe('PageManager', () => {
  describe('Initialization', () => {
    it('should correctly calculate active locale codes for `prefix_except_default`', () => {
      const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, {}, false)
      expect(pageManager.activeLocaleCodes).toEqual(['de', 'ru'])
    })

    it('should correctly calculate active locale codes for `prefix`', () => {
      const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix', undefined, {}, {}, false)
      expect(pageManager.activeLocaleCodes).toEqual(['en', 'de', 'ru'])
    })

    it('should find the default locale correctly', () => {
      const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, {}, false)
      expect(pageManager.defaultLocale).toEqual({ code: 'en', iso: 'en-US' })
    })
  })

  describe('Basic Functionality', () => {
    it('should correctly extend pages with localized routes', () => {
      const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, {}, false)
      const pages: NuxtPage[] = [
        {
          path: '/activity',
          name: 'ActivityParent',
          children: [
            {
              path: 'skiing',
              name: 'Skiing',
              children: [
                {
                  path: 'details',
                  name: 'SkiingDetails',
                  children: [
                    {
                      path: 'info',
                      name: 'SkiingInfo',
                      children: [
                        { path: 'deep', name: 'SkiingDeepInfo' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              path: 'hiking',
              name: 'Hiking',
              children: [
                {
                  path: 'details',
                  name: 'HikingDetails',
                  children: [
                    {
                      path: 'info',
                      name: 'HikingInfo',
                      children: [
                        { path: 'deep', name: 'HikingDeepInfo' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]

      pageManager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('should handle default locale routes correctly in extendPages', () => {
      const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, {}, false)
      const pages: NuxtPage[] = [{
        path: '/activity',
        name: 'ActivityParent',
        children: [{ path: 'skiing', name: 'Skiing' }],
      }]

      pageManager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('should include default locale routes when strategy is prefix', () => {
      const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix', undefined, {}, {}, false)

      const pages: NuxtPage[] = [{
        path: '/activity',
        name: 'ActivityParent',
        children: [{ path: 'skiing', name: 'Skiing' }],
      }]

      pageManager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })
  })

  it('should handle prefix_except_default strategy correctly', () => {
    const globalLocaleRoutes = {
      activity: {
        en: '/custom-activity-en',
        de: '/custom-activity-de',
        ru: '/custom-activity-ru',
      },
      unlocalized: false, // Unlocalized page should not be localized
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, {}, false)

    const pages: NuxtPage[] = [{
      path: '/activity',
      name: 'activity',
      children: [{ path: 'skiing', name: 'Skiing' }],
    }, {
      path: '/unlocalized',
      name: 'unlocalized',
    }]

    pageManager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  it('should handle prefix_and_default strategy correctly', () => {
    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_and_default', undefined, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/activity',
        name: 'activity',
        children: [{ path: 'skiing', name: 'Skiing' }],
      },
    ]

    pageManager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  it('should handle no_prefix strategy correctly', () => {
    const globalLocaleRoutes = {
      activity: {
        en: '/custom-activity-en',
        de: '/custom-activity-de',
        ru: '/custom-activity-ru',
      },
    }
    const pageManager = new PageManager(locales, defaultLocaleCode, 'no_prefix', globalLocaleRoutes, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/activity',
        name: 'activity',
        children: [{ path: 'skiing', name: 'Skiing' }],
      },
    ]

    pageManager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  it('extractLocalizedPaths should extract localized paths correctly', () => {
    const fixturesDir = path.join(__dirname, 'fixtures/strategy/pages')

    const mockPages: NuxtPage[] = [
      {
        path: '/about',
        file: path.join(fixturesDir, 'about.vue'),
        children: [],
      },
      {
        path: '/contact',
        file: path.join(fixturesDir, 'contact.vue'),
        children: [],
      },
    ]

    const locales = [
      { code: 'en' },
      { code: 'fr' },
    ]

    // Create filesLocaleRoutes based on file contents
    const filesLocaleRoutes = {
      about: {
        en: '/about',
        de: '/a-propos',
      },
      contact: {
        en: '/contact',
        de: '/kontakt',
      },
    }

    const pageManager = new PageManager(locales, 'en', 'no_prefix', {}, filesLocaleRoutes, {}, false)

    // Call extractLocalizedPaths method
    const localizedPaths = pageManager.extractLocalizedPaths(mockPages)

    // Check result
    expect(localizedPaths).toEqual({
      '/about': {
        en: '/about',
        de: '/a-propos',
      },
      '/contact': {
        en: '/contact',
        de: '/kontakt',
      },
    })
  })

  // === Tests for fixing $defineI18nRoute bug ===

  it('should respect locale restrictions from $defineI18nRoute - locales only', () => {
    const routeLocales = {
      '/test': ['en'], // Only English is allowed for /test
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // Should create only one page for English (default locale)
    expect(pages).toMatchSnapshot()
  })

  it('should respect locale restrictions from $defineI18nRoute - multiple locales', () => {
    const routeLocales = {
      '/test': ['en', 'de'], // Only English and German are allowed for /test
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // Should create page for English (default) and German
    expect(pages).toMatchSnapshot()
  })

  it('should handle localeRoutes from $defineI18nRoute correctly', () => {
    const globalLocaleRoutes = {
      '/test': {
        en: '/custom-test-en',
        de: '/custom-test-de',
      },
    }

    const routeLocales = {
      '/test': ['en', 'de'], // Only English and German are allowed
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // Should create page for English with custom path
    expect(pages).toMatchSnapshot()
  })

  it('should handle nested routes with localeRoutes from $defineI18nRoute', () => {
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

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/activity-locale',
        name: 'activity-locale',
        children: [
          {
            path: 'skiing',
            name: 'activity-locale-skiing',
          },
        ],
      },
    ]

    pageManager.extendPages(pages)

    // Check that parent page got correct paths
    // Default locale page comes first, then localized versions
    expect(pages).toMatchSnapshot()
  })

  it('should handle locale restrictions with custom paths correctly', () => {
    const globalLocaleRoutes = {
      '/test': {
        en: '/custom-test-en',
        de: '/custom-test-de',
        ru: '/custom-test-ru',
      },
    }

    const routeLocales = {
      '/test': ['en', 'de'], // Only English and German are allowed
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // Should create page for English with custom path
    expect(pages).toMatchSnapshot()

    // Should not create page for Russian, even if there's a custom path
    expect(pages).toMatchSnapshot()
  })

  it('should handle complex nested routes with localeRoutes and restrictions', () => {
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
      '/activity-locale': ['en', 'de'], // Only English and German are allowed for parent page
      '/activity-locale/skiing': ['en', 'de'], // Only English and German are allowed for child page
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/activity-locale',
        name: 'activity-locale',
        children: [
          {
            path: 'skiing',
            name: 'activity-locale-skiing',
          },
        ],
      },
    ]

    pageManager.extendPages(pages)

    // Check that only pages for allowed locales are created
    // Default locale page comes first, then localized versions
    expect(pages).toMatchSnapshot()

    // Should not create pages for Russian
    expect(pages).toMatchSnapshot()
  })

  it('should handle prefix strategy with locale restrictions', () => {
    const routeLocales = {
      '/test': ['en', 'de'], // Only English and German are allowed
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix', undefined, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // Should create pages for all allowed locales
    expect(pages).toMatchSnapshot()
  })

  it('should handle no_prefix strategy with locale restrictions', () => {
    const routeLocales = {
      '/test': ['en', 'de'], // Only English and German are allowed
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'no_prefix', undefined, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // Should create pages for all allowed locales
    expect(pages).toMatchSnapshot()
  })

  it('should handle prefix_and_default strategy with locale restrictions', () => {
    const routeLocales = {
      '/test': ['en', 'de'], // Only English and German are allowed
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_and_default', undefined, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // Should create pages for all allowed locales
    expect(pages).toMatchSnapshot()
  })

  it('should handle locale codes with hyphens in $defineI18nRoute', () => {
    const localesWithHyphens: Locale[] = [
      { code: 'en-us', iso: 'en-US' },
      { code: 'de-de', iso: 'de-DE' },
      { code: 'ru-ru', iso: 'ru-RU' },
    ]

    const routeLocales = {
      '/test': ['en-us', 'de-de'], // Only en-us and de-de are allowed
    }

    const pageManager = new PageManager(localesWithHyphens, 'en-us', 'prefix_except_default', undefined, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // Should create page for en-us (default) and de-de
    expect(pages).toMatchSnapshot()
  })

  it('should handle mixed locale restrictions - some pages restricted, others not', () => {
    const routeLocales = {
      '/restricted': ['en'], // Only English is allowed for /restricted
      // /unrestricted has no restrictions
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/restricted',
        name: 'restricted',
      },
      {
        path: '/unrestricted',
        name: 'unrestricted',
      },
    ]

    pageManager.extendPages(pages)

    // /restricted should be created only for English
    // /unrestricted should be created for all locales
    expect(pages).toMatchSnapshot()
  })

  it('should handle empty locale restrictions array', () => {
    const routeLocales = {
      '/test': [], // Empty array - no locales allowed
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // With empty array, pages are created for all available locales (fallback behavior)
    expect(pages).toMatchSnapshot()
  })

  it('should handle invalid locale codes in restrictions', () => {
    const routeLocales = {
      '/test': ['en', 'invalid-locale', 'de'], // invalid-locale does not exist in configuration
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // Should create pages only for valid locales
    expect(pages).toMatchSnapshot()

    // Should not create page for invalid-locale
    expect(pages).toMatchSnapshot()
  })

  it('should handle pages with globalLocaleRoutes set to false', () => {
    const globalLocaleRoutes = {
      test: false, // Page disabled
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // Page should not be localized
    expect(pages).toMatchSnapshot()
  })

  it('should handle internal paths correctly', () => {
    const excludePatterns = ['/admin/**', /^\/api\//]
    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', {}, {}, {}, false, excludePatterns)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
      {
        path: '/admin/dashboard',
        name: 'admin-dashboard',
      },
      {
        path: '/api/users',
        name: 'api-users',
      },
    ]

    pageManager.extendPages(pages)

    // Only regular page should be localized
    // Order: original page, internal paths (not localized), then localized version
    expect(pages).toMatchSnapshot()
  })

  it('should handle pages without names correctly', () => {
    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', {}, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: undefined, // Missing name
      },
    ]

    // Should not throw error
    expect(() => pageManager.extendPages(pages)).not.toThrow()
    expect(pages.length).toBeGreaterThan(0)
  })

  it('should handle alias routes correctly', () => {
    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', {}, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/about',
        name: 'about',
        alias: ['/about-us', '/company'],
      },
    ]

    pageManager.extendPages(pages)

    // Check total count: original + localized + 2 alias routes
    expect(pages).toMatchSnapshot()
  })

  it('should handle alias routes with locale restrictions', () => {
    const routeLocales = {
      '/about': ['en', 'de'], // Only English and German
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', {}, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/about',
        name: 'about',
        alias: ['/about-us', '/company'],
      },
    ]

    pageManager.extendPages(pages)

    // Check total count: original + localized de + 2 alias routes for en|de
    expect(pages).toMatchSnapshot()
  })

  it('should handle complex nested routes with multiple levels', () => {
    const globalLocaleRoutes = {
      '/products': {
        en: '/products',
        de: '/produkte',
      },
      '/products/category': {
        en: '/products/category',
        de: '/produkte/kategorie',
      },
      '/products/category/item': {
        en: '/products/category/item',
        de: '/produkte/kategorie/artikel',
      },
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/products',
        name: 'products',
        children: [
          {
            path: 'category',
            name: 'products-category',
            children: [
              {
                path: 'item',
                name: 'products-category-item',
              },
            ],
          },
        ],
      },
    ]

    pageManager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  it('should handle prefix strategy with default locale removal', () => {
    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix', {}, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // With prefix strategy, default routes should be removed
    // Should only have localized routes
    expect(pages).toMatchSnapshot()
  })

  it('should handle prefix strategy with Cloudflare Pages', () => {
    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix', {}, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages, undefined, true) // isCloudflarePages = true

    // With Cloudflare Pages, default routes should NOT be removed
    expect(pages).toMatchSnapshot()
  })

  it('should handle no_prefix strategy with noPrefixRedirect', () => {
    const globalLocaleRoutes = {
      test: {
        en: '/test-en',
        de: '/test-de',
      },
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'no_prefix', globalLocaleRoutes, {}, {}, true) // noPrefixRedirect = true

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // With noPrefixRedirect, original page should get redirect
    expect(pages).toMatchSnapshot()
  })

  it('should handle custom regex in buildFullPath', () => {
    const customRegex = /^[a-z]{2}$/
    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', {}, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages, customRegex)

    // Check that custom regex was applied
    // Path should contain custom regex
    expect(pages).toMatchSnapshot()
  })

  it('should create route for default locale when localeRoutes is defined by path (like $defineI18nRoute)', () => {
    // This test simulates the case where pages/product/index.vue defines localeRoutes
    // The routePath would be '/product' and localeRoutes would be { en: '/our-products', es: '/nuestros-productos' }
    const globalLocaleRoutes = {
      '/product': {
        en: '/our-products',
        de: '/unsere-produkte',
        ru: '/nashi-produkty',
      },
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/product',
        name: 'product',
      },
    ]

    pageManager.extendPages(pages)

    // Should create page for English with custom path /our-products (default locale)
    expect(pages.length).toBeGreaterThanOrEqual(2)

    // Check that all expected pages exist
    expect(pages).toMatchSnapshot()
  })

  it('should handle filesLocaleRoutes fallback', () => {
    const filesLocaleRoutes = {
      test: {
        en: '/test-en',
        de: '/test-de',
        ru: '/test-ru',
      },
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', {}, filesLocaleRoutes, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // Routes with custom paths from filesLocaleRoutes should be created
    expect(pages).toMatchSnapshot()
  })

  it('should handle prefix_and_default strategy with custom paths', () => {
    const globalLocaleRoutes = {
      test: {
        en: '/test-en',
        de: '/test-de',
      },
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_and_default', globalLocaleRoutes, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // With prefix_and_default strategy, both default and prefixed versions should be created
    expect(pages).toMatchSnapshot()
  })

  it('should handle edge case with empty locale codes array', () => {
    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    // Test through public extendPages method with empty restrictions
    const routeLocales = {
      '/test': [], // Empty array of locales
    }

    const pageManagerWithEmptyRestrictions = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', {}, {}, routeLocales, false)
    pageManagerWithEmptyRestrictions.extendPages(pages)

    // With empty restrictions, page is still localized for all available locales
    // Default locale page comes first, then localized versions
    expect(pages.length).toBeGreaterThan(1)
    expect(pages).toMatchSnapshot()
  })

  it('should handle edge case with undefined page path', () => {
    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', {}, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    // Test with undefined path by changing after creation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(pages[0] as any).path = undefined

    // Should throw error as undefined path is not supported
    expect(() => pageManager.extendPages(pages)).toThrow()
  })

  it('should handle redirect-only pages correctly', () => {
    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', {}, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/redirect',
        name: 'redirect',
        redirect: '/target',
      },
    ]

    pageManager.extendPages(pages)

    // Redirect-only pages should not be localized
    expect(pages).toMatchSnapshot()
  })

  it('should handle complex scenario with mixed restrictions and custom paths', () => {
    const globalLocaleRoutes = {
      '/restricted': {
        en: '/restricted-en',
        de: '/restricted-de',
      },
      '/unrestricted': {
        en: '/unrestricted-en',
        de: '/unrestricted-de',
        ru: '/unrestricted-ru',
      },
    }

    const routeLocales = {
      '/restricted': ['en', 'de'], // Restriction only for restricted
    }

    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, routeLocales, false)

    const pages: NuxtPage[] = [
      {
        path: '/restricted',
        name: 'restricted',
      },
      {
        path: '/unrestricted',
        name: 'unrestricted',
      },
    ]

    pageManager.extendPages(pages)

    // Restricted should be created only for en and de
    // Unrestricted should be created for all locales
    expect(pages).toMatchSnapshot()
  })

  describe('Strategy: prefix_except_default - Structured Tests', () => {
    const strategy: Strategies = 'prefix_except_default'

    it('1. should not prefix default locale for static routes', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy)
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('2. should prefix non-default locales', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy)
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('3. should handle the root route correctly', () => {
      const pages = [{ path: '/', name: 'index' }]
      const manager = createManager(strategy)
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('4. should handle dynamic routes correctly', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy)
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('5. should handle nested routes correctly', () => {
      const pages = createNestedPages()
      const manager = createManager(strategy)
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('6. should apply custom paths from `globalLocaleRoutes`', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy, { '/about': { de: '/ueber-uns' } })
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('7. should respect `routeLocales` to limit available languages for a page', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy, {}, { '/about': ['en', 'de'] })
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('8. should disable localization for a route when set to `false`', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy, { '/about': false })
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })
  })

  describe('Strategy: prefix - Structured Tests', () => {
    const strategy: Strategies = 'prefix'

    it('9. should prefix all locales including the default one', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy)
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('10. should handle the root route by prefixing all locales', () => {
      const pages = [{ path: '/', name: 'index' }]
      const manager = createManager(strategy)
      manager.extendPages(pages)
      // Root route is kept for prefix strategy
      expect(pages).toMatchSnapshot()
    })

    it('11. should remove original non-prefixed routes (except for Cloudflare)', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy)
      manager.extendPages(pages, undefined, false) // isCloudflarePages = false
      expect(pages).toMatchSnapshot()
    })

    it('12. should apply custom paths to all prefixed routes', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy, { '/about': { de: '/ueber-uns', en: '/about-us' } })
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })
  })

  describe('Strategy: prefix_and_default - Structured Tests', () => {
    const strategy: Strategies = 'prefix_and_default'

    it('13. should create both prefixed and non-prefixed routes for the default locale', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy)
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('14. should create only prefixed routes for non-default locales', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy)
      manager.extendPages(pages)
      // prefix_and_default creates combined route for all locales
      expect(pages).toMatchSnapshot()
    })

    it('15. should handle the root route correctly', () => {
      const pages = [{ path: '/', name: 'index' }]
      const manager = createManager(strategy)
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('16. should apply a custom path to both default locale routes', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy, { '/about': { en: '/about-us' } })
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })
  })

  describe('Strategy: no_prefix - Structured Tests', () => {
    const strategy: Strategies = 'no_prefix'

    it('17. should not create any prefixed routes by default', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy)
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('18. should create additional, separate routes for custom paths', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy, { '/about': { de: '/ueber-uns', ru: '/o-nas' } })
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('19. should add a redirect to the original page if `noPrefixRedirect` is true', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy, { '/about': { en: '/about-us' } }, {}, true)
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('20. should not add a redirect if custom path is for a non-default locale', () => {
      const pages = createBasicPages()
      const manager = createManager(strategy, { '/about': { de: '/ueber-uns' } }, {}, true)
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })
  })

  describe('General Functionality (Cross-Strategy) - Structured Tests', () => {
    it('21. should exclude routes based on `excludePatterns`', () => {
      const pages = [
        ...createBasicPages(),
        { path: '/admin', name: 'admin' },
        { path: '/api/users', name: 'api-users' },
      ]
      const manager = createManager('prefix_except_default', {}, {}, false, ['/admin', /^\/api/])
      manager.extendPages(pages)

      // Non-excluded pages should be localized
      expect(pages).toMatchSnapshot()
    })

    it('22. should correctly localize aliases', () => {
      const pages: NuxtPage[] = [{ path: '/about', name: 'about', alias: ['/about-us', '/company'] }]
      const manager = createManager('prefix_except_default')
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('23. should handle deep nesting with custom paths at different levels', () => {
      const pages = createNestedPages()
      const manager = createManager('prefix', {
        '/parent': { de: '/eltern' },
        '/parent/child/grandchild': { de: '/grosskind' },
      })
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('24. should handle catch-all routes correctly', () => {
      const pages = [{ path: '/:slug(.*)*', name: 'catch-all' }]
      const manager = createManager('prefix')
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })

    it('25. should combine `routeLocales` and `globalLocaleRoutes` correctly', () => {
      const pages = createBasicPages()
      const manager = createManager('prefix_except_default',
        { '/about': { de: '/ueber-uns', ru: '/o-nas' } },
        { '/about': ['en', 'de'] }, // Only en and de are allowed
      )
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('26. should handle pages with no name property', () => {
      const pages: NuxtPage[] = [{ path: '/no-name' }]
      const manager = createManager('prefix')
      expect(() => manager.extendPages(pages)).not.toThrow()
      expect(pages.length).toBeGreaterThan(0)
      // Check that all pages have names after processing
      pages.forEach((page) => {
        expect(page.name).toBeDefined()
        expect(typeof page.name).toBe('string')
      })
    })

    it('27. should not localize redirect-only pages', () => {
      const pages: NuxtPage[] = [{ path: '/old', redirect: '/new' }]
      // Use prefix_except_default strategy - redirect-only pages remain with this strategy
      const manager = createManager('prefix_except_default')
      manager.extendPages(pages)
      // Redirect-only pages should not be localized but remain
      expect(pages).toMatchSnapshot()
    })

    it('28. should correctly generate names for nested localized routes', () => {
      const pages = createNestedPages()
      const manager = createManager('prefix')
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('29. should correctly handle custom path for a child but not for the parent', () => {
      const pages = createNestedPages()
      const manager = createManager('prefix_except_default', {
        '/parent/child': { de: '/kind' },
      })
      manager.extendPages(pages)

      // Routes are grouped by locale, so both de and ru are in the same route
      expect(pages).toMatchSnapshot()
    })

    it('30. should handle custom path for parent and child', () => {
      const pages = createNestedPages()
      const manager = createManager('prefix_except_default', {
        '/parent': { de: '/eltern' },
        '/parent/child': { de: '/eltern/kind' },
      })
      manager.extendPages(pages)

      // Child path includes full path from parent when custom path is specified
      expect(pages).toMatchSnapshot()
    })

    it('31. should handle custom path for parent but not for child', () => {
      const pages = createNestedPages()
      const manager = createManager('prefix_except_default', {
        '/parent': { de: '/eltern' },
      })
      manager.extendPages(pages)

      // Child path remains the same
      expect(pages).toMatchSnapshot()
    })

    it('32. should handle a page with multiple dynamic segments', () => {
      const pages: NuxtPage[] = [{ path: '/users/:group/:id', name: 'users-group-id' }]
      const manager = createManager('prefix')
      manager.extendPages(pages)
      expect(pages).toMatchSnapshot()
    })
  })

  describe('Advanced Scenarios - Comprehensive Coverage', () => {
    it('33. should not create route when globalLocaleRoutes defines custom path for locale forbidden in routeLocales', () => {
      const pages = createBasicPages()
      const manager = createManager('prefix_except_default',
        { '/about': { de: '/ueber-uns', ru: '/o-nas' } },
        { '/about': ['en', 'de'] }, // ru is forbidden
      )
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('34. should prioritize globalLocaleRoutes over filesLocaleRoutes', () => {
      const pages: NuxtPage[] = [{ path: '/about', name: 'about' }]
      const manager = new PageManager(
        locales,
        defaultLocaleCode,
        'prefix_except_default',
        { '/about': { en: '/from-global' } }, // global config
        { '/about': { en: '/from-file' } }, // file config
        {},
        false,
      )
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('35. should handle index.vue in subfolder correctly', () => {
      const pages: NuxtPage[] = [
        {
          path: '/parent',
          name: 'parent-index',
          file: '/pages/parent/index.vue',
        },
      ]
      const manager = createManager('prefix_except_default')
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('36. should handle paths conflicting with locale codes', () => {
      const pages: NuxtPage[] = [
        {
          path: '/de/contact',
          name: 'de-contact',
          file: '/pages/de/contact.vue',
        },
      ]
      const manager = createManager('prefix_except_default')
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('37. should handle paths with special characters requiring encoding', () => {
      const pages: NuxtPage[] = [
        {
          path: '/test-path',
          name: 'test-path',
        },
        {
          path: '/test path',
          name: 'test-space',
        },
      ]
      const manager = createManager('prefix_except_default')
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('38. should handle parent with custom path but child without', () => {
      const pages = createNestedPages()
      const manager = createManager('prefix_except_default', {
        '/parent': { de: '/eltern' },
      })
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('39. should handle child with custom path but parent without', () => {
      const pages = createNestedPages()
      const manager = createManager('prefix_except_default', {
        '/parent/child': { de: '/kind' },
      })
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('40. should handle child custom path that does not include parent custom path', () => {
      const pages = createNestedPages()
      const manager = createManager('prefix_except_default', {
        '/parent': { de: '/eltern' },
        '/parent/child': { de: '/ganz-anderer-pfad' },
      })
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('41. should handle empty locales array gracefully', () => {
      const pages = createBasicPages()
      const manager = new PageManager(
        [],
        defaultLocaleCode,
        'prefix_except_default',
        {},
        {},
        {},
        false,
      )
      manager.extendPages(pages)

      // Should not create any localized routes
      expect(pages).toMatchSnapshot()
    })

    it('42. should handle defaultLocale not in locales list', () => {
      const pages = createBasicPages()
      const manager = new PageManager(
        [{ code: 'de', iso: 'de-DE' }, { code: 'ru', iso: 'ru-RU' }],
        'en', // en is not in locales
        'prefix_except_default',
        {},
        {},
        {},
        false,
      )
      manager.extendPages(pages)

      // Should still work, treating 'en' as default
      expect(pages).toMatchSnapshot()
    })

    it('43. should handle dynamic segments in custom paths with different param names', () => {
      const pages: NuxtPage[] = [{ path: '/users/:id', name: 'users-id' }]
      const manager = createManager('prefix_except_default', {
        '/users/:id': { de: '/benutzer/:userId' },
      })
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('44. should handle nested routes with restrictions at different levels', () => {
      const pages = createNestedPages()
      const manager = createManager('prefix_except_default', {}, {
        '/parent': ['en', 'de', 'ru'],
        '/parent/child': ['en', 'ru'], // child not available in 'de'
      })
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    it('45. should handle multiple dynamic segments in custom paths', () => {
      const pages: NuxtPage[] = [{ path: '/users/:group/:id', name: 'users-group-id' }]
      const manager = createManager('prefix_except_default', {
        '/users/:group/:id': { de: '/benutzer/:gruppe/:benutzerId' },
      })
      manager.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })
  })
})
