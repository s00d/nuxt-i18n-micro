import type { NuxtPage } from '@nuxt/schema'
import { createBasicPages, createManager, createNestedPages } from './helpers'

describe('RouteGenerator - General Functionality (Cross-Strategy)', () => {
  test('21. should exclude routes based on `excludePatterns`', () => {
    const pages = [...createBasicPages(), { path: '/admin', name: 'admin' }, { path: '/api/users', name: 'api-users' }]
    const manager = createManager('prefix_except_default', {}, {}, false, ['/admin', /^\/api/])
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('22. should correctly localize aliases', () => {
    const pages: NuxtPage[] = [{ path: '/about', name: 'about', alias: ['/about-us', '/company'] }]
    const manager = createManager('prefix_except_default')
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('23. should handle deep nesting with custom paths at different levels', () => {
    const pages = createNestedPages()
    const manager = createManager('prefix', {
      '/parent': { de: '/eltern' },
      '/parent/child/grandchild': { de: '/grosskind' },
    })
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('24. should handle catch-all routes correctly', () => {
    const pages: NuxtPage[] = [{ path: '/:slug(.*)*', name: 'catch-all' }]
    const manager = createManager('prefix')
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('25. should combine `routeLocales` and `globalLocaleRoutes` correctly', () => {
    const pages = createBasicPages()
    const manager = createManager('prefix_except_default', { '/about': { de: '/ueber-uns', ru: '/o-nas' } }, { '/about': ['en', 'de'] })
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('26. should handle pages with no name property', () => {
    const pages: NuxtPage[] = [{ path: '/no-name' }]
    const manager = createManager('prefix')
    expect(() => manager.extendPages(pages)).not.toThrow()
    expect(pages.length).toBeGreaterThan(0)
    pages.forEach((page) => {
      expect(page.name).toBeDefined()
      expect(typeof page.name).toBe('string')
    })
  })

  test('27. should not localize redirect-only pages', () => {
    const pages: NuxtPage[] = [{ path: '/old', redirect: '/new' }]
    const manager = createManager('prefix_except_default')
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('28. should correctly generate names for nested localized routes', () => {
    const pages = createNestedPages()
    const manager = createManager('prefix')
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('29. should correctly handle custom path for a child but not for the parent', () => {
    const pages = createNestedPages()
    const manager = createManager('prefix_except_default', {
      '/parent/child': { de: '/kind' },
    })
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('30. should handle custom path for parent and child', () => {
    const pages = createNestedPages()
    const manager = createManager('prefix_except_default', {
      '/parent': { de: '/eltern' },
      '/parent/child': { de: '/eltern/kind' },
    })
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('31. should handle custom path for parent but not for child', () => {
    const pages = createNestedPages()
    const manager = createManager('prefix_except_default', {
      '/parent': { de: '/eltern' },
    })
    manager.extendPages(pages)

    expect(pages).toMatchSnapshot()
  })

  test('32. should handle a page with multiple dynamic segments', () => {
    const pages: NuxtPage[] = [{ path: '/users/:group/:id', name: 'users-group-id' }]
    const manager = createManager('prefix')
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })
})
