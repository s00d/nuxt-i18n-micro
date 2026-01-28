import path from 'node:path'
import type { NuxtPage } from '@nuxt/schema'
import type { Locale, Strategies, GlobalLocaleRoutes } from '@i18n-micro/types'
import { RouteGenerator } from '../src/index'

export const locales: Locale[] = [
  { code: 'en', iso: 'en-US' },
  { code: 'de', iso: 'de-DE' },
  { code: 'ru', iso: 'ru-RU' },
]

export const defaultLocaleCode = 'en'

export const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures', 'strategy', 'pages')

/** Базовый набор страниц для тестов. */
export function createBasicPages(): NuxtPage[] {
  return [
    { path: '/', name: 'index', file: '/pages/index.vue' },
    { path: '/about', name: 'about', file: '/pages/about.vue' },
    { path: '/users/:id', name: 'users-id', file: '/pages/users/[id].vue' },
    { path: '/:slug(.*)*', name: 'catch-all', file: '/pages/[...slug].vue' },
  ]
}

/** Набор страниц с вложенностью. */
export function createNestedPages(): NuxtPage[] {
  return [
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
}

/** Глубокая вложенность: 4 уровня (section / category / item / detail). */
export function createDeepNestedPages(): NuxtPage[] {
  return [
    {
      path: '/section',
      name: 'section',
      file: '/pages/section.vue',
      children: [
        {
          path: 'category',
          name: 'section-category',
          file: '/pages/section/category.vue',
          children: [
            {
              path: 'item',
              name: 'section-category-item',
              file: '/pages/section/category/item.vue',
              children: [
                {
                  path: 'detail',
                  name: 'section-category-item-detail',
                  file: '/pages/section/category/item/detail.vue',
                },
              ],
            },
          ],
        },
      ],
    },
  ]
}

/** Очень глубокая вложенность: 6 уровней. */
export function createVeryDeepNestedPages(): NuxtPage[] {
  return [
    {
      path: '/a',
      name: 'a',
      file: '/pages/a.vue',
      children: [
        {
          path: 'b',
          name: 'a-b',
          file: '/pages/a/b.vue',
          children: [
            {
              path: 'c',
              name: 'a-b-c',
              file: '/pages/a/b/c.vue',
              children: [
                {
                  path: 'd',
                  name: 'a-b-c-d',
                  file: '/pages/a/b/c/d.vue',
                  children: [
                    {
                      path: 'e',
                      name: 'a-b-c-d-e',
                      file: '/pages/a/b/c/d/e.vue',
                      children: [
                        {
                          path: 'f',
                          name: 'a-b-c-d-e-f',
                          file: '/pages/a/b/c/d/e/f.vue',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ]
}

/** Фабрика для создания RouteGenerator. */
export function createManager(
  strategy: Strategies,
  globalLocaleRoutes: GlobalLocaleRoutes = {},
  routeLocales: Record<string, string[]> = {},
  noPrefixRedirect = false,
  excludePatterns: (string | RegExp)[] = [],
  filesLocaleRoutes: GlobalLocaleRoutes = {},
): RouteGenerator {
  return new RouteGenerator({
    locales,
    defaultLocaleCode,
    strategy,
    globalLocaleRoutes,
    filesLocaleRoutes,
    routeLocales,
    noPrefixRedirect,
    excludePatterns,
  })
}
