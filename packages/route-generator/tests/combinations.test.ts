import type { NuxtPage } from '@nuxt/schema'
import { RouteGenerator } from '../src/index'
import { locales, defaultLocaleCode, createBasicPages, createNestedPages, createManager } from './helpers'

describe('RouteGenerator - Complex combinations (globalLocaleRoutes + filesLocaleRoutes + routeLocales)', () => {
  test('globalLocaleRoutes overrides filesLocaleRoutes for same path', () => {
    const globalLocaleRoutes = { '/about': { en: '/from-global', de: '/aus-global' } }
    const filesLocaleRoutes = { '/about': { en: '/from-file', de: '/aus-datei', ru: '/iz-fajla' } }
    const generator = new RouteGenerator(
      locales,
      defaultLocaleCode,
      'prefix_except_default',
      globalLocaleRoutes,
      filesLocaleRoutes,
      {},
      false,
    )
    const pages: NuxtPage[] = [{ path: '/about', name: 'about' }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('filesLocaleRoutes used when globalLocaleRoutes has no entry for path', () => {
    const globalLocaleRoutes = { '/contact': { en: '/contact-us' } }
    const filesLocaleRoutes = { '/about': { en: '/about-us', de: '/ueber-uns' } }
    const generator = createManager('prefix_except_default', globalLocaleRoutes, {}, false, [], filesLocaleRoutes)
    const pages: NuxtPage[] = [
      { path: '/about', name: 'about' },
      { path: '/contact', name: 'contact' },
    ]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('routeLocales restricts which locales get routes even with globalLocaleRoutes and filesLocaleRoutes', () => {
    const globalLocaleRoutes = {
      '/shop': { en: '/shop', de: '/geschaeft', ru: '/magazin' },
    }
    const filesLocaleRoutes = {
      '/shop/product': { en: '/product', de: '/produkt' },
    }
    const routeLocales = { '/shop': ['en', 'de'], '/shop/product': ['en'] }
    const generator = new RouteGenerator(
      locales,
      defaultLocaleCode,
      'prefix_except_default',
      globalLocaleRoutes,
      filesLocaleRoutes,
      routeLocales,
      false,
    )
    const pages: NuxtPage[] = [
      {
        path: '/shop',
        name: 'shop',
        children: [{ path: 'product', name: 'shop-product' }],
      },
    ]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('all three: globalLocaleRoutes + filesLocaleRoutes + routeLocales on different pages', () => {
    const globalLocaleRoutes = {
      '/page-a': { en: '/page-a', de: '/seite-a' },
    }
    const filesLocaleRoutes = {
      '/page-b': { en: '/page-b', ru: '/stranica-b' },
    }
    const routeLocales = {
      '/page-a': ['en', 'de'],
      '/page-b': ['en', 'ru'],
      '/page-c': ['en'],
    }
    const generator = new RouteGenerator(
      locales,
      defaultLocaleCode,
      'prefix_except_default',
      globalLocaleRoutes,
      filesLocaleRoutes,
      routeLocales,
      false,
    )
    const pages: NuxtPage[] = [
      { path: '/page-a', name: 'page-a' },
      { path: '/page-b', name: 'page-b' },
      { path: '/page-c', name: 'page-c' },
    ]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('globalLocaleRoutes false + filesLocaleRoutes + routeLocales: disabled page not localized', () => {
    const globalLocaleRoutes = { '/disabled': false }
    const filesLocaleRoutes = { '/disabled': { en: '/off', de: '/aus' } }
    const routeLocales = { '/disabled': ['en', 'de'] }
    const generator = createManager('prefix_except_default', globalLocaleRoutes, routeLocales, false, [], filesLocaleRoutes)
    const pages: NuxtPage[] = [{ path: '/disabled', name: 'disabled' }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('nested: parent from globalLocaleRoutes, child from filesLocaleRoutes, routeLocales on both', () => {
    const globalLocaleRoutes = {
      '/catalog': { en: '/catalog', de: '/katalog' },
    }
    const filesLocaleRoutes = {
      '/catalog/item': { en: '/item', de: '/artikel' },
    }
    const routeLocales = {
      '/catalog': ['en', 'de'],
      '/catalog/item': ['en', 'de'],
    }
    const generator = new RouteGenerator(
      locales,
      defaultLocaleCode,
      'prefix_except_default',
      globalLocaleRoutes,
      filesLocaleRoutes,
      routeLocales,
      false,
    )
    const pages: NuxtPage[] = [
      {
        path: '/catalog',
        name: 'catalog',
        children: [{ path: 'item', name: 'catalog-item' }],
      },
    ]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('prefix_and_default with globalLocaleRoutes + routeLocales combination', () => {
    const globalLocaleRoutes = {
      '/pricing': { en: '/pricing', de: '/preise', ru: '/ceny' },
    }
    const routeLocales = { '/pricing': ['en', 'de'] }
    const generator = createManager('prefix_and_default', globalLocaleRoutes, routeLocales)
    const pages: NuxtPage[] = [{ path: '/pricing', name: 'pricing' }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('no_prefix with globalLocaleRoutes + filesLocaleRoutes + noPrefixRedirect', () => {
    const globalLocaleRoutes = {
      '/home': { en: '/home', de: '/start' },
    }
    const filesLocaleRoutes = {
      '/home': { ru: '/glavnaya' },
    }
    const generator = new RouteGenerator(
      locales,
      defaultLocaleCode,
      'no_prefix',
      globalLocaleRoutes,
      filesLocaleRoutes,
      {},
      true,
    )
    const pages: NuxtPage[] = [{ path: '/home', name: 'home' }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('mixed: one page global false, one page global+files, one page only routeLocales', () => {
    const globalLocaleRoutes = {
      '/no-i18n': false,
      '/hybrid': { en: '/hybrid-en', de: '/hybrid-de' },
    }
    const filesLocaleRoutes = {
      '/hybrid': { ru: '/hybrid-ru' },
    }
    const routeLocales = { '/only-restrict': ['en', 'ru'] }
    const generator = new RouteGenerator(
      locales,
      defaultLocaleCode,
      'prefix_except_default',
      globalLocaleRoutes,
      filesLocaleRoutes,
      routeLocales,
      false,
    )
    const pages: NuxtPage[] = [
      { path: '/no-i18n', name: 'no-i18n' },
      { path: '/hybrid', name: 'hybrid' },
      { path: '/only-restrict', name: 'only-restrict' },
    ]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('extractLocalizedPaths: global + files merge, then extendPages uses merged localizedPaths', () => {
    const globalLocaleRoutes = { '/a': { en: '/a-en' } }
    const filesLocaleRoutes = { '/b': { en: '/b-en' }, '/a': { de: '/a-de-file' } }
    const generator = new RouteGenerator(
      locales,
      defaultLocaleCode,
      'prefix_except_default',
      globalLocaleRoutes,
      filesLocaleRoutes,
      {},
      false,
    )
    const pages: NuxtPage[] = [
      { path: '/a', name: 'a' },
      { path: '/b', name: 'b' },
    ]
    const extracted = generator.extractLocalizedPaths(pages)
    expect(extracted).toMatchSnapshot()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })
})
