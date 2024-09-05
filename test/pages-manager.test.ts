import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'
import type { NuxtPage } from '@nuxt/schema'
import type { Locale } from '~/src/types'
import { PageManager } from '~/src/page-manager'

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
const includeDefaultLocaleRoute = false

test.describe('PageManager', () => {
  let pageManager: PageManager

  test.beforeAll(() => {
    pageManager = new PageManager(locales, defaultLocaleCode, includeDefaultLocaleRoute)
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

    const rootDir = '/mocked/root/dir' // Mocked root directory path

    // Extend pages
    pageManager.extendPages(pages, rootDir)

    // Фильтрация оригинальных страниц
    const originalPages = pages.filter(page => !page.path.includes('/:locale'))

    // Проверка оригинальных страниц
    expect(originalPages).toHaveLength(1) // Ожидаем одну исходную страницу
    expect(originalPages[0].path).toBe('/activity')
    expect(originalPages[0].children).toHaveLength(2) // Оригинальные дети

    // Фильтрация локализованных страниц
    const localizedPages = pages.filter(page => page.path.includes('/:locale'))

    // Проверка локализованных страниц
    expect(localizedPages).toHaveLength(1) // Проверяем основное дерево и локализованное дерево
    expect(localizedPages[0].path).toBe('/:locale(de|ru)/activity')
    expect(localizedPages[0].children).toHaveLength(4) // Локализованные дети для каждого языка

    // Проверка детей до 4 уровня вложенности
    const skiingLocalizedChildren = localizedPages[0].children?.find(child => child.name?.includes('Skiing'))?.children
    expect(skiingLocalizedChildren).toHaveLength(2) //  de, ru

    const skiingDetailsLocalized = skiingLocalizedChildren?.[0].children
    expect(skiingDetailsLocalized).toHaveLength(2) // de, ru

    const skiingInfoLocalized = skiingDetailsLocalized?.[0].children
    expect(skiingInfoLocalized).toHaveLength(2) // de, ru

    const skiingDeepInfoLocalized = skiingInfoLocalized?.[0].children
    expect(skiingDeepInfoLocalized).toHaveLength(0) // de, ru
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
    expect(page.children).toHaveLength(1) // Original and localized
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

    const rootDir = '/mocked/root/dir' // Mocked root directory path

    // Extend pages
    pageManager.extendPages(pages, rootDir)

    // Check if the route for the default locale is adjusted correctly
    expect(pages[0].path).toBe('/activity')
    expect(pages[1].path).toBe('/:locale(de|ru)/activity')
    expect(pages[0].children).toHaveLength(1) // Original and localized
    expect(pages[0].children).toEqual(
      expect.arrayContaining([
        { path: 'skiing', name: 'Skiing', children: [] },
      ]),
    )

    expect(pages[1].children).toHaveLength(2)
    expect(pages[1].children).toEqual(
      expect.arrayContaining([
        { path: 'skiing', name: 'localized-Skiing-de', children: [] },
        { path: 'skiing', name: 'localized-Skiing-ru', children: [] },
      ]),
    )
  })
})

test('should include default locale routes when includeDefaultLocaleRoute is true', async () => {
  // Устанавливаем флаг includeDefaultLocaleRoute в true
  const includeDefaultLocaleRoute = true
  const pageManagerWithDefaultLocale = new PageManager(locales, defaultLocaleCode, includeDefaultLocaleRoute)

  const pages: NuxtPage[] = [{
    path: '/activity',
    name: 'ActivityParent',
    children: [{ path: 'skiing', name: 'Skiing' }],
  }]

  const rootDir = '/mocked/root/dir' // Мокированный путь к корневой директории

  // Расширяем страницы
  pageManagerWithDefaultLocale.extendPages(pages, rootDir)
  // Проверяем корректность обработки маршрута для дефолтной локали
  expect(pages[0].path).toBe('/activity')
  expect(pages[1].path).toBe('/:locale(en|de|ru)/activity')

  // Проверяем, что добавлены маршруты для всех локалей, включая дефолтную
  expect(pages[1].children).toHaveLength(3) // en, de, ru
  expect(pages[1].children).toEqual(
    expect.arrayContaining([
      { path: 'skiing', name: 'localized-Skiing-en', children: [] },
      { path: 'skiing', name: 'localized-Skiing-de', children: [] },
      { path: 'skiing', name: 'localized-Skiing-ru', children: [] },
    ]),
  )
})
