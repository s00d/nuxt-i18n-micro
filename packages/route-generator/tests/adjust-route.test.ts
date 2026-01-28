import type { NuxtPage } from '@nuxt/schema'
import { RouteGenerator } from '../src/index'
import { locales, defaultLocaleCode, createNestedPages } from './helpers'

describe('RouteGenerator - default locale behavior in extendPages', () => {
  test('prefix_except_default: updates page.path from localizedPaths for default locale', () => {
    const globalLocaleRoutes = {
      '/dashboard': { en: '/dashboard', de: '/uebersicht' },
    }
    const generator = new RouteGenerator({ locales, defaultLocaleCode, strategy: 'prefix_except_default', globalLocaleRoutes, routeLocales: {}, noPrefixRedirect: false })
    const pages: NuxtPage[] = [{ path: '/dashboard', name: 'dashboard' }]
    generator.extendPages(pages)
    const defaultPage = pages.find(p => (p.path === '/dashboard' || p.path === '/dashboard/') && !p.path?.includes(':locale'))
    expect(defaultPage).toBeDefined()
    expect(pages).toMatchSnapshot()
  })

  test('prefix_except_default with nested: default locale children get adjusted', () => {
    const globalLocaleRoutes = {
      '/parent': { en: '/parent', de: '/eltern' },
      '/parent/child': { en: '/parent/child', de: '/eltern/kind' },
    }
    const generator = new RouteGenerator({ locales, defaultLocaleCode, strategy: 'prefix_except_default', globalLocaleRoutes, routeLocales: {}, noPrefixRedirect: false })
    const pages = createNestedPages()
    pages[0]!.path = '/parent'
    pages[0]!.name = 'parent'
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('prefix_and_default: default locale path is not changed (no-op)', () => {
    const generator = new RouteGenerator({ locales, defaultLocaleCode, strategy: 'prefix_and_default', globalLocaleRoutes: {}, routeLocales: {}, noPrefixRedirect: false })
    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('no_prefix: default locale path is not adjusted (no-op)', () => {
    const generator = new RouteGenerator({ locales, defaultLocaleCode, strategy: 'no_prefix', globalLocaleRoutes: {}, routeLocales: {}, noPrefixRedirect: false })
    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('prefix_except_default: default locale path uses custom globalLocaleRoutes (was direct adjustRouteForDefaultLocale)', () => {
    const globalLocaleRoutes = {
      '/page': { en: '/custom-en', de: '/custom-de' },
    }
    const generator = new RouteGenerator({ locales, defaultLocaleCode, strategy: 'prefix_except_default', globalLocaleRoutes, routeLocales: {}, noPrefixRedirect: false })
    const pages: NuxtPage[] = [{ path: '/page', name: 'page', children: [] }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })
})
