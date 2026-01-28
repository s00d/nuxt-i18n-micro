import type { NuxtPage } from '@nuxt/schema'
import { RouteGenerator } from '../src/index'
import { locales, defaultLocaleCode, createBasicPages, createNestedPages, createManager } from './helpers'

describe('RouteGenerator - Advanced Scenarios', () => {
  test('33. should not create route when globalLocaleRoutes defines custom path for locale forbidden in routeLocales', () => {
    const pages = createBasicPages()
    const manager = createManager('prefix_except_default',
      { '/about': { de: '/ueber-uns', ru: '/o-nas' } },
      { '/about': ['en', 'de'] },
    )
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('34. should prioritize globalLocaleRoutes over filesLocaleRoutes', () => {
    const pages: NuxtPage[] = [{ path: '/about', name: 'about' }]
    const manager = new RouteGenerator(
      locales,
      defaultLocaleCode,
      'prefix_except_default',
      { '/about': { en: '/from-global' } },
      { '/about': { en: '/from-file' } },
      {},
      false,
    )
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('35. should handle index.vue in subfolder correctly', () => {
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

  test('36. should handle paths conflicting with locale codes', () => {
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

  test('37. should handle paths with special characters requiring encoding', () => {
    const pages: NuxtPage[] = [
      { path: '/test-path', name: 'test-path' },
      { path: '/test path', name: 'test-space' },
    ]
    const manager = createManager('prefix_except_default')
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('38. should handle parent with custom path but child without', () => {
    const pages = createNestedPages()
    const manager = createManager('prefix_except_default', {
      '/parent': { de: '/eltern' },
    })
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('39. should handle child with custom path but parent without', () => {
    const pages = createNestedPages()
    const manager = createManager('prefix_except_default', {
      '/parent/child': { de: '/kind' },
    })
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('40. should handle child custom path that does not include parent custom path', () => {
    const pages = createNestedPages()
    const manager = createManager('prefix_except_default', {
      '/parent': { de: '/eltern' },
      '/parent/child': { de: '/ganz-anderer-pfad' },
    })
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('41. should handle empty locales array gracefully', () => {
    const pages = createBasicPages()
    const manager = new RouteGenerator(
      [],
      defaultLocaleCode,
      'prefix_except_default',
      {},
      {},
      {},
      false,
    )
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('42. should handle defaultLocale not in locales list', () => {
    const pages = createBasicPages()
    const manager = new RouteGenerator(
      [{ code: 'de', iso: 'de-DE' }, { code: 'ru', iso: 'ru-RU' }],
      'en',
      'prefix_except_default',
      {},
      {},
      {},
      false,
    )
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('43. should handle dynamic segments in custom paths with different param names', () => {
    const pages: NuxtPage[] = [{ path: '/users/:id', name: 'users-id' }]
    const manager = createManager('prefix_except_default', {
      '/users/:id': { de: '/benutzer/:userId' },
    })
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('44. should handle nested routes with restrictions at different levels', () => {
    const pages = createNestedPages()
    const manager = createManager('prefix_except_default', {}, {
      '/parent': ['en', 'de', 'ru'],
      '/parent/child': ['en', 'ru'],
    })
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('45. should handle multiple dynamic segments in custom paths', () => {
    const pages: NuxtPage[] = [{ path: '/users/:group/:id', name: 'users-group-id' }]
    const manager = createManager('prefix_except_default', {
      '/users/:group/:id': { de: '/benutzer/:gruppe/:benutzerId' },
    })
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })
})
