import path from 'node:path'
import type { NuxtPage } from '@nuxt/schema'
import { RouteGenerator } from '../src'
import { locales, defaultLocaleCode, fixturesDir } from './helpers'

describe('RouteGenerator - Basic Functionality', () => {
  describe('Basic Functionality', () => {
    test('should correctly extend pages with localized routes', () => {
      const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, {}, false)
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

      generator.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    test('should handle default locale routes correctly in extendPages', () => {
      const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix_except_default', undefined, {}, {}, false)
      const pages: NuxtPage[] = [{
        path: '/activity',
        name: 'ActivityParent',
        children: [{ path: 'skiing', name: 'Skiing' }],
      }]

      generator.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })

    test('should include default locale routes when strategy is prefix', () => {
      const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix', undefined, {}, {}, false)

      const pages: NuxtPage[] = [{
        path: '/activity',
        name: 'ActivityParent',
        children: [{ path: 'skiing', name: 'Skiing' }],
      }]

      generator.extendPages(pages)

      expect(pages).toMatchSnapshot()
    })
  })

  test('should handle prefix_except_default strategy correctly', () => {
    const globalLocaleRoutes = {
      activity: {
        en: '/custom-activity-en',
        de: '/custom-activity-de',
        ru: '/custom-activity-ru',
      },
      unlocalized: false,
    }

    const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, {}, false)

    const pages: NuxtPage[] = [{
      path: '/activity',
      name: 'activity',
      children: [{ path: 'skiing', name: 'Skiing' }],
    }, {
      path: '/unlocalized',
      name: 'unlocalized',
    }]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle prefix_and_default strategy correctly', () => {
    const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix_and_default', undefined, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/activity',
        name: 'activity',
        children: [{ path: 'skiing', name: 'Skiing' }],
      },
    ]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('should handle no_prefix strategy correctly', () => {
    const globalLocaleRoutes = {
      activity: {
        en: '/custom-activity-en',
        de: '/custom-activity-de',
        ru: '/custom-activity-ru',
      },
    }
    const generator = new RouteGenerator(locales, defaultLocaleCode, 'no_prefix', globalLocaleRoutes, {}, {}, false)

    const pages: NuxtPage[] = [
      {
        path: '/activity',
        name: 'activity',
        children: [{ path: 'skiing', name: 'Skiing' }],
      },
    ]

    generator.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('extractLocalizedPaths should extract localized paths correctly', () => {
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

    const testLocales = [
      { code: 'en' },
      { code: 'fr' },
    ]

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

    const generator = new RouteGenerator(testLocales, 'en', 'no_prefix', {}, filesLocaleRoutes, {}, false)

    const localizedPaths = generator.extractLocalizedPaths(mockPages)

    expect(localizedPaths).toMatchSnapshot()
  })
})
