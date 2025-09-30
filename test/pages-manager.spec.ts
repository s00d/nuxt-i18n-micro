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
    pageManager = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, false)
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
    // Устанавливаем флаг includeDefaultLocaleRoute в true
    const pageManagerWithDefaultLocale = new PageManager(locales, defaultLocaleCode, 'prefix', undefined, {}, false)

    const pages: NuxtPage[] = [{
      path: '/activity',
      name: 'ActivityParent',
      children: [{ path: 'skiing', name: 'Skiing' }],
    }]

    // Расширяем страницы
    pageManagerWithDefaultLocale.extendPages(pages)
    // Проверяем корректность обработки маршрута для дефолтной локали
    expect(pages[0].path).toBe('/:locale(en|de|ru)/activity')

    // Проверяем, что добавлены маршруты для всех локалей, включая дефолтную
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
    const pageManagerWithGlobalRoutes = new PageManager(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, false)

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

    // Assert that the pages array matches the expected structure
    expect(pages).toEqual(expectedPages)
  })

  test('should handle prefix_and_default strategy correctly', async () => {
    const pageManagerPrefixAndDefault = new PageManager(locales, defaultLocaleCode, 'prefix_and_default', undefined, {}, false)

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
        { path: 'skiing', name: 'Skiing', children: [] },
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
    const pageManagerPrefixAndDefault = new PageManager(locales, defaultLocaleCode, 'no_prefix', globalLocaleRoutes, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/activity',
        name: 'activity',
        children: [{ path: 'skiing', name: 'Skiing' }],
      },
    ]

    // Extend pages
    pageManagerPrefixAndDefault.extendPages(pages)

    expect(pages).toHaveLength(4) // Routes for default and non-default locales

    // Check default locale route
    expect(pages[0].path).toBe('/activity')
    expect(pages[1].path).toBe('/custom-activity-en')
    expect(pages[2].path).toBe('/custom-activity-de')
    expect(pages[3].path).toBe('/custom-activity-ru')
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

    // Создаем filesLocaleRoutes на основе содержимого файлов
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

    const pageManager = new PageManager(locales, 'en', 'no_prefix', {}, filesLocaleRoutes, false)

    // Вызываем метод extractLocalizedPaths
    const localizedPaths = pageManager.extractLocalizedPaths(mockPages)

    // Проверяем результат
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
})
