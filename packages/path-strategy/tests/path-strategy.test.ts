/**
 * path-strategy on a real vue-router serving the routes route-strategy generates, as in the
 * Nuxt module: every answer must be a URL the router actually serves.
 */
import { RouteGenerator } from '@i18n-micro/route-strategy'
import type { GlobalLocaleRoutes, Locale, Strategies } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'
import { describe, expect, onTestFinished, test, vi } from 'vitest'
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
  }: {
    pages?: NuxtPage[]
    routeLocales?: Record<string, string[]>
    routeDisableMeta?: Record<string, boolean | string[]>
    rules?: GlobalLocaleRoutes
  } = {},
): Setup {
  const pages = structuredClone(source)
  new RouteGenerator({
    locales,
    defaultLocaleCode: 'en',
    strategy,
    globalLocaleRoutes: { ...RULES, ...rules },
    routeLocales: { 'de-only': ['de'], ...routeLocales },
    routeDisableMeta,
    customRegexMatcher: ctx.customRegexMatcher,
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

describe('switchLocaleRoute', () => {
  test('keeps params, query and hash; i18nRouteParams replace params per locale', () => {
    const { i18n, at, url } = setup('prefix_except_default')
    const route = at('/blog/hello?q=1#top')
    expect(url(i18n.switchLocaleRoute('en', 'de', route))).toBe('/de/artikel/hello?q=1#top')
    expect(url(i18n.switchLocaleRoute('en', 'de', route, { i18nRouteParams: { de: { slug: 'hallo' } } }))).toBe('/de/artikel/hallo?q=1#top')
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
    expect(i18n.switchLocaleRoute('en', 'fr', from)).toMatchObject({ fullPath: '/fr/about?q=1' })
    expect(i18n.switchLocaleRoute('en', 'de', from)).toBe('https://b.test/shop/ueber-uns?q=1')
  })

  test('per-locale params still apply; an origin no locale has is left alone', () => {
    const { i18n } = setup('prefix_except_default', {}, locales)
    const from = i18n.localeRoute('de', '/blog/x') as ResolvedRouteLike
    expect(from.fullPath).toMatch(/^https:\/\/b\.test\/shop\//)
    const switched = i18n.switchLocaleRoute('de', 'fr', from, { i18nRouteParams: { fr: { slug: 'y' } } })
    expect(switched).toMatchObject({ fullPath: expect.stringMatching(/\/y$/) })
    const other = { name: undefined, path: 'https://other.test/about-us', fullPath: 'https://other.test/about-us' }
    expect(String((i18n.switchLocaleRoute('en', 'fr', other) as ResolvedRouteLike).fullPath)).not.toContain('about-us/')
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

  test('a redirect never targets a locale the host does not serve', () => {
    const onA = (strategy: Strategies) =>
      setup(strategy, { locales: locales.filter((l) => l.code !== 'de'), linkLocales: locales, domain: 'a.test' }, locales)
    // under prefix a page only another domain serves stays: a 404 of the router, not a hop to one
    expect(onA('prefix').i18n.getClientRedirect('/de-only', 'en')).toBeNull()
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
    expect(i18n.switchLocaleRoute('de', 'en', at('/ueber-uns'))).toBe('https://a.test/#/about-us')
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
    expect(url(i18n.switchLocaleRoute('fr', 'de', at('/fr/custom-page?q=1')))).toBe('/de/eigene-seite?q=1')
    expect(url(i18n.switchLocaleRoute('de', 'en', at('/de/eigene-seite')))).toBe('/custom-page')
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
    expect((i18n.switchLocaleRoute(i18n.getCurrentLocale(route), to, route) as RouteLike).fullPath).toBe(expected)
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
        i18n.localeRoute(locale, source, current)
        i18n.localeRoute(locale, current, current)
        i18n.localeRoute(locale, '/contact', current)
        i18n.switchLocaleRoute('de', locale, current, options)
      }
      i18n.getRouteBaseName(current)
      i18n.getCurrentLocale(current)
      i18n.pageLocales(current)
      // the frozen inputs still produced a real answer
      expect(i18n.getRouteBaseName(current)).toBe('blog-slug')
      expect(i18n.switchLocaleRoute('de', 'fr', current, options)).toMatchObject({ params: { slug: 'salut' } })
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
    expect(i18n.switchLocaleRoute('en', 'de', route)).toBe(route)
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
