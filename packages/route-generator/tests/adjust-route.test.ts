import type { NuxtPage } from '@nuxt/schema'
import { RouteGenerator } from '../src/index'
import { locales, defaultLocaleCode, createNestedPages } from './helpers'

describe('RouteGenerator - adjustRouteForDefaultLocale', () => {
  test('prefix_except_default: updates page.path from localizedPaths for default locale', () => {
    const globalLocaleRoutes = {
      '/dashboard': { en: '/dashboard', de: '/uebersicht' },
    }
    const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, {}, false)
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
    const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, {}, false)
    const pages = createNestedPages()
    pages[0]!.path = '/parent'
    pages[0]!.name = 'parent'
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('prefix_and_default: adjustRouteForDefaultLocale is no-op (does not change path)', () => {
    const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix_and_default', {}, {}, {}, false)
    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('no_prefix: adjustRouteForDefaultLocale is no-op', () => {
    const generator = new RouteGenerator(locales, defaultLocaleCode, 'no_prefix', {}, {}, {}, false)
    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('direct call adjustRouteForDefaultLocale with custom localizedPaths', () => {
    const globalLocaleRoutes = {
      '/page': { en: '/custom-en', de: '/custom-de' },
    }
    const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix_except_default', globalLocaleRoutes, {}, {}, false)
    const pages: NuxtPage[] = [{ path: '/page', name: 'page', children: [] }]
    generator.extendPages(pages)
    const originalChildren: NuxtPage[] = []
    const page = pages[0]!
    generator.adjustRouteForDefaultLocale(page, originalChildren)
    expect(pages).toMatchSnapshot()
  })
})
