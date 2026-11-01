/**
 * path-strategy on a real vue-router serving the routes route-strategy generates, as in the
 * Nuxt module: every answer must be a URL the router actually serves.
 */
import { RouteGenerator } from '@i18n-micro/route-strategy'
import type { GlobalLocaleRoutes, Locale, Strategies } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'
import { describe, expect, onTestFinished, test, vi } from 'vitest'
import { reactive, readonly, ref, shallowRef } from 'vue'
import { createMemoryHistory, createRouter, type RouteRecordRaw, type Router } from 'vue-router'
import { createPathStrategy, DomainPathStrategy, type PathStrategyContext, type ResolvedRouteLike, type RouteLike } from '../src'

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
    rules = {},
    redirects,
  }: {
    pages?: NuxtPage[]
    routeLocales?: Record<string, string[]>
    routeDisableMeta?: Record<string, boolean | string[]>
    rules?: GlobalLocaleRoutes
    redirects?: boolean
  } = {},
): Setup {
  const pages = structuredClone(source)
  new RouteGenerator({
    locales,
    defaultLocaleCode: ctx.defaultLocale ?? 'en',
    strategy,
    globalLocaleRoutes: { ...RULES, ...rules },
    routeLocales: { 'de-only': ['de'], ...routeLocales },
    routeDisableMeta,
    customRegexMatcher: ctx.customRegexMatcher,
    noPrefixRedirect: false,
    redirects,
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
  const create = locales.some((l) => l.baseUrl) ? (context: PathStrategyContext) => new DomainPathStrategy(context) : createPathStrategy
  const i18n = create({
    strategy,
    defaultLocale: 'en',
    locales,
    router: { hasRoute: (name) => router.hasRoute(name), resolve, getRoutes: () => router.getRoutes() },
    ...ctx,
  })
  return { router, i18n, at: resolve, url: (result) => (typeof result === 'string' ? result : resolve(result).fullPath) }
}

describe('localeRoute', () => {
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

  test('path strings: a flag param, encoded values, a bare hash, an empty query or hash', () => {
    const { i18n } = setup('prefix_except_default')
    const flag = i18n.localeRoute('de', '/about-us?flag')
    expect([flag.query, flag.fullPath]).toEqual([{ flag: '' }, '/de/ueber-uns?flag='])
    expect(i18n.localeRoute('de', '/about-us?redirect=%2Fdashboard%3Ftab%3D1').query).toEqual({ redirect: '/dashboard?tab=1' })
    const hash = i18n.localeRoute('de', '/about-us#frag')
    expect([hash.path, hash.hash, hash.fullPath]).toEqual(['/de/ueber-uns', '#frag', '/de/ueber-uns#frag'])
    // both forms of "nothing": neither reaches fullPath
    expect(i18n.localeRoute('de', '/about-us#').fullPath).toBe('/de/ueber-uns')
    expect(i18n.localeRoute('de', '/about-us?').fullPath).toBe('/de/ueber-uns')
    expect(i18n.localeRoute('de', '/about-us?').query).toEqual({})
  })
})

// `.path` alone hides this: the URL a route object gives is what the router makes of it
describe('a route object in the router gives the URL of its path', () => {
  const VALUES = ['a b', 'a/b', 'a?b', 'a#b', 'a%b', '100%', 'a+b', 'новости', 'c/d?e#f%g h']
  // a `+` means itself in a path
  const ENCODED = (value: string) => encodeURIComponent(value).replace('%2B', '+')

  test.each(VALUES)('a param: %s', async (slug) => {
    const { router, i18n } = setup('prefix_except_default')
    const route = i18n.localeRoute('fr', { name: 'blog-slug', params: { slug } })
    const url = `/fr/blog/${ENCODED(slug)}`
    expect(route.fullPath).toBe(url)
    expect(router.resolve(route as never)).toMatchObject({ fullPath: url, path: url, name: 'localized-blog-slug', params: { locale: 'fr', slug } })
    await router.push(route as never)
    // what a reload reads from the address bar
    const reload = router.resolve(router.currentRoute.value.fullPath)
    expect(router.currentRoute.value).toMatchObject({ fullPath: url, path: reload.path, name: reload.name, params: reload.params })
  })

  test('query and hash stay', () => {
    const { router, i18n } = setup('prefix_except_default')
    const route = i18n.localeRoute('de', { name: 'blog-slug', params: { slug: 'a/b' }, query: { q: 'x y' }, hash: '#top' })
    expect(router.resolve(route as never).fullPath).toBe('/de/artikel/a%2Fb?q=x+y#top')
  })

  test('a catch-all keeps its segments, and escapes what is inside one', () => {
    const { router, i18n } = setup('prefix_except_default')
    const route = i18n.localeRoute('de', { name: 'slug', params: { slug: ['a b', 'c/d', 'e'] } })
    expect(route.fullPath).toBe('/de/a%20b/c%2Fd/e')
    expect(router.resolve(route as never)).toMatchObject({ fullPath: route.fullPath, params: { slug: ['a b', 'c/d', 'e'] } })
  })

  test('an optional param given, and left out; a custom regex param', () => {
    const pages: NuxtPage[] = [
      ...PAGES.filter((page) => page.name === 'index'),
      { path: '/shop/:item?', name: 'shop-item', file: 'pages/shop/[[item]].vue' },
      { path: '/n/:id(\\d+)', name: 'n-id', file: 'pages/n/[id].vue' },
    ]
    const { router, i18n } = setup('prefix_except_default', {}, LOCALES, { pages })
    const given = i18n.localeRoute('de', { name: 'shop-item', params: { item: 'a b' } })
    expect(router.resolve(given as never).fullPath).toBe('/de/shop/a%20b')
    const none = i18n.localeRoute('de', { name: 'shop-item' })
    expect(router.resolve(none as never).fullPath).toBe('/de/shop')
    const custom = i18n.localeRoute('de', { name: 'n-id', params: { id: '42' } })
    expect(router.resolve(custom as never).fullPath).toBe('/de/n/42')
  })

  // Whatever an app does with the object: same URL, no throw. Vue's proxies are why nothing on it may be read-only.
  const COPIES: Record<string, <T extends object>(route: T) => T> = {
    'as it is': (route) => route,
    spread: (route) => ({ ...route }),
    JSON: (route) => JSON.parse(JSON.stringify(route)),
    structuredClone: (route) => structuredClone(route),
    ref: (route) => ref(route).value as never,
    shallowRef: (route) => shallowRef(route).value as never,
    reactive: (route) => reactive(route) as never,
    readonly: (route) => readonly(route) as never,
  }

  describe.each(Object.keys(COPIES))('%s', (kind) => {
    const copy = COPIES[kind]!

    test.each(['plain', 'a b', 'a/b', 'новости'])('%s', async (slug) => {
      const { router, i18n } = setup('prefix_except_default')
      const original = i18n.localeRoute('fr', { name: 'blog-slug', params: { slug }, query: { q: 'x y' }, hash: '#top' })
      const route = copy(original)
      const url = `/fr/blog/${ENCODED(slug)}?q=x+y#top`
      expect(router.resolve(route as never)).toMatchObject({ fullPath: url, params: { locale: 'fr', slug }, query: { q: 'x y' }, hash: '#top' })
      await router.push(route as never)
      expect(router.currentRoute.value.fullPath).toBe(url)
      // back through the strategy, as `$localePath(to)` and `$switchRoute(to)` read it
      expect(i18n.localeRoute('de', route).fullPath).toBe(`/de/artikel/${ENCODED(slug)}?q=x+y#top`)
      expect((i18n.switchLocaleRoute('de', route as never) as RouteLike).fullPath).toBe(`/de/artikel/${ENCODED(slug)}?q=x+y#top`)
    })
  })

  test('a route is a plain object: every property is an ordinary one, so a copy equals it', () => {
    const { i18n, at } = setup('prefix_except_default')
    const routes = ['plain', 'a b/c'].flatMap((slug) => [
      i18n.localeRoute('fr', { name: 'blog-slug', params: { slug } }),
      i18n.switchLocaleRoute('fr', at(`/blog/${ENCODED(slug)}`)) as RouteLike,
    ])
    for (const route of routes) {
      for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(route))) {
        expect(descriptor).toMatchObject({ enumerable: true, writable: true, configurable: true })
      }
      // `toEqual` skips what is not enumerable: the own names say what a spread and JSON would lose
      expect(Object.getOwnPropertyNames(route).sort()).toEqual(Object.keys(JSON.parse(JSON.stringify(route))).sort())
    }
  })

  test('a path-form route: no name or params beside the path, the same however it came', () => {
    const { i18n, at } = setup('prefix_except_default')
    const route = i18n.localeRoute('fr', { name: 'blog-slug', params: { slug: 'a b' }, query: { q: '1' }, hash: '#top' })
    expect(route).toEqual({ path: '/fr/blog/a%20b', fullPath: '/fr/blog/a%20b?q=1#top', query: { q: '1' }, hash: '#top' })
    const forms = [route, i18n.localeRoute('fr', '/blog/a%20b?q=1#top'), i18n.switchLocaleRoute('fr', at('/blog/a%20b?q=1#top')) as RouteLike]
    for (const form of forms) {
      expect(form).toEqual(route)
      expect(Object.getOwnPropertyNames(form).sort()).toEqual(['fullPath', 'hash', 'path', 'query'])
    }
  })

  test('a spread keeps what it changes: a new query or hash, through every reader', () => {
    const { router, i18n } = setup('prefix_except_default')
    for (const slug of ['plain', 'a b/c']) {
      const route = i18n.localeRoute('fr', { name: 'blog-slug', params: { slug } })
      const changed = { ...route, query: { x: '1' }, hash: '#h' }
      const fr = `/fr/blog/${ENCODED(slug)}?x=1#h`
      const de = `/de/artikel/${ENCODED(slug)}?x=1#h`
      expect(router.resolve(changed as never).fullPath).toBe(fr)
      expect(i18n.localeRoute('de', changed).fullPath).toBe(de)
      expect((i18n.switchLocaleRoute('de', changed as never) as RouteLike).fullPath).toBe(de)
    }
  })

  test('new params on a spread: a named route takes them, a path-form route keeps its path', () => {
    const { router, i18n } = setup('prefix_except_default')
    const named = i18n.localeRoute('fr', { name: 'blog-slug', params: { slug: 'plain' } })
    expect(router.resolve({ ...named, params: { locale: 'fr', slug: 'other' } } as never).fullPath).toBe('/fr/blog/other')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    onTestFinished(() => warn.mockRestore())
    const escaped = i18n.localeRoute('fr', { name: 'blog-slug', params: { slug: 'a b' } })
    expect(router.resolve({ ...escaped, params: { locale: 'fr', slug: 'other' } } as never).fullPath).toBe('/fr/blog/a%20b')
    expect(i18n.localeRoute('de', { ...escaped, params: { slug: 'other' } }).fullPath).toBe('/de/artikel/a%20b')
  })

  test('a route with a trailing slash goes back through the strategy, from any page', () => {
    const { i18n } = setup('prefix_except_default')
    const route = { path: '/fr/blog/a%20b%2Fc/', fullPath: '/fr/blog/a%20b%2Fc/' }
    expect((i18n.switchLocaleRoute('de', route as never) as RouteLike).fullPath).toBe('/de/artikel/a%20b%2Fc')
  })

  test("a spread with a new path: the caller's path wins, on a plain route and an escaped one", () => {
    const { i18n } = setup('prefix_except_default')
    for (const slug of ['plain', 'a b']) {
      const route = i18n.localeRoute('fr', { name: 'blog-slug', params: { slug } })
      const moved = { ...route, path: '/fr/blog/c%20d' }
      expect((i18n.switchLocaleRoute('de', moved as never) as RouteLike).fullPath).toBe('/de/artikel/c%20d')
      expect(i18n.localeRoute('de', moved).fullPath).toBe('/de/artikel/c%20d')
    }
  })

  test('no_prefix, two pages on one path: `named` keeps the record that a path cannot name', () => {
    const pages: NuxtPage[] = [
      ...PAGES.filter((page) => page.name === 'index'),
      { path: '/one/:id()', name: 'one-id', file: 'pages/one/[id].vue' },
      { path: '/two/:id()', name: 'two-id', file: 'pages/two/[id].vue' },
    ]
    const rules: GlobalLocaleRoutes = { 'one/[id]': { en: '/co/[id]', de: '/co-one/[id]' }, 'two/[id]': { en: '/co-two/[id]', de: '/co/[id]' } }
    const { router, i18n, at } = setup('no_prefix', {}, LOCALES, { pages, rules })
    const here = at('/co-two/a%20b')
    expect((i18n.switchLocaleRoute('de', here) as RouteLike).name).toBeUndefined()
    const { path: _path, fullPath: _fullPath, ...named } = i18n.switchLocaleRoute('de', here, { named: true }) as RouteLike
    expect(router.resolve(named as never)).toMatchObject({ name: here.name?.replace('-en', '-de'), fullPath: '/co/a%20b', params: { id: 'a b' } })
  })

  test('per-locale params reach a path-form route', () => {
    const { i18n } = setup('prefix_except_default')
    const route = i18n.localeRoute('fr', { name: 'blog-slug', params: { slug: 'a b' } })
    const switched = i18n.switchLocaleRoute('de', route as never, { i18nRouteParams: { de: { slug: 'c d' } } })
    expect((switched as RouteLike).fullPath).toBe('/de/artikel/c%20d')
  })

  test('a plain URL keeps `name` for the router: a lookup, not a walk over the records', () => {
    const { i18n } = setup('prefix_except_default')
    const route = i18n.localeRoute('de', { name: 'blog-slug', params: { slug: 'plain' } })
    expect(Object.keys(route)).toContain('name')
  })

  test.each(['prefix', 'prefix_and_default', 'no_prefix'] as const)('%s', (strategy) => {
    const { router, i18n } = setup(strategy)
    const route = i18n.localeRoute('de', { name: 'blog-slug', params: { slug: 'a/b c' } })
    expect(router.resolve(route as never).fullPath).toBe(route.fullPath)
    expect(route.fullPath).toMatch(/\/a%2Fb%20c$/)
  })

  test('a domain build', () => {
    const domains: Locale[] = LOCALES.map((locale) => (locale.code === 'de' ? { ...locale, baseUrl: 'https://example.de' } : locale))
    const { router, i18n } = setup('prefix_except_default', {}, domains)
    const here = i18n.localeRoute('fr', { name: 'blog-slug', params: { slug: 'a/b' } })
    expect(router.resolve(here as never).fullPath).toBe('/fr/blog/a%2Fb')
    expect(i18n.localeRoute('de', { name: 'blog-slug', params: { slug: 'a/b' } }).fullPath).toBe('https://example.de/de/artikel/a%2Fb')
  })

  test('a switched route, a route read back, and a copy of one', () => {
    const { router, i18n, at } = setup('prefix_except_default')
    const switched = i18n.switchLocaleRoute('de', at('/blog/a%2Fb'))
    expect(router.resolve(switched as never).fullPath).toBe('/de/artikel/a%2Fb')
    const route = i18n.localeRoute('de', { name: 'blog-slug', params: { slug: 'a/b' } })
    expect(i18n.localeRoute('fr', route).fullPath).toBe('/fr/blog/a%2Fb')
    expect(router.resolve({ ...route } as never).fullPath).toBe('/de/artikel/a%2Fb')
  })

  test('an unlocalized page by name', () => {
    const pages: NuxtPage[] = [...PAGES, { path: '/raw/:id()', name: 'raw-id', file: 'pages/raw/[id].vue' }]
    const { router, i18n } = setup('prefix_except_default', {}, LOCALES, { pages, rules: { 'raw/[id]': false } })
    const route = i18n.localeRoute('de', { name: 'raw-id', params: { id: 'a/b' } })
    expect(router.resolve(route as never).fullPath).toBe('/raw/a%2Fb')
  })
})

describe('switchLocaleRoute', () => {
  test('keeps params, query and hash; i18nRouteParams replace params per locale', () => {
    const { i18n, at, url } = setup('prefix_except_default')
    const route = at('/blog/hello?q=1#top')
    expect(url(i18n.switchLocaleRoute('de', route))).toBe('/de/artikel/hello?q=1#top')
    expect(url(i18n.switchLocaleRoute('de', route, { i18nRouteParams: { de: { slug: 'hallo' } } }))).toBe('/de/artikel/hallo?q=1#top')
  })

  test("a page not served in the target locale leads to that locale's home, never another locale's page", () => {
    const { i18n, at, url } = setup('prefix_except_default')
    expect(url(i18n.switchLocaleRoute('fr', at('/de/de-only')))).toBe('/fr')
    expect(url(i18n.switchLocaleRoute('en', at('/de/de-only')))).toBe('/')
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
    expect(pad.i18n.switchLocaleRoute('fr', pad.at('/de/x/y?q=1')).fullPath).toBe('/fr/x/y?q=1')
    const pxd = setup('prefix_except_default', {}, LOCALES, { pages })
    expect(pxd.i18n.switchLocaleRoute('en', pxd.at('/en')).fullPath).toBe('/')
    expect(pxd.i18n.switchLocaleRoute('de', pxd.at('/en/about-us')).fullPath).toBe('/de/ueber-uns')
    // an unnamed route that matched records (a vue-router route) is not a 404: it stays
    const matched = { ...pxd.at('/en'), matched: [{}] }
    expect(pxd.i18n.switchLocaleRoute('de', matched)).toBe(matched)
    // no record serves it: it stays the 404 it is
    expect(pxd.i18n.getClientRedirect('/no/page', 'de')).toBeNull()
    expect(pxd.i18n.getClientRedirect('/no/page', 'en')).toBeNull()
  })

  test('baseUrl locales give absolute URLs; baseDefault drops the prefix', () => {
    const locales: Locale[] = [
      { code: 'en' },
      { code: 'de', baseUrl: 'https://example.de/', baseDefault: true },
      { code: 'fr', baseUrl: 'https://example.fr' },
    ]
    const { i18n, at } = setup('prefix_except_default', {}, locales)
    expect(i18n.switchLocaleRoute('de', at('/about-us?q=1'))).toBe('https://example.de/ueber-uns?q=1')
    expect(i18n.switchLocaleRoute('fr', at('/about-us'))).toBe('https://example.fr/fr/about')
    expect(i18n.localeRoute('de', { name: 'index' }).fullPath).toBe('https://example.de')
  })
})

describe('a route read back from an absolute link, on a host no locale lives on', () => {
  const locales: Locale[] = [
    { code: 'en', baseUrl: 'https://a.test', baseDefault: true },
    { code: 'de', baseUrl: 'https://b.test/shop', baseDefault: true },
    { code: 'fr' },
  ]

  test('the page of the link switches like any route (what $switchRoute does with a path)', () => {
    const { i18n } = setup('prefix_except_default', {}, locales)
    const from = i18n.localeRoute('en', '/about-us?q=1') as ResolvedRouteLike
    expect(from.fullPath).toBe('https://a.test/about-us?q=1')
    expect(i18n.switchLocaleRoute('fr', from)).toMatchObject({ fullPath: '/fr/about?q=1' })
    expect(i18n.switchLocaleRoute('de', from)).toBe('https://b.test/shop/ueber-uns?q=1')
  })

  test('per-locale params still apply; an origin no locale has is left alone', () => {
    const { i18n } = setup('prefix_except_default', {}, locales)
    const from = i18n.localeRoute('de', '/blog/x') as ResolvedRouteLike
    expect(from.fullPath).toMatch(/^https:\/\/b\.test\/shop\//)
    const switched = i18n.switchLocaleRoute('fr', from, { i18nRouteParams: { fr: { slug: 'y' } } })
    expect(switched).toMatchObject({ fullPath: expect.stringMatching(/\/y$/) })
    const other = { name: undefined, path: 'https://other.test/about-us', fullPath: 'https://other.test/about-us' }
    expect(String((i18n.switchLocaleRoute('fr', other) as ResolvedRouteLike).fullPath)).not.toContain('about-us/')
  })
})

describe('a host of a domain build', () => {
  const locales: Locale[] = [
    { code: 'en', baseUrl: 'https://a.test', baseDefault: true },
    { code: 'de', baseUrl: 'https://b.test', baseDefault: true },
    { code: 'ru' },
  ]
  const onB = (strategy: Strategies) =>
    setup(strategy, { defaultLocale: 'de', locales: locales.filter((l) => l.code !== 'en'), linkLocales: locales, domain: 'b.test' }, locales, {
      routeLocales: { 'de-only': ['de'], '/en-ru': ['en', 'ru'] },
      pages: [...PAGES, { path: '/en-ru', name: 'en-ru', file: 'pages/en-ru.vue' }],
    })

  test('no_prefix: a restricted page renders in a locale the host serves', () => {
    const { i18n, at } = onB('no_prefix')
    expect(i18n.getCurrentLocale(at('/en-ru'), 'de')).toBe('ru')
  })

  test('a real page on a foreign segment stays, a foreign prefix is a 404', () => {
    const { i18n } = onB('prefix_except_default')
    expect(i18n.shouldReturn404('/en/about-us')).toBe('Locale on another domain')
  })

  test('no_prefix: a page whose only local locale is disabled is a 404', () => {
    const open: Locale[] = [locales[0]!, locales[1]!, { code: 'ru' }]
    const { i18n } = setup(
      'no_prefix',
      { defaultLocale: 'de', locales: [open[1]!, { code: 'ru', disabled: true }], linkLocales: open, domain: 'b.test' },
      open,
      { routeLocales: { '/en-ru': ['en', 'ru'] }, pages: [...PAGES, { path: '/en-ru', name: 'en-ru', file: 'pages/en-ru.vue' }] },
    )
    expect(i18n.shouldReturn404('/en-ru')).not.toBeNull()
  })

  test('a host with no locale left answers 404 everywhere', () => {
    const hostLocales = [{ ...locales[1]!, disabled: true }]
    for (const strategy of ['no_prefix', 'prefix', 'prefix_except_default'] as const) {
      const { i18n } = setup(strategy, { defaultLocale: 'de', locales: hostLocales, linkLocales: locales, domain: 'b.test' }, locales)
      expect(i18n.shouldReturn404('/')).not.toBeNull()
      expect(i18n.shouldReturn404('/about-us')).not.toBeNull()
    }
  })

  test('a redirect never targets a locale the host does not serve', () => {
    const onA = (strategy: Strategies) =>
      setup(strategy, { locales: locales.filter((l) => l.code !== 'de'), linkLocales: locales, domain: 'a.test' }, locales)
    // under prefix a page the preferred locale lacks moves to a locale of this host, not to the first it has
    expect(onB('prefix').i18n.getClientRedirect('/en-ru', 'de')).toBe('/ru/en-ru')
    // a locale of another domain is no target, as a disabled one is not
    expect(onA('prefix_except_default').i18n.getClientRedirect('/about-us', 'de')).toBeNull()
    expect(onB('prefix').i18n.getClientRedirect('/de-only', 'de')).toBe('/de/de-only')
  })

  test('hash mode: the route goes to the other domain in the hash', () => {
    const { i18n, at } = setup(
      'prefix_except_default',
      { hashMode: true, defaultLocale: 'de', locales: locales.slice(1), linkLocales: locales, domain: 'b.test' },
      locales,
    )
    expect(i18n.switchLocaleRoute('en', at('/ueber-uns'))).toBe('https://a.test/#/about-us')
  })
})

describe('reading a URL', () => {
  test('getCurrentLocale / getCurrentLocaleName', () => {
    const { i18n, at } = setup('prefix_except_default')
    expect(i18n.getCurrentLocale(at('/de/ueber-uns'))).toBe('de')
    expect(i18n.getCurrentLocale(at('/about-us'))).toBe('en')
    expect(i18n.getCurrentLocaleName(at('/fr'))).toBe('Français')
    // an unprefixed URL is the default locale's page, as the server renders it: a stored locale does not move it
    expect(setup('prefix_and_default').i18n.getCurrentLocale(setup('prefix_and_default').at('/'), 'fr')).toBe('en')
    expect(setup('prefix_and_default').i18n.getCurrentLocale(setup('prefix_and_default').at('/about-us'), 'fr')).toBe('en')
    expect(setup('prefix_and_default').i18n.resolveLocaleFromPath('/x')).toBe('en')
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

  test('a link to a code no config knows goes where one to a disabled locale goes: the default locale', () => {
    const disabled = LOCALES.map((l) => (l.code === 'fr' ? { ...l, disabled: true } : l))
    for (const strategy of ['prefix', 'prefix_except_default', 'prefix_and_default', 'no_prefix'] as const) {
      const { i18n } = setup(strategy, { locales: disabled })
      const defaultPath = i18n.localeRoute('en', '/about').path
      expect(i18n.localeRoute('xx', '/about').path).toBe(defaultPath)
      expect(i18n.localeRoute('fr', '/about').path).toBe(defaultPath)
    }
    const domains = LOCALES.map((l) => ({ ...l, baseUrl: `https://${l.code}.test` }))
    const onEn = setup('prefix_except_default', { locales: domains.slice(0, 1), linkLocales: domains, domain: 'en.test' }, domains).i18n
    // a locale of another domain is known: it stays that domain's link
    expect(onEn.localeRoute('de', '/about').path).toMatch(/^https:\/\/de\.test/)
  })

  test('a runtime-disabled locale prefix is a 404 (F1: disabledLocales reach routing)', () => {
    // routes generated for every locale, the strategy built from the overridden config
    const disabled = setup('prefix_except_default', { locales: LOCALES.map((l) => (l.code === 'fr' ? { ...l, disabled: true } : l)) }).i18n
    expect(disabled.shouldReturn404('/fr/about-us')).toBe('Locale disabled')
    expect(disabled.shouldReturn404('/fr')).toBe('Locale disabled')
    // the client agrees: no redirect to `/en/fr/...` around the 404
    expect(disabled.getClientRedirect('/fr/about-us', 'de')).toBeNull()
    const matcher = setup('prefix', {
      locales: LOCALES.map((l) => (l.code === 'fr' ? { ...l, disabled: true } : l)),
      customRegexMatcher: '[a-z]{2}',
    }).i18n
    expect(matcher.shouldReturn404('/fr/about-us')).toBe('Locale disabled')
    expect(disabled.shouldReturn404('/de/ueber-uns')).toBeNull()
    expect(setup('prefix_except_default').i18n.shouldReturn404('/fr/about-us')).toBeNull()
  })

  test('getClientRedirect never leaves the origin (D3: //host, /\\host)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    onTestFinished(() => warn.mockRestore())
    const pxd = setup('prefix_except_default').i18n
    expect(pxd.getClientRedirect('/de//evil.example', 'en', { switchPrefixed: true })).toBe('/evil.example')
    // the catch-all page encodes it: a path, not a host
    expect(pxd.getClientRedirect('/de/\\evil.example', 'en', { switchPrefixed: true })).toBe('/%5Cevil.example')
    expect(pxd.getClientRedirect('//evil.example', 'de')).toBe('/de//evil.example')
    expect(setup('prefix').i18n.getClientRedirect('/fr//evil.example/x', 'de', { switchPrefixed: true })).toBe('/de//evil.example/x')
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

  test('customRegexMatcher: a locale-like first segment that is no locale is a 404', () => {
    const { i18n } = setup('prefix', { customRegexMatcher: '[a-z]{2}' })
    expect(i18n.shouldReturn404('/xx/about')).toBe('Unknown locale')
    expect(i18n.shouldReturn404('/de/ueber-uns')).toBeNull()
    expect(i18n.shouldReturn404('/about-long')).toBeNull()
  })

  describe.each([undefined, false])('prefix, redirects: %s, a custom path in every locale', (redirects) => {
    const pages = PAGES.filter((page) => page.name !== 'slug')

    test('a link by the original path finds the page', () => {
      const { i18n } = setup('prefix', {}, LOCALES, { pages, redirects })
      expect(i18n.localeRoute('de', '/page2').fullPath).toBe('/de/custom-page2-de')
      expect(i18n.localeRoute('en', '/page2/').fullPath).toBe('/en/custom-page2-en')
      expect(i18n.getRouteBaseName({ path: '/page2' })).toBe('page2')
    })

    test('a catch-all does not take it', () => {
      const { i18n } = setup('prefix', {}, LOCALES, { redirects })
      expect(i18n.localeRoute('fr', '/page2').fullPath).toBe('/fr/custom-page2-fr')
    })
  })

  test('redirects: false adds no record for the original URL', () => {
    const { router } = setup('prefix', {}, LOCALES, { redirects: false })
    expect(router.getRoutes().some((record) => record.path === '/page2')).toBe(false)
    expect(
      setup('prefix')
        .router.getRoutes()
        .some((record) => record.path === '/page2'),
    ).toBe(true)
  })
})

describe('an unnamed page from a module', () => {
  test('is served under its prefix', () => {
    const { i18n } = setup('prefix_except_default', {}, LOCALES, { pages: [...PAGES.slice(0, 2), { path: '/from-module', file: 'mod.vue' }] })
    expect(i18n.shouldReturn404('/de/from-module')).toBeNull()
  })

  test('switches locale like any page, to a custom path too', () => {
    const { i18n, at, url } = setup('prefix_except_default', {}, LOCALES, {
      pages: [...PAGES.slice(0, 2), { path: '/custom-page', file: 'mod.vue' }],
      rules: { 'custom-page': { de: '/eigene-seite' } },
    })
    expect(url(i18n.switchLocaleRoute('de', at('/fr/custom-page?q=1')))).toBe('/de/eigene-seite?q=1')
    expect(url(i18n.switchLocaleRoute('en', at('/de/eigene-seite')))).toBe('/custom-page')
    expect(i18n.pageLocales(at('/de/eigene-seite'))?.sort()).toEqual(['de', 'en', 'fr'])
  })
})

describe('a request-shaped path', () => {
  test.each(['//evil.example', '/\\evil.example', '//evil.example/x?y=1'])('%s stays on this origin in every locale', (path) => {
    const { i18n } = setup('prefix_except_default')
    for (const locale of ['en', 'de']) {
      const result = i18n.localeRoute(locale, path)
      expect(result.fullPath ?? result.path).toMatch(/^\/[^/\\]/)
    }
  })
})

describe('no link leaves the origin', () => {
  const NO_CATCH_ALL = PAGES.filter((page) => page.name !== 'slug')
  const UNLOCALIZED_CATCH_ALL: NuxtPage[] = [...NO_CATCH_ALL, { path: '/:rest(.*)*', name: 'rest', file: 'pages/[...rest].vue' }]
  const hosts = (result: RouteLike | string) => {
    const route = typeof result === 'string' ? { path: result, fullPath: result } : result
    return [route.path, route.fullPath].map((url) => new URL(url ?? '', 'https://app.test').host)
  }
  const HOSTILE = [
    '/de//evil.example',
    '/de//evil.example/path?x=1',
    '/en//evil.example',
    '/de/\\evil.example',
    '/de/\\\\evil.example',
    '\\evil.example',
    '/\t/evil.example',
    '/de/\t/evil.example',
    '/de/\n\\evil.example',
    ' //evil.example',
  ]

  describe.each(['prefix_except_default', 'prefix_and_default', 'no_prefix'] as const)('%s', (strategy) => {
    test.each(['catch-all', 'no catch-all'])('localeRoute and switchLocaleRoute, %s', (kind) => {
      const { i18n, router } = setup(strategy, {}, LOCALES, { pages: kind === 'catch-all' ? PAGES : NO_CATCH_ALL })
      for (const url of HOSTILE) {
        expect(hosts(i18n.localeRoute('en', url))).toEqual(['app.test', 'app.test'])
        expect(hosts(i18n.localeRoute('en', { path: url }))).toEqual(['app.test', 'app.test'])
        const { name, path, fullPath, params, query, hash, matched } = router.resolve(url)
        const route = { name: name as string | null, path, fullPath, params, query, hash, matched }
        expect(hosts(i18n.switchLocaleRoute('en', route))).toEqual(['app.test', 'app.test'])
      }
    })
  })

  test('a catch-all param is no way out: the link is a path, so the router cannot rebuild the URL from it', () => {
    const { i18n, at } = setup('prefix_except_default')
    const route = i18n.switchLocaleRoute('en', at('/de//evil.example?x=1#y')) as RouteLike
    expect(route).toEqual({ path: '/evil.example', fullPath: '/evil.example?x=1#y', query: { x: '1' }, hash: '#y' })
    expect(i18n.localeRoute('en', '/de//evil.example').name).toBeUndefined()
  })

  test('an unlocalized catch-all stays on the page, not on the URL it was reached by', () => {
    const { i18n, at } = setup('prefix_except_default', {}, LOCALES, { pages: UNLOCALIZED_CATCH_ALL, rules: { rest: false } })
    expect(hosts(i18n.switchLocaleRoute('de', at('//evil.example')))).toEqual(['app.test', 'app.test'])
  })

  test('a link that is fine keeps its route', () => {
    const { i18n, at } = setup('prefix')
    expect(i18n.localeRoute('de', '/about')).toMatchObject({ name: 'localized-about-de', path: '/de/ueber-uns' })
    expect(i18n.localeRoute('fr', '/de//evil.example').fullPath).toBe('/fr//evil.example')
    const route = at('/de/ueber-uns')
    expect(i18n.switchLocaleRoute('fr', route)).toMatchObject({ name: 'localized-about', params: { locale: 'fr' } })
  })
})

describe('no_prefix: a custom path shared by locales', () => {
  const AT: Locale[] = [...LOCALES, { code: 'at', displayName: 'Österreich' }]
  const rules: GlobalLocaleRoutes = { about: { de: '/ueber-uns', at: '/ueber-uns' } }

  test('renders the preferred locale when it serves the path, its first locale otherwise', () => {
    const { i18n, at } = setup('no_prefix', {}, AT, { rules })
    expect(i18n.getCurrentLocale(at('/ueber-uns'), 'at')).toBe('at')
    expect(i18n.getCurrentLocale(at('/ueber-uns'), 'de')).toBe('de')
    expect(i18n.getCurrentLocale(at('/ueber-uns'), 'fr')).toBe('de')
  })

  test('one locale on a custom path keeps it, and the base page keeps the preference', () => {
    const { i18n, at } = setup('no_prefix', {}, AT, { rules: { about: { de: '/ueber-uns', at: '/oesterreich' } } })
    expect(i18n.getCurrentLocale(at('/ueber-uns'), 'at')).toBe('de')
    expect(i18n.getCurrentLocale(at('/oesterreich'), 'de')).toBe('at')
    expect(i18n.getCurrentLocale(at('/about'), 'de')).toBe('de')
  })

  test('links of both locales reach the one URL, and the switch stays on it', () => {
    const { i18n, at, url } = setup('no_prefix', {}, AT, { rules })
    expect(url(i18n.localeRoute('at', { name: 'about' }))).toBe('/ueber-uns')
    expect(url(i18n.localeRoute('de', { name: 'about' }))).toBe('/ueber-uns')
    expect(url(i18n.switchLocaleRoute('at', at('/ueber-uns')))).toBe('/ueber-uns')
    expect(i18n.pageLocales(at('/ueber-uns'))).toEqual(expect.arrayContaining(['de', 'at']))
  })

  test('with domains, a host serves the path of its own locale', () => {
    const domains: Locale[] = [
      { code: 'en', baseUrl: 'https://a.test' },
      { code: 'de', baseUrl: 'https://b.test' },
      { code: 'fr', baseUrl: 'https://c.test' },
    ]
    const on = (host: Locale) =>
      setup('no_prefix', { domain: host.baseUrl, locales: [host], linkLocales: domains }, domains, { rules: { about: { de: '/x', fr: '/x' } } })
    const onFr = on(domains[2]!)
    expect(onFr.i18n.shouldReturn404('/x')).toBeNull()
    expect(onFr.i18n.getCurrentLocale(onFr.at('/x'), 'de')).toBe('fr')
    const onDe = on(domains[1]!)
    expect(onDe.i18n.shouldReturn404('/x')).toBeNull()
    expect(onDe.i18n.getCurrentLocale(onDe.at('/x'), 'fr')).toBe('de')
    expect(on(domains[0]!).i18n.shouldReturn404('/x')).toBe('Locale on another domain')
  })
})

describe('a hash in a string path', () => {
  test.each([
    ['/about#%C3%BC', '/de/ueber-uns#%C3%BC'],
    ['/about#ü', '/de/ueber-uns#%C3%BC'],
    ['/about#a%20b', '/de/ueber-uns#a%20b'],
    ['/about#top', '/de/ueber-uns#top'],
    ['/about#100%', '/de/ueber-uns#100%25'],
  ])('%s is stable', (path, link) => {
    const { i18n } = setup('prefix')
    const once = i18n.localeRoute('de', path).fullPath!
    expect(once).toBe(link)
    expect(i18n.localeRoute('de', once).fullPath).toBe(link)
  })
})

describe('a case variant of the prefix', () => {
  describe.each(['prefix', 'prefix_except_default', 'prefix_and_default'] as const)('%s', (strategy) => {
    test('is a 404, and its record reads in its own locale', () => {
      const pages = PAGES.filter((page) => page.name !== 'slug')
      const { i18n, at } = setup(strategy, {}, LOCALES, { pages })
      expect(i18n.shouldReturn404('/FR/about')).toBe('Unknown locale')
      expect(i18n.getClientRedirect('/FR/about', 'en')).toBeNull()
      expect(i18n.getCurrentLocale(at('/FR/about'))).toBe('fr')
      expect(i18n.shouldReturn404('/fr/about')).toBeNull()
    })
  })

  test('a percent-encoded prefix with no page behind it is one too', () => {
    const pages = PAGES.filter((page) => page.name !== 'slug')
    const { i18n } = setup('prefix', {}, LOCALES, { pages })
    expect(i18n.shouldReturn404('/%64e/nope')).toBe('Unknown locale')
    expect(i18n.getClientRedirect('/%64e/nope', 'en')).toBeNull()
  })

  test('a catch-all does not save it, a page of that name does', () => {
    expect(setup('prefix').i18n.shouldReturn404('/FR/about')).toBe('Unknown locale')
    const pages = [...PAGES, { path: '/FR/about', name: 'upper', file: 'pages/FR/about.vue' }]
    expect(setup('prefix_except_default', {}, LOCALES, { pages }).i18n.shouldReturn404('/FR/about')).toBeNull()
  })

  test('a [slug] page does not save a bare prefix: the router shows the locale home there', () => {
    const pages = [
      { path: '/', name: 'index', file: 'pages/index.vue' },
      { path: '/:slug()', name: 'slug', file: 'pages/[slug].vue' },
    ]
    const { i18n } = setup('prefix_except_default', {}, LOCALES, { pages })
    expect(i18n.shouldReturn404('/DE')).toBe('Unknown locale')
    expect(i18n.getClientRedirect('/DE', 'en')).toBeNull()
    expect(i18n.shouldReturn404('/de')).toBeNull()
    expect(i18n.shouldReturn404('/other')).toBeNull()
  })

  test('a segment that only looks like one is left alone', () => {
    const { i18n } = setup('prefix_except_default')
    expect(i18n.shouldReturn404('/About')).toBeNull()
    expect(i18n.getClientRedirect('/About', 'de')).toBe('/de/ueber-uns')
  })
})

describe('an unknown URL and the preference', () => {
  const pages = PAGES.filter((page) => page.name !== 'slug')

  test('stays the 404 it is where unprefixed URLs exist', () => {
    const { i18n } = setup('prefix_except_default', {}, LOCALES, { pages })
    expect(i18n.getClientRedirect('/nonexistent', 'de')).toBeNull()
    expect(i18n.getClientRedirect('/about%2F', 'de')).toBeNull()
    expect(i18n.getClientRedirect('/de/nonexistent', 'fr', { switchPrefixed: true })).toBeNull()
    expect(setup('prefix_and_default', {}, LOCALES, { pages }).i18n.getClientRedirect('/de/nonexistent', 'fr', { switchPrefixed: true })).toBeNull()
  })

  test('`/` still moves, and `prefix` still leaves unprefixed URLs', () => {
    const noHome = pages.filter((page) => page.name !== 'index')
    expect(setup('prefix_except_default', {}, LOCALES, { pages: noHome }).i18n.getClientRedirect('/', 'de')).toBe('/de')
    expect(setup('prefix', {}, LOCALES, { pages }).i18n.getClientRedirect('/nonexistent', 'de')).toBe('/de/nonexistent')
  })

  test('a page behind a catch-all is a page', () => {
    expect(setup('prefix_except_default').i18n.getClientRedirect('/nonexistent', 'de')).toBe('/de/nonexistent')
  })

  test('no routes at all (pages: false): nothing can be missing', () => {
    const empty = createPathStrategy({
      strategy: 'prefix_except_default',
      defaultLocale: 'en',
      locales: LOCALES,
      router: { hasRoute: () => false, resolve: (to) => to as ResolvedRouteLike, getRoutes: () => [] },
    })
    expect(empty.getClientRedirect('/x', 'de')).toBe('/de/x')
  })
})

describe('a domain build, on an unknown host', () => {
  const locales: Locale[] = [
    { code: 'en', baseUrl: 'https://a.test', baseDefault: true },
    { code: 'fr', baseUrl: 'https://a.test' },
    { code: 'de', baseUrl: 'https://b.test', baseDefault: true },
  ]

  test('links the build default with its prefix when another locale is the default of its host', () => {
    const { i18n } = setup('prefix_except_default', { defaultLocale: 'fr' }, locales)
    expect(i18n.localeRoute('fr', { name: 'page2' }).fullPath).toBe('https://a.test/fr/custom-page2-fr')
    expect(i18n.localeRoute('fr', '/?x=1').fullPath).toBe('https://a.test/fr?x=1')
    expect(i18n.localeRoute('en', { name: 'page2' }).fullPath).toBe('https://a.test/custom-page2-en')
  })

  test.each(['https://a.test', 'https://a.test/'])('a host is the same with a trailing slash: %s', (baseUrl) => {
    const shared: Locale[] = [{ code: 'en', baseUrl }, { code: 'de', baseUrl: 'https://a.test', baseDefault: true }, { code: 'fr' }]
    const { i18n } = setup('prefix_except_default', {}, shared)
    expect(i18n.localeRoute('en', { name: 'page2' }).fullPath).toBe('https://a.test/en/custom-page2-en')
  })

  test('a link made absolute stays that link, whatever the locale', () => {
    const { i18n } = setup('prefix_except_default', {}, locales)
    const link = i18n.localeRoute('de', { name: 'page2' })
    expect(link.fullPath).toBe('https://b.test/de/custom-page2-de'.replace('/de/', '/'))
    expect(i18n.localeRoute('fr', link)).toEqual({ path: link.fullPath, fullPath: link.fullPath })
  })

  test.each(['https://evil.example/x', 'https://b.test.evil.example/x', 'https://b.test@evil.example/x'])(
    'any other absolute object is no link: %s',
    (url) => {
      const { i18n } = setup('prefix_except_default', {}, locales)
      const { fullPath } = i18n.localeRoute('de', { path: url, fullPath: url })
      expect(new URL(fullPath!, 'https://b.test').host).toBe('b.test')
    },
  )

  test('no_prefix has no prefix to add', () => {
    const { i18n } = setup('no_prefix', { defaultLocale: 'fr' }, locales)
    expect(i18n.localeRoute('fr', { name: 'page2' }).fullPath).toBe('https://a.test/custom-page2-fr')
  })

  test('the home of a host is its bare origin, and reads back', () => {
    const { i18n, at } = setup('prefix_except_default', {}, locales)
    expect(i18n.localeRoute('de', '/').fullPath).toBe('https://b.test')
    expect(i18n.switchLocaleRoute('fr', { ...at('/'), name: undefined, fullPath: 'https://b.test', path: 'https://b.test' })).toBe(
      'https://a.test/fr',
    )
  })

  test('a link reads back by the longest base of its host', () => {
    const shop: Locale[] = [{ code: 'en', baseUrl: 'https://a.test' }, { code: 'de', baseUrl: 'https://a.test/shop' }, { code: 'fr' }]
    const { i18n, at } = setup('prefix_except_default', {}, shop)
    const link = i18n.localeRoute('de', { name: 'page2' }).fullPath!
    expect(link).toBe('https://a.test/shop/de/custom-page2-de')
    expect(i18n.switchLocaleRoute('fr', { ...at('/'), name: undefined, path: link, fullPath: link })).toMatchObject({
      fullPath: '/fr/custom-page2-fr',
    })
  })
})

describe('a page on the segment of a disabled locale', () => {
  const locales = [...LOCALES, { code: 'es', disabled: true }]
  const pages: NuxtPage[] = [...PAGES.slice(0, 2), { path: '/es', name: 'es-page', file: 'pages/es.vue' }]

  test('stays a page; the prefix without one is a 404', () => {
    // step 1: pec serves it unprefixed
    const pec = setup('prefix_except_default', {}, locales, { pages }).i18n
    expect(pec.shouldReturn404('/es')).toBeNull()
    expect(pec.shouldReturn404('/es/about')).toBe('Locale disabled')

    // step 2: prefix has it under the locales, so the unprefixed URL moves there
    const prefix = setup('prefix', {}, locales, { pages }).i18n
    expect(prefix.shouldReturn404('/es')).toBeNull()
    expect(prefix.getClientRedirect('/es', 'de')).toBe('/de/es')
  })

  test('is no redirect target', () => {
    const { i18n } = setup('prefix_except_default', {}, locales, { pages })
    expect(i18n.getClientRedirect('/missing', 'es')).toBeNull()
    expect(i18n.getClientRedirect('/de/missing', 'es', { switchPrefixed: true })).toBeNull()
  })

  test('a catch-all does not count as a page', () => {
    const { i18n } = setup('prefix_except_default', {}, locales)
    expect(i18n.shouldReturn404('/es')).toBe('Locale disabled')
  })
})

describe('probing a URL', () => {
  /** console.warn as `router.resolve` sees it. The URL caches are shared, so each test asks about a URL of its own. */
  const warnDuringResolve = (path: string) => {
    const { router, i18n } = setup('prefix_except_default')
    let seen: unknown
    const resolve = router.resolve.bind(router)
    vi.spyOn(router, 'resolve').mockImplementation(((to: never) => {
      seen = console.warn
      return resolve(to)
    }) as never)
    i18n.getRouteBaseName({ path })
    return seen
  }

  test('dev: vue-router\'s "No match" warning is silenced around the call', () => {
    const warn = warnDuringResolve('/no-page-dev')
    expect(warn).toBeTypeOf('function')
    expect(warn).not.toBe(console.warn)
  })

  test('production: the global stays as it is', () => {
    vi.stubEnv('NODE_ENV', 'production')
    onTestFinished(() => vi.unstubAllEnvs())
    expect(warnDuringResolve('/no-page-production')).toBe(console.warn)
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

describe('a router without routes (pages: false)', () => {
  const empty = (strategy: Strategies) => {
    const router = createRouter({ history: createMemoryHistory(), routes: [] })
    // no record matches anything here, so every at() is vue-router's "No match" warning
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    onTestFinished(() => warn.mockRestore())
    return { router, i18n: createPathStrategy({ strategy, defaultLocale: 'en', locales: LOCALES, router }) }
  }

  // [strategy, from, to, expected]
  test.each([
    ['prefix_except_default', '/', 'de', '/de'],
    ['prefix_except_default', '/about?q=1#h', 'de', '/de/about?q=1#h'],
    ['prefix_except_default', '/de/about', 'en', '/about'],
    ['prefix_except_default', '/de', 'en', '/'],
    ['prefix', '/about', 'en', '/en/about'],
    ['prefix', '/de/about?q=1', 'fr', '/fr/about?q=1'],
    ['prefix_and_default', '/', 'en', '/en'],
    ['prefix_and_default', '/de/about', 'en', '/en/about'],
    ['no_prefix', '/about?q=1', 'de', '/about?q=1'],
    ['no_prefix', '/', 'de', '/'],
  ] as const)('%s: %s to %s is the same URL in that form', (strategy, from, to, expected) => {
    const { router, i18n } = empty(strategy)
    const route = router.resolve(from) as unknown as ResolvedRouteLike
    expect((i18n.switchLocaleRoute(to, route) as RouteLike).fullPath).toBe(expected)
    expect(i18n.localeRoute(to, from).fullPath).toBe(expected)
    expect(i18n.localeRoute(to, route).fullPath ?? i18n.localeRoute(to, route).path).toBe(expected)
  })

  test('nothing is a 404 and the locale still comes from the URL', () => {
    const { router, i18n } = empty('prefix_except_default')
    expect(i18n.shouldReturn404('/de/about')).toBeNull()
    expect(i18n.getCurrentLocale(router.resolve('/de/about') as unknown as ResolvedRouteLike)).toBe('de')
    expect(i18n.getClientRedirect('/', 'de')).toBe('/de')
    expect(i18n.getClientRedirect('/', 'en')).toBeNull()
  })

  test('a name stays for the router to answer: no record to translate it to', () => {
    const { i18n } = empty('prefix')
    expect(i18n.localeRoute('de', { name: 'about' })).toEqual({ name: 'about' })
  })
})

describe('stability', () => {
  /** Frozen all the way down: a write throws in this strict module. */
  const deepFreeze = <T>(value: T): T => {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.freeze(value)
      Object.values(value).forEach(deepFreeze)
    }
    return value
  }

  test.each(['prefix_except_default', 'prefix', 'prefix_and_default', 'no_prefix'] as const)(
    '%s: strategy calls never write to the caller route, the current route or the params they are given',
    (strategy) => {
      const { i18n, at } = setup(strategy)
      const url = strategy === 'no_prefix' ? '/blog/hi?q=1#top' : '/de/artikel/hi?q=1#top'
      const { matched: _matched, ...route } = { matched: [], ...at(url) }
      const current = deepFreeze(route)
      const source = deepFreeze({ name: 'blog-slug', params: { slug: 'x' }, query: { tab: 'info' }, hash: '#section' })
      const options = deepFreeze({ i18nRouteParams: { fr: { slug: 'salut' } } })
      for (const locale of ['en', 'de', 'fr']) {
        i18n.localeRoute(locale, source)
        i18n.localeRoute(locale, current)
        i18n.localeRoute(locale, '/contact')
        i18n.switchLocaleRoute(locale, current, options)
      }
      i18n.getRouteBaseName(current)
      i18n.getCurrentLocale(current)
      i18n.pageLocales(current)
      // the frozen inputs still produced a real answer
      expect(i18n.getRouteBaseName(current)).toBe('blog-slug')
      expect(i18n.switchLocaleRoute('fr', current, options)).toMatchObject({ params: { slug: 'salut' } })
    },
  )

  test('a cached result never shares params / query with another caller (the cache is process-wide)', () => {
    const { i18n } = setup('prefix_except_default')
    const first = i18n.localeRoute('de', { name: 'blog-slug', params: { slug: 'x' }, query: { ref: 'a' } })
    ;(first.params as Record<string, unknown>).slug = 'LEAKED'
    ;(first.query as Record<string, unknown>).ref = 'LEAKED'
    const second = i18n.localeRoute('de', { name: 'blog-slug', params: { slug: 'x' }, query: { ref: 'a' } })
    expect(second.params).toEqual({ locale: 'de', slug: 'x' })
    expect(second.query).toEqual({ ref: 'a' })
    expect(second).not.toBe(first)
    expect(i18n.localeRoute('de', '/about-us').path).toBe('/de/ueber-uns')
  })

  test("a symbol-named route is the app's own route: resolved by its symbol, no base name, never localized", () => {
    const { router } = setup('prefix')
    const app = Symbol('app')
    router.addRoute({ path: '/app-only', name: app, component: {} })
    const i18n = createPathStrategy({ strategy: 'prefix', defaultLocale: 'en', locales: LOCALES, router })
    const result = i18n.localeRoute('de', { name: app })
    expect(result.name).toBe(app)
    expect(result.fullPath).toBe('/app-only')
    const route = router.resolve('/app-only')
    expect(i18n.getRouteBaseName(route)).toBeNull()
    expect(i18n.getPluginRouteName(route, 'de')).toBe('')
    expect(i18n.switchLocaleRoute('de', route)).toBe(route)
  })

  test('routers over one route array with different strict options keep their own answers', () => {
    const { router } = setup('prefix_except_default')
    const routes = router.options.routes as RouteRecordRaw[]
    const loose = createRouter({ history: createMemoryHistory(), routes })
    const strict = createRouter({ history: createMemoryHistory(), routes, strict: true })
    const of = (r: Router) => createPathStrategy({ strategy: 'prefix_except_default', defaultLocale: 'en', locales: LOCALES, router: r })
    expect(of(loose).getRouteBaseName({ path: '/about-us/' })).toBe('about')
    expect(of(strict).getRouteBaseName({ path: '/about-us/' })).not.toBe('about')
  })
})

describe('guards no test named before mutation testing did', () => {
  test('a link that lets the router fill a param is not cached: the next page gets its own value', async () => {
    const { router, i18n } = setup('prefix')
    await router.push('/de/artikel/first')
    expect(i18n.localeRoute('fr', { name: 'blog-slug' }).path).toBe('/fr/blog/first')
    await router.push('/de/artikel/second')
    expect(i18n.localeRoute('fr', { name: 'blog-slug' }).path).toBe('/fr/blog/second')
  })

  test('a disabled locale is no switch target: the link stays on the page', () => {
    const locales = LOCALES.map((l) => (l.code === 'fr' ? { ...l, disabled: true } : l))
    const { i18n, at, url } = setup('prefix', { locales }, LOCALES)
    expect(url(i18n.switchLocaleRoute('fr', at('/de/ueber-uns')))).toBe('/de/ueber-uns')
  })

  test('prefix: a page the preferred locale lacks moves to the default locale, else to a locale this host serves', () => {
    expect(setup('prefix', {}, LOCALES, { routeLocales: { about: ['en', 'de'] } }).i18n.getClientRedirect('/about-us', 'fr')).toBe('/en/about-us')
    expect(setup('prefix').i18n.getClientRedirect('/de-only', 'fr')).toBe('/de/de-only')
  })

  test('elsewhere the unprefixed URL already shows such a page: it stays', () => {
    expect(
      setup('prefix_except_default', {}, LOCALES, { routeLocales: { about: ['en', 'de'] } }).i18n.getClientRedirect('/about-us', 'fr'),
    ).toBeNull()
    expect(setup('prefix_except_default').i18n.getClientRedirect('/de-only', 'fr')).toBeNull()
  })

  describe('an unprefixed record of a host default on a domain build', () => {
    const domains: Locale[] = [
      { code: 'en', baseUrl: 'https://a.test', baseDefault: true },
      { code: 'de', baseUrl: 'https://b.test', baseDefault: true },
    ]
    const on = (strategy: Strategies, host: Locale, defaultLocale: string, routeLocales: Record<string, string[]>) =>
      setup(strategy, { defaultLocale, locales: [host], linkLocales: domains, domain: new URL(host.baseUrl!).host }, domains, { routeLocales }).i18n

    test('the unprefixed URL of another host is not allowed here', () => {
      expect(on('prefix_and_default', domains[0]!, 'en', {}).shouldReturn404('/ueber-uns')).toBe('Locale not allowed for this route')
    })

    test('under prefix_except_default a page the host default has moves to its URL', () => {
      expect(on('prefix_except_default', domains[0]!, 'en', {}).shouldReturn404('/ueber-uns')).toBeNull()
    })

    test('a URL no record serves is no business of this check', () => {
      expect(on('prefix_and_default', domains[0]!, 'en', {}).shouldReturn404('/no/such/page')).toBeNull()
    })

    test('the record of the host default itself is served', () => {
      expect(on('prefix_and_default', domains[0]!, 'en', {}).shouldReturn404('/about-us')).toBeNull()
    })
  })
})
