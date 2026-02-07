import type { GlobalLocaleRoutes, Locale } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'
import {
  buildFullPath,
  buildFullPathNoPrefix,
  buildRouteName,
  cloneArray,
  isInternalPath,
  isLocaleDefault,
  isPageRedirectOnly,
  normalizePath,
  normalizeRouteKey,
  RouteGenerator,
  removeLeadingSlash,
  shouldAddLocalePrefix,
} from '../src/index'
import { createBasicPages, createManager, defaultLocaleCode, locales } from './helpers'

describe('RouteGenerator - Exported utils', () => {
  describe('normalizeRouteKey', () => {
    test('static path unchanged', () => {
      expect(normalizeRouteKey('/about')).toMatchSnapshot()
    })
    test('[id] -> :id', () => {
      expect(normalizeRouteKey('/users/[id]')).toMatchSnapshot()
    })
    test('[...slug] -> :slug(.*)*', () => {
      expect(normalizeRouteKey('/[...slug]')).toMatchSnapshot()
    })
    test('mixed path', () => {
      expect(normalizeRouteKey('/posts/[id]/[...rest]')).toMatchSnapshot()
    })
  })

  describe('normalizePath', () => {
    test('empty string', () => {
      expect(normalizePath('')).toMatchSnapshot()
    })
    test('trailing slash removed', () => {
      expect(normalizePath('/about/')).toMatchSnapshot()
    })
    test('double slash normalized', () => {
      expect(normalizePath('/about//contact')).toMatchSnapshot()
    })
    test('. becomes empty', () => {
      expect(normalizePath('.')).toMatchSnapshot()
    })
  })

  describe('cloneArray', () => {
    test('shallow clone objects', () => {
      const arr = [{ a: 1 }, { b: 2 }]
      const cloned = cloneArray(arr)
      expect(cloned).toMatchSnapshot()
      expect(cloned).not.toBe(arr)
      expect(cloned[0]).not.toBe(arr[0])
    })
  })

  describe('isPageRedirectOnly', () => {
    test('redirect without file is redirect-only', () => {
      const page: NuxtPage = { path: '/x', redirect: '/y' }
      expect(isPageRedirectOnly(page)).toMatchSnapshot()
    })
    test('page with file is not redirect-only', () => {
      const page: NuxtPage = { path: '/x', file: '/pages/x.vue' }
      expect(isPageRedirectOnly(page)).toMatchSnapshot()
    })
  })

  describe('removeLeadingSlash', () => {
    test('removes leading slash', () => {
      expect(removeLeadingSlash('/about')).toMatchSnapshot()
    })
    test('no slash unchanged', () => {
      expect(removeLeadingSlash('about')).toMatchSnapshot()
    })
  })

  describe('buildRouteName', () => {
    test('custom path adds locale suffix', () => {
      expect(buildRouteName('about', 'de', true)).toMatchSnapshot()
    })
    test('non-custom no locale suffix', () => {
      expect(buildRouteName('about', 'en', false)).toMatchSnapshot()
    })
  })

  describe('shouldAddLocalePrefix', () => {
    const defaultLocale: Locale = { code: 'en' }
    test('addLocalePrefix true, default locale -> false', () => {
      expect(shouldAddLocalePrefix('en', defaultLocale, true)).toMatchSnapshot()
    })
    test('addLocalePrefix true, non-default -> true', () => {
      expect(shouldAddLocalePrefix('de', defaultLocale, true)).toMatchSnapshot()
    })
  })

  describe('isLocaleDefault', () => {
    const defaultLocale: Locale = { code: 'en' }
    test('string locale, default -> true', () => {
      expect(isLocaleDefault('en', defaultLocale)).toMatchSnapshot()
    })
    test('object locale', () => {
      expect(isLocaleDefault({ code: 'en' }, defaultLocale)).toMatchSnapshot()
    })
  })

  describe('buildFullPath', () => {
    test('single locale', () => {
      expect(buildFullPath('en', '/about')).toMatchSnapshot()
    })
    test('array of locales', () => {
      expect(buildFullPath(['en', 'de'], '/about')).toMatchSnapshot()
    })
    test('with custom regex', () => {
      expect(buildFullPath(['en', 'de'], '/about', /^[a-z]{2}$/)).toMatchSnapshot()
    })
  })

  describe('buildFullPathNoPrefix', () => {
    test('returns normalized path', () => {
      expect(buildFullPathNoPrefix('/about')).toMatchSnapshot()
    })
  })

  describe('isInternalPath', () => {
    test('__nuxt internal path', () => {
      expect(isInternalPath('/__nuxt/foo')).toMatchSnapshot()
    })
    test('sitemap.xml', () => {
      expect(isInternalPath('/sitemap.xml')).toMatchSnapshot()
    })
    test('robots.txt', () => {
      expect(isInternalPath('/robots.txt')).toMatchSnapshot()
    })
    test('custom excludePatterns string', () => {
      expect(isInternalPath('/admin', ['/admin'])).toMatchSnapshot()
    })
    test('custom excludePatterns regex', () => {
      expect(isInternalPath('/api/users', [/^\/api/])).toMatchSnapshot()
    })
    test('normal path not excluded', () => {
      expect(isInternalPath('/about', [])).toMatchSnapshot()
    })
  })
})

describe('RouteGenerator - Edge cases', () => {
  test('empty pages array: extendPages does nothing', () => {
    const generator = createManager('prefix_except_default')
    const pages: NuxtPage[] = []
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('single locale in config', () => {
    const singleLocale: Locale[] = [{ code: 'en', iso: 'en-US' }]
    const generator = new RouteGenerator({
      locales: singleLocale,
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const pages: NuxtPage[] = [{ path: '/about', name: 'about' }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('constructor with undefined globalLocaleRoutes', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: undefined as unknown as GlobalLocaleRoutes,
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const pages = createBasicPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('constructor with undefined filesLocaleRoutes', () => {
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      filesLocaleRoutes: undefined as unknown as GlobalLocaleRoutes,
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('localizedPaths populated after extendPages', () => {
    const globalLocaleRoutes = { '/about': { en: '/about', de: '/ueber-uns' } }
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes,
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const pages: NuxtPage[] = [{ path: '/about', name: 'about' }]
    generator.extendPages(pages)
    expect(generator.localizedPaths).toMatchSnapshot()
  })

  test('activeLocaleCodes for each strategy', () => {
    const prefixExceptDefault = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const prefix = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const noPrefix = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'no_prefix',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const prefixAndDefault = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_and_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect({
      prefix_except_default: prefixExceptDefault.activeLocaleCodes,
      prefix: prefix.activeLocaleCodes,
      no_prefix: noPrefix.activeLocaleCodes,
      prefix_and_default: prefixAndDefault.activeLocaleCodes,
    }).toMatchSnapshot()
  })

  test('defaultLocale when code not in locales list', () => {
    const generator = new RouteGenerator({
      locales: [{ code: 'de' }, { code: 'ru' }],
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.defaultLocale).toMatchSnapshot()
  })

  test('extendPages with customRegex string pattern', () => {
    const generator = createManager('prefix_except_default', {}, {}, false, [], {}, /^[a-z]{2}(-[a-z]{2})?$/)
    const pages: NuxtPage[] = [{ path: '/test', name: 'test' }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('page with empty path (root)', () => {
    const generator = createManager('prefix_except_default')
    const pages: NuxtPage[] = [{ path: '/', name: 'index' }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('multiple redirect-only pages', () => {
    const generator = createManager('prefix_except_default')
    const pages: NuxtPage[] = [
      { path: '/r1', redirect: '/t1' },
      { path: '/r2', redirect: '/t2' },
    ]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('excludePatterns: string and RegExp together', () => {
    const generator = createManager('prefix_except_default', {}, {}, false, ['/admin', /^\/api\//])
    const pages: NuxtPage[] = [
      { path: '/public', name: 'public' },
      { path: '/admin', name: 'admin' },
      { path: '/api/health', name: 'api-health' },
    ]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('globalLocaleRoutes with Nuxt-style [id] key normalizes to :id', () => {
    const globalLocaleRoutes = {
      '/users/[id]': { en: '/users/:id', de: '/benutzer/:id' },
    }
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes,
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const pages: NuxtPage[] = [{ path: '/users/[id]', name: 'users-id' }]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })
})
