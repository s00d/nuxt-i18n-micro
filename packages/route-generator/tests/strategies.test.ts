import type { NuxtPage } from '@nuxt/schema'
import type { Strategies } from '@i18n-micro/types'
import { createBasicPages, createNestedPages, createManager } from './helpers'

describe('RouteGenerator - Strategy: prefix_except_default', () => {
  const strategy: Strategies = 'prefix_except_default'

  test('1. should not prefix default locale for static routes', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy)
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('2. should prefix non-default locales', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy)
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('3. should handle the root route correctly', () => {
    const pages: NuxtPage[] = [{ path: '/', name: 'index' }]
    const manager = createManager(strategy)
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('4. should handle dynamic routes correctly', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy)
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('5. should handle nested routes correctly', () => {
    const pages = createNestedPages()
    const manager = createManager(strategy)
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('6. should apply custom paths from `globalLocaleRoutes`', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy, { '/about': { de: '/ueber-uns' } })
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('7. should respect `routeLocales` to limit available languages for a page', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy, {}, { '/about': ['en', 'de'] })
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('8. should disable localization for a route when set to `false`', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy, { '/about': false })
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })
})

describe('RouteGenerator - Strategy: prefix', () => {
  const strategy: Strategies = 'prefix'

  test('9. should prefix all locales including the default one', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy)
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('10. should handle the root route by prefixing all locales', () => {
    const pages: NuxtPage[] = [{ path: '/', name: 'index' }]
    const manager = createManager(strategy)
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('11. should remove original non-prefixed routes (except for Cloudflare)', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy)
    manager.extendPages(pages, undefined, false)
    expect(pages).toMatchSnapshot()
  })

  test('12. should apply custom paths to all prefixed routes', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy, { '/about': { de: '/ueber-uns', en: '/about-us' } })
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })
})

describe('RouteGenerator - Strategy: prefix_and_default', () => {
  const strategy: Strategies = 'prefix_and_default'

  test('13. should create both prefixed and non-prefixed routes for the default locale', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy)
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('14. should create only prefixed routes for non-default locales', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy)
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('15. should handle the root route correctly', () => {
    const pages: NuxtPage[] = [{ path: '/', name: 'index' }]
    const manager = createManager(strategy)
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('16. should apply a custom path to both default locale routes', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy, { '/about': { en: '/about-us' } })
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })
})

describe('RouteGenerator - Strategy: no_prefix', () => {
  const strategy: Strategies = 'no_prefix'

  test('17. should not create any prefixed routes by default', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy)
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('18. should create additional, separate routes for custom paths', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy, { '/about': { de: '/ueber-uns', ru: '/o-nas' } })
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('19. should add a redirect to the original page if `noPrefixRedirect` is true', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy, { '/about': { en: '/about-us' } }, {}, true)
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('20. should not add a redirect if custom path is for a non-default locale', () => {
    const pages = createBasicPages()
    const manager = createManager(strategy, { '/about': { de: '/ueber-uns' } }, {}, true)
    manager.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })
})
