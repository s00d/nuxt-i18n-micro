/**
 * path-strategy on a real vue-router serving the routes route-strategy generates, as in the
 * Nuxt module: every answer must be a URL the router actually serves.
 */
import { RouteGenerator } from '@i18n-micro/route-strategy'
import type { GlobalLocaleRoutes, Locale, Strategies } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'
import { describe, expect, onTestFinished, test, vi } from 'vitest'
import { createMemoryHistory, createRouter, type RouteRecordRaw, type Router } from 'vue-router'
import { createPathStrategy, type PathStrategyContext, type ResolvedRouteLike, type RouteLike } from '../src'

const LOCALES: Locale[] = [
  { code: 'en', displayName: 'English' },
  { code: 'de', displayName: 'Deutsch' },
  { code: 'fr', displayName: 'Français' },
]

const PAGES: NuxtPage[] = [
  { path: '/', name: 'index', file: 'pages/index.vue' },
  { path: '/about', name: 'about', file: 'pages/about.vue' },
  { path: '/blog/:slug()', name: 'blog-slug', file: 'pages/blog/[slug].vue' },
  { path: '/admin', name: 'admin', file: 'pages/admin.vue' },
  { path: '/de-only', name: 'de-only', file: 'pages/de-only.vue' },
  { path: '/page2', name: 'page2', file: 'pages/page2.vue' },
  {
    path: '/account',
    file: 'pages/account.vue',
    children: [
      { path: '', name: 'account', file: 'pages/account/index.vue' },
      { path: 'orders/:id()', name: 'account-orders-id', file: 'pages/account/orders/[id].vue' },
    ],
  },
  { path: '/:slug(.*)*', name: 'slug', file: 'pages/[...slug].vue' },
]

const RULES: GlobalLocaleRoutes = {
  about: { en: '/about-us', de: '/ueber-uns' },
  'blog/[slug]': { de: '/artikel/[slug]' },
  account: { de: '/konto' },
  'account/orders/[id]': { de: 'bestellungen/[id]' },
  admin: false,
  page2: { en: '/custom-page2-en', de: '/custom-page2-de', fr: '/custom-page2-fr' },
}

const toRecord = (page: NuxtPage): RouteRecordRaw =>
  ({
    path: page.path,
    name: page.name,
    meta: page.meta,
    ...(page.redirect ? { redirect: page.redirect } : { component: {} }),
    ...(page.alias?.length ? { alias: page.alias } : {}),
    ...(page.children?.length ? { children: page.children.map(toRecord) } : {}),
  }) as RouteRecordRaw

interface Setup {
  router: Router
  i18n: ReturnType<typeof createPathStrategy>
  at: (url: string) => ResolvedRouteLike
  url: (result: RouteLike | string) => string
}

function setup(
  strategy: Strategies,
  ctx: Partial<PathStrategyContext> = {},
  locales: Locale[] = LOCALES,
  {
    pages: source = PAGES,
    routeLocales = {},
    routeDisableMeta,
  }: { pages?: NuxtPage[]; routeLocales?: Record<string, string[]>; routeDisableMeta?: Record<string, boolean | string[]> } = {},
): Setup {
  const pages = structuredClone(source)
  new RouteGenerator({
    locales,
    defaultLocaleCode: 'en',
    strategy,
    globalLocaleRoutes: RULES,
    routeLocales: { 'de-only': ['de'], ...routeLocales },
    routeDisableMeta,
    noPrefixRedirect: false,
  }).extendPages(pages)
  const router = createRouter({ history: createMemoryHistory(), routes: pages.map(toRecord) })
  const resolve = (to: unknown): ResolvedRouteLike => {
    const r = router.resolve(to as Parameters<Router['resolve']>[0])
    return {
      name: r.name === null || r.name === undefined ? null : String(r.name),
      path: r.path,
      fullPath: r.fullPath,
      params: r.params,
      query: r.query,
      hash: r.hash,
    }
  }
  const i18n = createPathStrategy({
    strategy,
    defaultLocale: 'en',
    locales,
    router: { hasRoute: (name) => router.hasRoute(name), resolve, getRoutes: () => router.getRoutes() },
    ...ctx,
  })
  return { router, i18n, at: resolve, url: (result) => (typeof result === 'string' ? result : resolve(result).fullPath) }
}

describe('localeRoute', () => {
  test('by name, from a page in another locale: no locale leaks from the current route', () => {
    const { i18n, at, url } = setup('prefix_except_default')
    const from = at('/de/ueber-uns')
    expect(url(i18n.localeRoute('en', { name: 'about' }, from))).toBe('/about-us')
    expect(url(i18n.localeRoute('fr', { name: 'about' }, from))).toBe('/fr/about')
    expect(url(i18n.localeRoute('de', { name: 'blog-slug', params: { slug: 'x' }, query: { a: '1' }, hash: '#h' }, from))).toBe('/de/artikel/x?a=1#h')
  })

  test('a resolved localized route is that page in the target locale', () => {
    const { i18n, at, url } = setup('prefix')
    const route = at('/de/konto/bestellungen/7?tab=1')
    expect(url(i18n.localeRoute('en', route))).toBe('/en/account/orders/7?tab=1')
    expect(url(i18n.localeRoute('fr', { name: route.name, params: route.params }))).toBe('/fr/account/orders/7')
  })

  test('path strings: default-locale form, another locale form, unknown and unlocalized paths', () => {
    const { i18n } = setup('prefix_except_default')
    expect(i18n.localeRoute('de', '/about-us?x=1').fullPath).toBe('/de/ueber-uns?x=1')
    expect(i18n.localeRoute('en', '/de/artikel/hi').fullPath).toBe('/blog/hi')
    expect(i18n.localeRoute('fr', '/no/such/page').fullPath).toBe('/fr/no/such/page')
    expect(i18n.localeRoute('de', '/admin').fullPath).toBe('/admin')
    expect(i18n.localeRoute('de', '/en/about-us').fullPath).toBe('/de/ueber-uns')
    expect(i18n.localeRoute('fr', '/blog/x?tag=a&tag=b').query).toEqual({ tag: ['a', 'b'] })
    expect({ ...i18n.localeRoute('fr', '/blog/x?constructor=c&__proto__=p').query }).toEqual({ constructor: 'c', __proto__: 'p' })
  })

  test('vue-router never warns about discarded params', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { i18n, at, url } = setup('prefix')
    const from = at('/fr/blog/hi')
    for (const locale of ['en', 'de', 'fr']) for (const name of ['index', 'about', 'account']) url(i18n.localeRoute(locale, { name }, from))
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('switchLocaleRoute', () => {
  test('keeps params, query and hash; i18nRouteParams replace params per locale', () => {
    const { i18n, at, url } = setup('prefix_except_default')
    const route = at('/blog/hello?q=1#top')
    expect(url(i18n.switchLocaleRoute('en', 'de', route))).toBe('/de/artikel/hello?q=1#top')
    expect(url(i18n.switchLocaleRoute('en', 'de', route, { i18nRouteParams: { de: { slug: 'hallo' } } }))).toBe('/de/artikel/hallo?q=1#top')
  })

  test('catch-all keeps its segments; unlocalized pages stay', () => {
    const { i18n, at, url } = setup('prefix_and_default')
    expect(url(i18n.switchLocaleRoute('en', 'fr', at('/en/x/y')))).toBe('/fr/x/y')
    const admin = at('/admin')
    expect(i18n.switchLocaleRoute('en', 'de', admin)).toBe(admin)
  })

  test("a page not served in the target locale leads to that locale's home, never another locale's page", () => {
    const { i18n, at, url } = setup('prefix_except_default')
    expect(url(i18n.switchLocaleRoute('de', 'fr', at('/de/de-only')))).toBe('/fr')
    expect(url(i18n.switchLocaleRoute('de', 'en', at('/de/de-only')))).toBe('/')
    const prefix = setup('prefix', {}, LOCALES, { routeLocales: { 'blog/[slug]': ['de', 'en'] } })
    expect(prefix.url(prefix.i18n.localeRoute('fr', { name: 'blog-slug', params: { slug: 'x' } }))).toBe('/fr')
    expect(prefix.url(prefix.i18n.localeRoute('fr', '/de/artikel/x'))).toBe('/fr')
    expect(prefix.url(prefix.i18n.localeRoute('de', { name: 'blog-slug', params: { slug: 'x' } }))).toBe('/de/artikel/x')
  })

  test('an unmatched URL (a 404 page) switches to the same URL in the target locale', () => {
    const pages = PAGES.filter((p) => p.name !== 'slug')
    // `at()` resolves a URL no record matches: vue-router's "No match" warning is expected here
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    onTestFinished(() => warn.mockRestore())
    const pad = setup('prefix_and_default', {}, LOCALES, { pages })
    expect(pad.i18n.switchLocaleRoute('de', 'fr', pad.at('/de/x/y?q=1')).fullPath).toBe('/fr/x/y?q=1')
    const pxd = setup('prefix_except_default', {}, LOCALES, { pages })
    expect(pxd.i18n.switchLocaleRoute('en', 'en', pxd.at('/en')).fullPath).toBe('/')
    expect(pxd.i18n.switchLocaleRoute('en', 'de', pxd.at('/en/about-us')).fullPath).toBe('/de/ueber-uns')
    // an unnamed route that matched records (a vue-router route) is not a 404: it stays
    const matched = { ...pxd.at('/en'), matched: [{}] }
    expect(pxd.i18n.switchLocaleRoute('en', 'de', matched)).toBe(matched)
    // no record serves it, but the server plugin still moves it to the preferred locale (pages: false relies on it)
    expect(pxd.i18n.getClientRedirect('/no/page', 'de')).toBe('/de/no/page')
    expect(pxd.i18n.getClientRedirect('/no/page', 'en')).toBeNull()
  })

  test('baseUrl locales give absolute URLs; baseDefault drops the prefix', () => {
    const locales: Locale[] = [
      { code: 'en' },
      { code: 'de', baseUrl: 'https://example.de/', baseDefault: true },
      { code: 'fr', baseUrl: 'https://example.fr' },
    ]
    const { i18n, at } = setup('prefix_except_default', {}, locales)
    expect(i18n.switchLocaleRoute('en', 'de', at('/about-us?q=1'))).toBe('https://example.de/ueber-uns?q=1')
    expect(i18n.switchLocaleRoute('en', 'fr', at('/about-us'))).toBe('https://example.fr/fr/about')
    expect(i18n.localeRoute('de', { name: 'index' }).fullPath).toBe('https://example.de/')
  })

  test('no_prefix: the same URL unless the locale has its own path', () => {
    const { i18n, at, url } = setup('no_prefix')
    expect(url(i18n.switchLocaleRoute('en', 'de', at('/about')))).toBe('/ueber-uns')
    expect(url(i18n.switchLocaleRoute('de', 'fr', at('/ueber-uns')))).toBe('/about')
  })
})

describe('reading a URL', () => {
  test('getCurrentLocale / getCurrentLocaleName', () => {
    const { i18n, at } = setup('prefix_except_default')
    expect(i18n.getCurrentLocale(at('/de/ueber-uns'))).toBe('de')
    expect(i18n.getCurrentLocale(at('/about-us'))).toBe('en')
    expect(i18n.getCurrentLocaleName(at('/fr'))).toBe('Français')
    expect(setup('prefix_and_default').i18n.getCurrentLocale(setup('prefix_and_default').at('/'), 'fr')).toBe('fr')
    expect(setup('no_prefix').i18n.getCurrentLocale(setup('no_prefix').at('/ueber-uns'), 'de')).toBe('de')
    expect(setup('prefix', { hashMode: true }).i18n.getCurrentLocale(setup('prefix').at('/de'), null)).toBe('en')
  })

  test('getRouteBaseName / getPluginRouteName', () => {
    const { i18n, at } = setup('prefix')
    expect(i18n.getRouteBaseName(at('/de/konto/bestellungen/1'))).toBe('account-orders-id')
    expect(i18n.getRouteBaseName({ path: '/fr/about' })).toBe('about')
    expect(i18n.getRouteBaseName(at('/admin'))).toBe('admin')
    expect(i18n.getPluginRouteName(at('/de/ueber-uns'), 'de')).toBe('about')
    expect(i18n.getPluginRouteName({ name: 'localized-gone-de', path: '/x', fullPath: '/x' }, 'de')).toBe('gone')
    // an unnamed route: the same page lookup getRouteBaseName does
    expect(i18n.getPluginRouteName({ name: null, path: '/fr/about', fullPath: '/fr/about' }, 'fr')).toBe('about')
    expect(setup('prefix', { disablePageLocales: true }).i18n.getPluginRouteName(at('/de/ueber-uns'), 'de')).toBe('index')
  })

  test('getLocaleFromPath / resolveLocaleFromPath', () => {
    const pxd = setup('prefix_except_default').i18n
    expect(pxd.getLocaleFromPath('/de/x?y=1')).toBe('de')
    expect(pxd.getLocaleFromPath('/xx/x')).toBeNull()
    expect(pxd.resolveLocaleFromPath('/x')).toBe('en')
    expect(setup('prefix').i18n.resolveLocaleFromPath('/x')).toBeNull()
    expect(setup('no_prefix').i18n.resolveLocaleFromPath('/de/x')).toBeNull()
  })
})

describe('server redirects and 404', () => {
  test('shouldReturn404', () => {
    const pxd = setup('prefix_except_default').i18n
    expect(pxd.shouldReturn404('/en')).toBe('Default locale should not have prefix')
    expect(pxd.shouldReturn404('/en/about-us')).toBe('Default locale should not have prefix')
    expect(pxd.shouldReturn404('/de/admin')).toBe('Unlocalized route cannot have locale prefix')
    expect(pxd.shouldReturn404('/fr/de-only')).toBe('Locale not allowed for this route')
    expect(pxd.shouldReturn404('/de/ueber-uns?x=1')).toBeNull()
    expect(pxd.shouldReturn404('/fr/missing')).toBeNull()
    // the rest is read as written: `/de/de-only` is not the de-only page in fr
    expect(pxd.shouldReturn404('/fr/de/de-only')).toBeNull()
    expect(setup('prefix').i18n.shouldReturn404('/en/admin')).toBe('Unlocalized route cannot have locale prefix')
    expect(setup('no_prefix').i18n.shouldReturn404('/de/admin')).toBeNull()
  })

  test('getClientRedirect: unprefixed URLs to the preferred locale, prefixed ones stay', () => {
    const pxd = setup('prefix_except_default').i18n
    expect(pxd.getClientRedirect('/about-us', 'de')).toBe('/de/ueber-uns')
    expect(pxd.getClientRedirect('/about-us', 'en')).toBeNull()
    expect(pxd.getClientRedirect('/about', 'en')).toBe('/about-us')
    expect(pxd.getClientRedirect('/', 'fr')).toBe('/fr')
    expect(pxd.getClientRedirect('/de/ueber-uns', 'fr')).toBeNull()
    expect(pxd.getClientRedirect('/admin', 'de')).toBeNull()
    const prefix = setup('prefix').i18n
    expect(prefix.getClientRedirect('/', 'en')).toBe('/en')
    expect(prefix.getClientRedirect('/about', 'de')).toBe('/de/ueber-uns')
    expect(prefix.getClientRedirect('/blog/hi', 'de')).toBe('/de/artikel/hi')
    expect(prefix.getClientRedirect('/account/orders/3', 'fr')).toBe('/fr/account/orders/3')
    // every locale has its own path: the original URL is only known from the redirect record
    expect(prefix.getClientRedirect('/page2', 'en')).toBe('/en/custom-page2-en')
    expect(prefix.getClientRedirect('/page2', 'de')).toBe('/de/custom-page2-de')
    expect(setup('prefix_and_default').i18n.getClientRedirect('/', 'de')).toBeNull()
    expect(setup('prefix', {}, LOCALES).i18n.getClientRedirect('/no/page', 'de')).toBe('/de/no/page')
    expect(setup('no_prefix').i18n.getClientRedirect('/about', 'de')).toBeNull()
  })
})

test('setRouter rebuilds the index for the new routes', () => {
  const a = setup('prefix')
  const b = setup('prefix_except_default')
  a.i18n.setRouter({ hasRoute: (n) => b.router.hasRoute(n), resolve: b.at, getRoutes: () => b.router.getRoutes() })
  expect(a.url(a.i18n.localeRoute('de', { name: 'about' }))).toBe('/de/ueber-uns')
})

describe('page facts from meta.i18n', () => {
  test('pageLocales: every locale the page is served in, from any of its records', () => {
    const { i18n, at } = setup('prefix_except_default')
    expect(i18n.pageLocales(at('/de/ueber-uns'))?.sort()).toEqual(['de', 'en', 'fr'])
    expect(i18n.pageLocales(at('/de/de-only'))).toEqual(['de'])
    expect(i18n.pageLocales({ path: '/de/ueber-uns' })?.sort()).toEqual(['de', 'en', 'fr'])
    expect(i18n.pageLocales({ name: 'admin' })).toBeNull()
  })

  test('isMetaDisabled: disableMeta reaches every record, custom paths included', () => {
    const { i18n, at } = setup('prefix_except_default', {}, LOCALES, { routeDisableMeta: { '/about': true, '/': ['de'] } })
    expect(i18n.isMetaDisabled(at('/about-us'), 'en')).toBe(true)
    expect(i18n.isMetaDisabled(at('/de/ueber-uns'), 'de')).toBe(true)
    expect(i18n.isMetaDisabled(at('/de'), 'de')).toBe(true)
    expect(i18n.isMetaDisabled(at('/'), 'en')).toBe(false)
  })

  test('isMetaDisabled: an unlocalized page reads it from its own record (meta.i18nNoMeta)', () => {
    const { i18n } = setup('prefix')
    expect(i18n.isMetaDisabled({ name: 'admin', meta: { i18nNoMeta: true } }, 'de')).toBe(true)
    expect(i18n.isMetaDisabled({ name: 'admin', meta: {} }, 'de')).toBe(false)
  })
})

describe('redirects', () => {
  test('switchPrefixed (autoDetectPath "*") moves a prefixed URL to the same page in the preferred locale', () => {
    const { i18n } = setup('prefix_except_default')
    expect(i18n.getClientRedirect('/de/ueber-uns', 'fr', { switchPrefixed: true })).toBe('/fr/about')
    expect(i18n.getClientRedirect('/de/ueber-uns', 'en', { switchPrefixed: true })).toBe('/about-us')
    expect(i18n.getClientRedirect('/de/ueber-uns', 'fr')).toBeNull()
    // a page the preferred locale does not serve stays
    expect(i18n.getClientRedirect('/de/de-only', 'fr', { switchPrefixed: true })).toBeNull()
  })

  test('an unprefixed page the preferred locale does not serve is not redirected to a 404', () => {
    const { i18n } = setup('prefix_except_default', {}, LOCALES, { routeLocales: { about: ['en'] } })
    expect(i18n.getClientRedirect('/about-us', 'de')).toBeNull()
  })

  test('customRegexMatcher: a locale-like first segment that is no locale is a 404', () => {
    const { i18n } = setup('prefix', { customRegexMatcher: '[a-z]{2}' })
    expect(i18n.shouldReturn404('/xx/about')).toBe('Unknown locale')
    expect(i18n.shouldReturn404('/de/ueber-uns')).toBeNull()
    expect(i18n.shouldReturn404('/about-long')).toBeNull()
  })
})

describe('shared route table', () => {
  test('strategies over the same routes (one per SSR request) share the index and the URL caches', () => {
    const first = setup('prefix_except_default')
    const { router } = first
    const adapter = {
      hasRoute: (name: string) => router.hasRoute(name),
      resolve: first.at as (to: unknown) => ResolvedRouteLike,
      getRoutes: () => router.getRoutes(),
    }
    const second = createPathStrategy({ strategy: 'prefix_except_default', defaultLocale: 'en', locales: LOCALES, router: adapter })
    first.i18n.localeRoute('de', '/about-us')
    const resolve = vi.spyOn(router, 'resolve')
    expect(second.localeRoute('de', '/about-us').fullPath).toBe('/de/ueber-uns')
    expect(resolve).not.toHaveBeenCalled()
  })
})

describe('stability', () => {
  test('a cached result never shares params / query with another caller (the cache is process-wide)', () => {
    const { i18n } = setup('prefix_except_default')
    const first = i18n.localeRoute('de', { name: 'blog-slug', params: { slug: 'x' }, query: { ref: 'a' } })
    ;(first.params as Record<string, unknown>).slug = 'LEAKED'
    ;(first.query as Record<string, unknown>).ref = 'LEAKED'
    const second = i18n.localeRoute('de', { name: 'blog-slug', params: { slug: 'x' }, query: { ref: 'a' } })
    expect(second.params).toEqual({ locale: 'de', slug: 'x' })
    expect(second.query).toEqual({ ref: 'a' })
  })

  test('a route with neither name nor path is returned as it is', () => {
    const { i18n } = setup('prefix')
    const route = { name: null, path: '', fullPath: '', query: { a: '1' } }
    expect(i18n.switchLocaleRoute('en', 'de', route)).toBe(route)
  })

  test('one route table under two configs keeps two sets of answers', () => {
    const { router } = setup('prefix_except_default')
    const adapter = {
      hasRoute: (name: string) => router.hasRoute(name),
      resolve: (to: unknown) => router.resolve(to as never),
      getRoutes: () => router.getRoutes(),
      options: router.options,
    }
    const en = createPathStrategy({ strategy: 'prefix_except_default', defaultLocale: 'en', locales: LOCALES, router: adapter })
    const de = createPathStrategy({ strategy: 'prefix_except_default', defaultLocale: 'de', locales: LOCALES, router: adapter })
    expect(en.shouldReturn404('/en/about-us')).toBe('Default locale should not have prefix')
    expect(de.shouldReturn404('/en/about-us')).not.toBe('Default locale should not have prefix')
  })
})
