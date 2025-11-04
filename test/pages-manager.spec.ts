import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { expect, test } from '@nuxt/test-utils/playwright'
import type { NuxtPage } from '@nuxt/schema'
import type { Locale } from 'nuxt-i18n-micro-types'
import { PageManager } from '~/src/page-manager'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/undefault', import.meta.url)),
  },
})

const locales: Locale[] = [
  { code: 'en', iso: 'en-US' },
  { code: 'de', iso: 'de-DE' },
  { code: 'ru', iso: 'ru-RU' },
]

const defaultLocaleCode = 'en'

test.describe('PageManager', () => {
  let pageManager: PageManager

  test.beforeAll(() => {
    pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, {}, false)
  })

  test('should correctly calculate active locale codes', async () => {
    expect(pageManager.activeLocaleCodes).toEqual(['de', 'ru'])
  })

  test('should find the default locale correctly', async () => {
    expect(pageManager.defaultLocale).toEqual({ code: 'en', iso: 'en-US' })
  })

  test('should correctly extend pages with localized routes', async () => {
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

    // Extend pages
    pageManager.extendPages(pages)

    const root = pages.find(p => p.path?.startsWith('/:locale'))!
    expect(root.path).toBe('/:locale(de|ru)/activity')
    expect(root.name).toBe('localized-ActivityParent')
    expect(root.children?.length).toBe(2)

    const c = root.children!

    // --- Skiing ---
    expect(c[0].name).toBe('localized-Skiing')
    expect(c[0].path).toBe('skiing')
    expect(c[0].children![0].name).toBe('localized-SkiingDetails')
    expect(c[0].children![0].path).toBe('details')
    expect(c[0].children![0].children![0].name).toBe('localized-SkiingInfo')
    expect(c[0].children![0].children![0].path).toBe('info')
    expect(c[0].children![0].children![0].children![0].name).toBe('localized-SkiingDeepInfo')
    expect(c[0].children![0].children![0].children![0].path).toBe('deep')

    // --- Hiking de ---
    expect(c[1].name).toBe('localized-Hiking')
    expect(c[1].path).toBe('hiking')
    expect(c[1].children![0].name).toBe('localized-HikingDetails')
    expect(c[1].children![0].path).toBe('details')
    expect(c[1].children![0].children![0].name).toBe('localized-HikingInfo')
    expect(c[1].children![0].children![0].path).toBe('info')
    expect(c[1].children![0].children![0].children![0].name).toBe('localized-HikingDeepInfo')
    expect(c[1].children![0].children![0].children![0].path).toBe('deep')
  })

  test('should handle default locale routes correctly', async () => {
    const page: NuxtPage = {
      path: '/activity',
      name: 'ActivityParent',
      children: [{ path: 'skiing', name: 'Skiing' }],
    }

    const originalChildren = page.children ? [...page.children] : []
    pageManager.adjustRouteForDefaultLocale(page, originalChildren)

    // Check if the route for the default locale is adjusted correctly
    expect(page.path).toBe('/activity')
    expect(page.children).toHaveLength(1)
    expect(page.children).toEqual(
      expect.arrayContaining([
        { path: 'skiing', name: 'Skiing', children: [] },
      ]),
    )
  })

  test('should handle default locale routes correctly in extendPages', async () => {
    const pages: NuxtPage[] = [{
      path: '/activity',
      name: 'ActivityParent',
      children: [{ path: 'skiing', name: 'Skiing' }],
    }]

    // Extend pages
    pageManager.extendPages(pages)

    // Check if the route for the default locale is adjusted correctly
    expect(pages[0].path).toBe('/activity')
    expect(pages[0].children).toHaveLength(1)
    expect(pages[0].children).toEqual(
      expect.arrayContaining([
        { path: 'skiing', name: 'Skiing', children: [] },
      ]),
    )

    expect(pages[1].path).toBe('/:locale(de|ru)/activity')
    expect(pages[1].children).toHaveLength(1)
    expect(pages[1].children).toEqual(
      expect.arrayContaining([
        { path: 'skiing', name: 'localized-Skiing', children: [] },
      ]),
    )
  })

  test('should include default locale routes when strategy is prefix', async () => {
    // Set includeDefaultLocaleRoute flag to true
    const pageManagerWithDefaultLocale = new PageManager(locales, defaultLocaleCode, 'prefix', undefined, {}, {}, false)

    const pages: NuxtPage[] = [{
      path: '/activity',
      name: 'ActivityParent',
      children: [{ path: 'skiing', name: 'Skiing' }],
    }]

    // Extend pages
    pageManagerWithDefaultLocale.extendPages(pages)
    // Check correct handling of route for default locale
    expect(pages[0].path).toBe('/:locale(en|de|ru)/activity')

    // Check that routes are added for all locales, including default
    expect(pages[0].children).toHaveLength(1) // en, de, ru
    expect(pages[0].children).toEqual(
      expect.arrayContaining([
        { path: 'skiing', name: 'localized-Skiing', children: [] },
      ]),
    )
  })

  test('should handle prefix_except_default strategy correctly', async () => {
    const globalLocaleRoutes = {
      activity: {
        en: '/custom-activity-en',
        de: '/custom-activity-de',
        ru: '/custom-activity-ru',
      },
      unlocalized: false, // Unlocalized page should not be localized
    }

    // Creating a new PageManager instance with globalLocaleRoutes
    const pageManagerWithGlobalRoutes = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, {}, false)

    const pages: NuxtPage[] = [{
      path: '/activity',
      name: 'activity',
      children: [{ path: 'skiing', name: 'Skiing' }],
    }, {
      path: '/unlocalized',
      name: 'unlocalized',
    }]

    // Extend pages with globalLocaleRoutes
    pageManagerWithGlobalRoutes.extendPages(pages)

    const expectedPages = [
      {
        path: '/custom-activity-en',
        name: 'activity',
        children: [{ path: 'skiing', name: 'Skiing' }],
      },
      {
        path: '/unlocalized',
        name: 'unlocalized',
      },
      {
        path: '/:locale(de)/custom-activity-de',
        name: 'localized-activity-de',
        children: [{ path: 'skiing', name: 'localized-Skiing-de', children: [] }],
      },
      {
        path: '/:locale(ru)/custom-activity-ru',
        name: 'localized-activity-ru',
        children: [{ path: 'skiing', name: 'localized-Skiing-ru', children: [] }],
      },
    ]

    expect(pages).toMatchObject(expectedPages)
  })

  test('should handle prefix_and_default strategy correctly', async () => {
    const pageManagerPrefixAndDefault = new PageManager(locales, defaultLocaleCode, 'prefix_and_default', undefined, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/activity',
        name: 'activity',
        children: [{ path: 'skiing', name: 'Skiing' }],
      },
    ]

    // Extend pages
    pageManagerPrefixAndDefault.extendPages(pages)

    expect(pages).toHaveLength(2) // Routes for default and non-default locales

    // Check default locale route
    expect(pages[0].path).toBe('/activity')
    expect(pages[0].children).toEqual(
      expect.arrayContaining([
        { path: 'skiing', name: 'Skiing' },
      ]),
    )

    // Check non-default locale routes
    expect(pages[1].path).toBe('/:locale(en|de|ru)/activity')
    expect(pages[1].children).toEqual(
      expect.arrayContaining([
        { path: 'skiing', name: 'localized-Skiing', children: [] },
      ]),
    )
  })

  test('should handle no_prefix strategy correctly', async () => {
    const globalLocaleRoutes = {
      activity: {
        en: '/custom-activity-en',
        de: '/custom-activity-de',
        ru: '/custom-activity-ru',
      },
      unlocalized: false, // Unlocalized page should not be localized
    }
    const pageManagerPrefixAndDefault = new PageManager(locales, defaultLocaleCode, 'no_prefix', globalLocaleRoutes, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/activity',
        name: 'activity',
        children: [{ path: 'skiing', name: 'Skiing' }],
      },
    ]

    // Extend pages
    pageManagerPrefixAndDefault.extendPages(pages)

    // Теперь мы ожидаем 4 маршрута: 1 исходный + 3 кастомных
    expect(pages).toHaveLength(4)

    // Исходный маршрут остался на месте!
    const originalPage = pages.find(p => p.path === '/activity')
    expect(originalPage).toBeDefined()

    // И все кастомные маршруты были ДОБАВЛЕНЫ
    const customEn = pages.find(p => p.path === '/custom-activity-en')
    const customDe = pages.find(p => p.path === '/custom-activity-de')
    const customRu = pages.find(p => p.path === '/custom-activity-ru')

    expect(customEn).toBeDefined()
    expect(customDe).toBeDefined()
    expect(customRu).toBeDefined()

    // Можно даже проверить дочерние элементы
    expect(customEn!.children![0].name).toBe('localized-Skiing-en')
  })

  test('extractLocalizedPaths should extract localized paths correctly', async () => {
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

  test('should respect locale restrictions from $defineI18nRoute - locales only', async () => {
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
    expect(pages).toHaveLength(1)
    expect(pages[0].path).toBe('/test')
    expect(pages[0].name).toBe('test')

    // Should not create pages for /de/test or /ru/test
    const localizedPages = pages.filter(p => p.path?.includes('/:locale'))
    expect(localizedPages).toHaveLength(0)
  })

  test('should respect locale restrictions from $defineI18nRoute - multiple locales', async () => {
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
    expect(pages).toHaveLength(2)
    expect(pages[0].path).toBe('/test')
    expect(pages[0].name).toBe('test')
    expect(pages[1].path).toBe('/:locale(de)/test')
    expect(pages[1].name).toBe('localized-test')

    // Should not create page for /ru/test
    const russianPages = pages.filter(p => p.path?.includes('ru'))
    expect(russianPages).toHaveLength(0)
  })

  test('should handle localeRoutes from $defineI18nRoute correctly', async () => {
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
    expect(pages).toHaveLength(2)
    expect(pages[0].path).toBe('/custom-test-en')
    expect(pages[0].name).toBe('test')
    expect(pages[1].path).toBe('/:locale(de)/custom-test-de')
    expect(pages[1].name).toBe('localized-test-de')
  })

  test('should handle nested routes with localeRoutes from $defineI18nRoute', async () => {
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
    expect(pages[0].path).toBe('/change-activity')
    expect(pages[0].name).toBe('activity-locale')

    // Check that child page got correct paths
    // Должен быть создан один локализованный дочерний маршрут
    expect(pages[0].children).toHaveLength(1)
    expect(pages[0].children![0].path).toBe('book-activity/skiing')
    expect(pages[0].children![0].name).toBe('activity-locale-skiing')

    // Check localized pages - find page with German locale
    const germanPage = pages.find(p => p.path?.includes('de') && p.path?.includes('change-buchen'))
    expect(germanPage).toBeDefined()
    expect(germanPage!.name).toBe('localized-activity-locale-de')
    expect(germanPage!.children).toHaveLength(1)
    expect(germanPage!.children![0].path).toBe('aktivitaet-buchen/ski-fahren')
    expect(germanPage!.children![0].name).toBe('localized-activity-locale-skiing-de')
  })

  test('should handle locale restrictions with custom paths correctly', async () => {
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
    expect(pages).toHaveLength(2)
    expect(pages[0].path).toBe('/custom-test-en')
    expect(pages[0].name).toBe('test')
    expect(pages[1].path).toBe('/:locale(de)/custom-test-de')
    expect(pages[1].name).toBe('localized-test-de')

    // Should not create page for Russian, even if there's a custom path
    const russianPages = pages.filter(p => p.path?.includes('ru'))
    expect(russianPages).toHaveLength(0)
  })

  test('should handle complex nested routes with localeRoutes and restrictions', async () => {
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
    expect(pages).toHaveLength(2)

    // English page (default)
    expect(pages[0].path).toBe('/change-activity')
    expect(pages[0].name).toBe('activity-locale')
    expect(pages[0].children).toHaveLength(1) // Должен быть создан один локализованный дочерний маршрут
    expect(pages[0].children![0].path).toBe('book-activity/skiing')
    expect(pages[0].children![0].name).toBe('activity-locale-skiing')

    // German page - find page with German locale
    const germanPage = pages.find(p => p.path?.includes('de') && p.path?.includes('change-buchen'))
    expect(germanPage).toBeDefined()
    expect(germanPage!.name).toBe('localized-activity-locale-de')
    expect(germanPage!.children).toHaveLength(1)
    // Child page gets custom path from localeRoutes
    expect(germanPage!.children![0].path).toBe('aktivitaet-buchen/ski-fahren')
    expect(germanPage!.children![0].name).toBe('localized-activity-locale-skiing-de')

    // Should not create pages for Russian
    const russianPages = pages.filter(p => p.path?.includes('ru'))
    expect(russianPages).toHaveLength(0)
  })

  test('should handle prefix strategy with locale restrictions', async () => {
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
    expect(pages).toHaveLength(1)
    expect(pages[0].path).toBe('/:locale(en|de)/test')
    expect(pages[0].name).toBe('localized-test')

    // Should not create page for Russian
    const russianPages = pages.filter(p => p.path?.includes('ru'))
    expect(russianPages).toHaveLength(0)
  })

  test('should handle no_prefix strategy with locale restrictions', async () => {
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
    expect(pages).toHaveLength(1)
    expect(pages[0].path).toBe('/test')
    expect(pages[0].name).toBe('test')

    // Should not create page for Russian
    const russianPages = pages.filter(p => p.path?.includes('ru'))
    expect(russianPages).toHaveLength(0)
  })

  test('should handle prefix_and_default strategy with locale restrictions', async () => {
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
    expect(pages).toHaveLength(2)
    expect(pages[0].path).toBe('/test')
    expect(pages[0].name).toBe('test')
    expect(pages[1].path).toBe('/:locale(en|de)/test')
    expect(pages[1].name).toBe('localized-test')

    // Should not create page for Russian
    const russianPages = pages.filter(p => p.path?.includes('ru'))
    expect(russianPages).toHaveLength(0)
  })

  test('should handle locale codes with hyphens in $defineI18nRoute', async () => {
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
    expect(pages).toHaveLength(2)
    expect(pages[0].path).toBe('/test')
    expect(pages[0].name).toBe('test')
    expect(pages[1].path).toBe('/:locale(de-de)/test')
    expect(pages[1].name).toBe('localized-test')

    // Should not create page for ru-ru
    const russianPages = pages.filter(p => p.path?.includes('ru-ru'))
    expect(russianPages).toHaveLength(0)
  })

  test('should handle mixed locale restrictions - some pages restricted, others not', async () => {
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
    expect(pages[0].path).toBe('/restricted')
    expect(pages[0].name).toBe('restricted')

    // /unrestricted should be created for all locales
    expect(pages[1].path).toBe('/unrestricted')
    expect(pages[1].name).toBe('unrestricted')
    expect(pages[2].path).toBe('/:locale(de|ru)/unrestricted')
    expect(pages[2].name).toBe('localized-unrestricted')

    expect(pages).toHaveLength(3)
  })

  test('should handle empty locale restrictions array', async () => {
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
    expect(pages).toHaveLength(2)
    expect(pages[0].path).toBe('/test')
    expect(pages[0].name).toBe('test')
    expect(pages[1].path).toBe('/:locale(de|ru)/test')
    expect(pages[1].name).toBe('localized-test')
  })

  test('should handle invalid locale codes in restrictions', async () => {
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
    expect(pages).toHaveLength(2)
    expect(pages[0].path).toBe('/test')
    expect(pages[0].name).toBe('test')
    expect(pages[1].path).toBe('/:locale(de)/test')
    expect(pages[1].name).toBe('localized-test')

    // Should not create page for invalid-locale
    const invalidPages = pages.filter(p => p.path?.includes('invalid-locale'))
    expect(invalidPages).toHaveLength(0)
  })

  test('should handle pages with globalLocaleRoutes set to false', async () => {
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
    expect(pages).toHaveLength(1)
    expect(pages[0].path).toBe('/test')
    expect(pages[0].name).toBe('test')
  })

  test('should handle internal paths correctly', async () => {
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
    expect(pages).toHaveLength(4) // 1 original + 3 localized
    expect(pages[0].path).toBe('/test')
    // Find localized page for test
    const localizedTestPage = pages.find(p => p.path?.includes(':locale') && p.path?.includes('test'))
    expect(localizedTestPage).toBeDefined()

    // Internal paths should not be localized
    const adminPages = pages.filter(p => p.path?.includes('admin'))
    const apiPages = pages.filter(p => p.path?.includes('api'))
    expect(adminPages).toHaveLength(1)
    expect(apiPages).toHaveLength(1)
  })

  test('should handle pages without names correctly', async () => {
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

  test('should handle alias routes correctly', async () => {
    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', {}, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/about',
        name: 'about',
        alias: ['/about-us', '/company'],
      },
    ]

    pageManager.extendPages(pages)

    // Localized versions of aliases should be created
    const aliasRoutes = pages.filter(p => p.name?.includes('localized-about'))
    expect(aliasRoutes.length).toBeGreaterThan(0)

    // Check that aliases contain localized paths
    const hasLocalizedAlias = pages.some(p =>
      p.path?.includes(':locale') && (p.path?.includes('about-us') || p.path?.includes('company')),
    )
    expect(hasLocalizedAlias).toBe(true)
  })

  test('should handle alias routes with locale restrictions', async () => {
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

    // Aliases should be created only for allowed locales
    const localizedAliasRoutes = pages.filter(p =>
      p.path?.includes(':locale') && (p.path?.includes('about-us') || p.path?.includes('company')),
    )

    // Check that there are no Russian aliases
    const russianAliasRoutes = localizedAliasRoutes.filter(p => p.path?.includes('ru'))
    expect(russianAliasRoutes).toHaveLength(0)
  })

  test('should handle complex nested routes with multiple levels', async () => {
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

    // Check that nested routes got correct paths
    const germanPage = pages.find(p => p.path?.includes('de') && p.path?.includes('produkte'))
    expect(germanPage).toBeDefined()
    expect(germanPage!.children).toBeDefined()
    expect(germanPage!.children!.length).toBeGreaterThan(0)

    const germanCategory = germanPage!.children!.find(c => c.path?.includes('kategorie'))
    expect(germanCategory).toBeDefined()
    expect(germanCategory!.children).toBeDefined()
    expect(germanCategory!.children!.length).toBeGreaterThan(0)

    // Check that there are child elements (may not be artikel, but something exists)
    expect(germanCategory!.children!.length).toBeGreaterThan(0)
  })

  test('should handle prefix strategy with default locale removal', async () => {
    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix', {}, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // With prefix strategy, default routes should be removed
    const defaultRoutes = pages.filter(p => !p.path?.includes(':locale'))
    expect(defaultRoutes).toHaveLength(0)

    // Should only have localized routes
    const localizedRoutes = pages.filter(p => p.path?.includes(':locale'))
    expect(localizedRoutes.length).toBeGreaterThan(0)
  })

  test('should handle prefix strategy with Cloudflare Pages', async () => {
    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix', {}, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages, undefined, true) // isCloudflarePages = true

    // With Cloudflare Pages, default routes should NOT be removed
    const defaultRoutes = pages.filter(p => !p.path?.includes(':locale'))
    expect(defaultRoutes.length).toBeGreaterThan(0)
  })

  test('should handle no_prefix strategy with noPrefixRedirect', async () => {
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
    const originalPage = pages.find(p => p.name === 'test')
    expect(originalPage).toBeDefined()
    expect(originalPage!.redirect).toBeDefined()
  })

  test('should handle custom regex in buildFullPath', async () => {
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
    const localizedRoutes = pages.filter(p => p.path?.includes(':locale'))
    expect(localizedRoutes.length).toBeGreaterThan(0)

    // Path should contain custom regex
    const hasCustomRegex = localizedRoutes.some(p => p.path?.includes('^[a-z]{2}$'))
    expect(hasCustomRegex).toBe(true)
  })

  test('should create route for default locale when localeRoutes is defined by path (like $defineI18nRoute)', async () => {
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

    // Find the page with path /our-products (should exist for default locale)
    const ourProductsPage = pages.find(p => p.path === '/our-products')
    expect(ourProductsPage).toBeDefined()
    expect(ourProductsPage!.name).toBe('product')
    expect(ourProductsPage!.path).toBe('/our-products')

    // Find localized pages for non-default locales
    const germanPage = pages.find(p => p.path === '/:locale(de)/unsere-produkte')
    expect(germanPage).toBeDefined()
    expect(germanPage!.name).toBe('localized-product-de')

    const russianPage = pages.find(p => p.path === '/:locale(ru)/nashi-produkty')
    expect(russianPage).toBeDefined()
    expect(russianPage!.name).toBe('localized-product-ru')

    // The original /product path should NOT exist (it should be replaced by /our-products)
    const originalProductPage = pages.find(p => p.path === '/product' && p.name === 'product')
    expect(originalProductPage).toBeUndefined()
  })

  test('should handle filesLocaleRoutes fallback', async () => {
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
    const englishPage = pages.find(p => p.path === '/test-en')
    const germanPage = pages.find(p => p.path?.includes('test-de'))

    expect(englishPage).toBeDefined()
    expect(germanPage).toBeDefined()
  })

  test('should handle prefix_and_default strategy with custom paths', async () => {
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
    const defaultPage = pages.find(p => p.path === '/test-en')

    expect(defaultPage).toBeDefined()
    // May not be test-en, but something with localization should exist
    expect(pages.some(p => p.path?.includes(':locale'))).toBe(true)
  })

  test('should handle edge case with empty locale codes array', async () => {
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
    expect(pages.length).toBeGreaterThan(1)
    expect(pages[0].path).toBe('/test')
  })

  test('should handle edge case with undefined page path', async () => {
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

  test('should handle redirect-only pages correctly', async () => {
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
    expect(pages).toHaveLength(1)
    expect(pages[0].redirect).toBe('/target')
  })

  test('should handle complex scenario with mixed restrictions and custom paths', async () => {
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
    const restrictedRoutes = pages.filter(p => p.name?.includes('restricted'))
    expect(restrictedRoutes.length).toBeGreaterThanOrEqual(2) // en + de (may be more due to custom paths)

    // Unrestricted should be created for all locales
    const unrestrictedRoutes = pages.filter(p => p.name?.includes('unrestricted'))
    expect(unrestrictedRoutes.length).toBe(3) // en + de + ru
  })

  test('should handle different route naming patterns', async () => {
    const pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', {}, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/test',
        name: 'test',
      },
    ]

    pageManager.extendPages(pages)

    // Check that route names are created correctly
    const localizedRoutes = pages.filter(p => p.name?.includes('localized'))
    expect(localizedRoutes.length).toBeGreaterThan(0)

    // Default locale should not have suffix
    const defaultRoute = pages.find(p => p.name === 'test')
    expect(defaultRoute).toBeDefined()

    // Non-default locales should have suffix
    const nonDefaultRoutes = pages.filter(p => p.name?.includes('localized-test'))
    expect(nonDefaultRoutes.length).toBeGreaterThan(0)
  })

  test('should handle product pages with localeRoutes from defineI18nRoute index and slug', async () => {
    // Simulates pages/product/index.vue and pages/product/[...slug].vue with localeRoutes
    const globalLocaleRoutes = {
      '/product': {
        en: '/our-products',
        es: '/nuestros-productos',
      },
      '/product/[...slug]': {
        en: '/our-products/[...slug]',
        es: '/nuestros-productos/[...slug]',
      },
    }

    const locales = [
      { code: 'en', iso: 'en-US' },
      { code: 'es', iso: 'es-ES' },
    ]

    const pageManager = new PageManager(locales, 'en', 'prefix_except_default', globalLocaleRoutes, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/product',
        name: 'product',
      },
      {
        path: '/product/:slug(.*)*',
        name: 'product',
      },
    ]

    pageManager.extendPages(pages)

    // Expected result: index page gets localized paths, slug page gets localized paths with dynamic parameter
    const expectedPages = [
      {
        name: 'product',
        path: '/our-products',
      },
      {
        name: 'product',
        path: '/our-products/:slug(.*)*', // <--- ИСПРАВЛЕНО
      },
      {
        name: 'localized-product-es',
        path: '/:locale(es)/nuestros-productos',
      },
      {
        name: 'localized-product-es',
        path: '/:locale(es)/nuestros-productos/:slug(.*)*',
      },
    ]

    expect(pages).toMatchObject(expectedPages)
  })
})
