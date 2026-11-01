/**
 * Model of routing on real tables: pages through RouteGenerator into vue-router, then the strategy. The
 * reference is a URL table written from `docs/guide/strategy.md`, plus a fresh instance with cold caches.
 * Fixed seed, so a failure repeats.
 */
import { RouteGenerator } from '@i18n-micro/route-strategy'
import type { Locale, Strategies } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'
import fc from 'fast-check'
import { beforeAll, describe, expect, test, vi } from 'vitest'
import { createMemoryHistory, createRouter, type RouteRecordRaw, type Router } from 'vue-router'
import { createPathStrategy, type RouteLike } from '../src'

const SEED = 42
const RUNS = 1500
const check = <T extends unknown[]>(property: fc.IProperty<T>, numRuns = RUNS) => fc.assert(property, { numRuns, seed: SEED })
const checkAsync = <T extends unknown[]>(property: fc.IAsyncProperty<T>, numRuns: number) => fc.assert(property, { numRuns, seed: SEED })

const STRATEGIES: Strategies[] = ['prefix', 'prefix_except_default', 'prefix_and_default', 'no_prefix']
const LOCALES: Locale[] = [
  { code: 'en', iso: 'en-US' },
  { code: 'de', iso: 'de-DE' },
  { code: 'pt-br', iso: 'pt-BR' },
]
const DEFAULT = 'en'
const PAGES = (): NuxtPage[] => [
  { path: '/', name: 'index', file: 'pages/index.vue' },
  { path: '/about', name: 'about', file: 'pages/about.vue' },
  { path: '/blog/:slug()', name: 'blog-slug', file: 'pages/blog/[slug].vue' },
  { path: '/docs/:path(.*)*', name: 'docs-path', file: 'pages/docs/[...path].vue' },
  { path: '/only-de', name: 'only-de', file: 'pages/only-de.vue' },
  { path: '/free', name: 'free', file: 'pages/free.vue' },
]
const RULES = { about: { en: '/about', de: '/ueber-uns', 'pt-br': '/sobre' }, free: false } as const
const ABOUT: Record<string, string> = RULES.about

const toRecord = (page: NuxtPage): RouteRecordRaw =>
  ({
    path: page.path,
    name: page.name,
    ...(page.meta ? { meta: page.meta } : {}),
    ...(page.redirect ? { redirect: page.redirect } : { component: {} }),
    ...(page.alias?.length ? { alias: page.alias } : {}),
    ...(page.children?.length ? { children: page.children.map(toRecord) } : {}),
  }) as RouteRecordRaw

interface Table {
  router: Router
  strategy: ReturnType<typeof createPathStrategy>
}

let unique = 0
function table(name: Strategies): Table {
  const pages = PAGES()
  new RouteGenerator({
    locales: LOCALES,
    defaultLocaleCode: DEFAULT,
    strategy: name,
    globalLocaleRoutes: structuredClone(RULES) as never,
    routeLocales: { 'only-de': ['de'] },
    noPrefixRedirect: false,
  }).extendPages(pages)
  // a record of its own: the process-wide tables key on the records, so this instance starts cold
  const id = `__cold${unique++}`
  pages.push({ path: `/${id}`, name: id })
  const router = createRouter({ history: createMemoryHistory(), routes: pages.map(toRecord) })
  return { router, strategy: createPathStrategy({ strategy: name, defaultLocale: DEFAULT, locales: LOCALES, router }) }
}

const tables = new Map<Strategies, Table>()
const shared = (name: Strategies) => {
  if (!tables.has(name)) tables.set(name, table(name))
  return tables.get(name)!
}

const hasPrefix = (name: Strategies, locale: string) =>
  name === 'prefix' || name === 'prefix_and_default' || (name === 'prefix_except_default' && locale !== DEFAULT)
function urlOf(name: Strategies, locale: string, page: string): string {
  const prefix = hasPrefix(name, locale) ? `/${locale}` : ''
  return page === 'index' ? prefix || '/' : prefix + ABOUT[locale]
}

const SLUGS = [
  'a',
  'hello-world',
  'ключ',
  'ü ü',
  'a+b',
  'a%b',
  '100%',
  'a/b',
  'a?b',
  'a#b',
  '%2F',
  '.',
  '..',
  'en',
  'de',
  '日本語',
  '😀',
  "o'k",
  'a&b=c',
  'a;b',
]
const slug = fc.oneof(
  fc.constantFrom(...SLUGS),
  fc.string({ minLength: 1, maxLength: 6, unit: fc.constantFrom('a', 'é', '/', '%', ' ', '-', '.', '?', '#', '+', '\\') }),
)
const query = fc.option(
  fc.dictionary(
    fc.constantFrom('q', 'x', 'тег', 'a b'),
    fc.oneof(fc.constantFrom('1', 'ü', 'a b', 'a&b', '#', ''), fc.array(fc.constantFrom('1', '2'), { minLength: 2, maxLength: 2 })),
    { maxKeys: 2 },
  ),
  { nil: undefined },
)
const hash = fc.constantFrom('', '#x', '#ю', '#a%20b', '#a b')
const strategyName = fc.constantFrom(...STRATEGIES)
const locale = fc.constantFrom(...LOCALES.map((item) => item.code))
const page = fc.constantFrom('index', 'about', 'blog-slug', 'docs-path')

const paramsOf = (name: string, value: string) =>
  name === 'blog-slug' ? { slug: value } : name === 'docs-path' ? { path: value.split('/').filter(Boolean) } : {}
const usable = (name: string, value: string) => name !== 'docs-path' || value.split('/').some(Boolean)
const fullPath = (route: RouteLike | string) => (typeof route === 'string' ? route : route.fullPath!)

const PIECES = [
  '/',
  '//',
  '\\',
  '/\\',
  '\t',
  '\n',
  ' ',
  '%2F',
  '%2f',
  '%5C',
  '%09',
  'evil.example',
  'en',
  'de',
  'DE',
  'pt-br',
  'about',
  'blog',
  'docs',
  'free',
  'only-de',
  '..',
  '.',
  '%2e',
  '%00',
  '?',
  '#',
  '@',
  ':',
  'http:',
  'https://evil.example',
  'javascript:alert(1)',
  '%',
]
const hostile = fc.array(fc.constantFrom(...PIECES), { maxLength: 7 }).map((pieces) => pieces.join(''))
const leavesOrigin = (url: unknown) => {
  if (typeof url !== 'string') return false
  try {
    return new URL(url, 'http://h.test/x/y').origin !== 'http://h.test'
  } catch {
    return false
  }
}

const KNOWN_URLS = [
  '/',
  '/about',
  '/de',
  '/de/ueber-uns',
  '/en/about',
  '/ueber-uns',
  '/free',
  '/de/free',
  '/only-de',
  '/de/only-de',
  '/en/only-de',
  '/blog/x',
  '/de/blog/x',
  '/docs/a/b',
  '/nope',
  '/de/nope',
  '/xx/about',
  '/DE/about',
]
const url = fc.oneof(
  hostile.map((raw) => `/${raw}`),
  fc
    .tuple(locale, page, slug)
    .map(
      ([code, name, value]) =>
        `/${code}/${name === 'index' ? '' : name === 'about' ? 'about' : name === 'blog-slug' ? `blog/${encodeURIComponent(value)}` : `docs/${encodeURI(value)}`}`,
    ),
  fc.constantFrom(...KNOWN_URLS),
)
const step = fc.oneof(
  fc.record({ kind: fc.constant('push' as const), url }),
  fc.record({ kind: fc.constant('byName' as const), locale, page, value: slug, query, hash }),
  fc.record({ kind: fc.constant('noParams' as const), locale, page }),
  fc.record({ kind: fc.constant('byUrl' as const), locale, url }),
  fc.record({ kind: fc.constant('switch' as const), locale }),
  fc.record({ kind: fc.constant('switchUrl' as const), locale, url }),
  fc.record({ kind: fc.constant('notFound' as const), url }),
  fc.record({ kind: fc.constant('redirect' as const), locale, url, switchPrefixed: fc.boolean() }),
  fc.record({ kind: fc.constant('baseOfUrl' as const), url }),
  fc.record({ kind: fc.constant('baseOfName' as const), page }),
)
type Step = typeof step extends fc.Arbitrary<infer T> ? T : never

function bare(route: RouteLike | string | null | undefined) {
  if (typeof route === 'string' || !route) return route
  const { name, path, fullPath, query, hash } = route
  return { name: typeof name === 'string' ? name : undefined, path, fullPath, query, hash }
}

async function answer({ router, strategy }: Table, item: Step): Promise<unknown> {
  const resolved = (to: string) => {
    try {
      return router.resolve(to)
    } catch {
      return null
    }
  }
  switch (item.kind) {
    case 'push':
      await router.push(item.url).catch(() => {})
      return null
    case 'byName':
      return usable(item.page, item.value)
        ? bare(strategy.localeRoute(item.locale, { name: item.page, params: paramsOf(item.page, item.value), query: item.query, hash: item.hash }))
        : null
    case 'noParams':
      return bare(strategy.localeRoute(item.locale, { name: item.page }))
    case 'byUrl':
      return bare(strategy.localeRoute(item.locale, item.url))
    case 'switch':
      return bare(strategy.switchLocaleRoute(item.locale, router.currentRoute.value))
    case 'switchUrl': {
      const route = resolved(item.url)
      return route ? bare(strategy.switchLocaleRoute(item.locale, route)) : null
    }
    case 'notFound':
      return strategy.shouldReturn404(item.url)
    case 'redirect':
      return strategy.getClientRedirect(item.url, item.locale, { switchPrefixed: item.switchPrefixed })
    case 'baseOfUrl':
      return strategy.getRouteBaseName({ path: item.url })
    case 'baseOfName':
      return strategy.getRouteBaseName({ name: item.page })
  }
}

describe('routing model', () => {
  beforeAll(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  test('name to URL and back: same page, locale, params, query', () => {
    check(
      fc.property(strategyName, locale, page, slug, query, hash, (name, code, target, value, search, fragment) => {
        fc.pre(usable(target, value))
        const { router, strategy } = shared(name)
        const route = strategy.localeRoute(code, { name: target, params: paramsOf(target, value), query: search, hash: fragment })
        const back = router.resolve(route.fullPath!)
        expect(strategy.getRouteBaseName(back)).toBe(target)
        if (name !== 'no_prefix') {
          expect(strategy.getCurrentLocale(back)).toBe(code)
          expect(strategy.resolveLocaleFromPath(route.fullPath!)).toBe(code)
        }
        if (target === 'blog-slug') expect(back.params.slug).toBe(value)
        if (target === 'docs-path') expect(back.params.path).toEqual(paramsOf(target, value).path)
        expect(back.query).toEqual(router.resolve({ path: '/', query: search }).query)
        if (name !== 'no_prefix' && (target === 'index' || target === 'about')) expect(route.path).toBe(urlOf(name, code, target))
      }),
    )
  })

  test('a path string lands where the name does', () => {
    check(
      fc.property(strategyName, locale, locale, page, slug, (name, from, to, target, value) => {
        fc.pre(name !== 'no_prefix' && usable(target, value))
        const { strategy } = shared(name)
        const params = paramsOf(target, value)
        const written = strategy.localeRoute(from, { name: target, params }).fullPath!
        expect(strategy.localeRoute(to, written).fullPath).toBe(strategy.localeRoute(to, { name: target, params }).fullPath)
      }),
    )
  })

  test('a switch there and back returns the URL, and a second switch changes nothing', () => {
    check(
      fc.property(strategyName, locale, locale, page, slug, query, hash, (name, a, b, target, value, search, fragment) => {
        fc.pre(name !== 'no_prefix' && usable(target, value))
        const { router, strategy } = shared(name)
        const start = strategy.localeRoute(a, { name: target, params: paramsOf(target, value), query: search, hash: fragment }).fullPath!
        const there = fullPath(strategy.switchLocaleRoute(b, router.resolve(start)))
        const landed = router.resolve(there)
        expect(strategy.getCurrentLocale(landed)).toBe(b)
        expect(fullPath(strategy.switchLocaleRoute(b, landed))).toBe(there)
        expect(fullPath(strategy.switchLocaleRoute(a, landed))).toBe(start)
      }),
    )
  })

  test('nothing leaves the origin, whatever the path', () => {
    check(
      fc.property(strategyName, locale, locale, hostile, (name, a, b, raw) => {
        const { router, strategy } = shared(name)
        const path = raw.startsWith('/') ? raw : `/${raw}`
        const answers: (RouteLike | string | null)[] = [
          strategy.localeRoute(a, raw),
          strategy.localeRoute(a, path),
          strategy.getClientRedirect(path, a, { switchPrefixed: true }),
          strategy.getClientRedirect(path, a),
        ]
        let route = null
        try {
          route = router.resolve(path)
        } catch {
          // the router refuses some of these itself
        }
        if (route)
          answers.push(
            strategy.switchLocaleRoute(b, route),
            strategy.switchLocaleRoute(b, { path, fullPath: path, params: {}, name: undefined, matched: [] }),
          )
        for (const item of answers)
          for (const target of typeof item === 'object' && item ? [item.path, item.fullPath] : [item]) expect(leavesOrigin(target)).toBe(false)
      }),
      RUNS * 3,
    )
  })

  test('a client redirect settles in one hop, and never on a 404', () => {
    check(
      fc.property(strategyName, locale, page, slug, locale, (name, code, target, value, preferred) => {
        fc.pre(usable(target, value))
        const { strategy } = shared(name)
        const start = strategy.localeRoute(code, { name: target, params: paramsOf(target, value) }).path!
        for (const options of [{}, { switchPrefixed: true }]) {
          const hop = strategy.getClientRedirect(start, preferred, options)
          if (hop === null) continue
          expect(strategy.getClientRedirect(hop, preferred, options)).toBeNull()
          expect(strategy.shouldReturn404(hop)).toBeFalsy()
        }
      }),
    )
  })

  test('the URL of a served page is no 404', () => {
    check(
      fc.property(strategyName, locale, page, slug, (name, code, target, value) => {
        fc.pre(usable(target, value))
        const { strategy } = shared(name)
        expect(strategy.shouldReturn404(strategy.localeRoute(code, { name: target, params: paramsOf(target, value) }).path!)).toBeFalsy()
      }),
    )
  })

  test('warm caches answer like a cold instance, after any sequence', async () => {
    await checkAsync(
      fc.asyncProperty(strategyName, fc.array(step, { minLength: 1, maxLength: 12 }), async (name, steps) => {
        const warm = table(name)
        await warm.router.push('/').catch(() => {})
        for (const item of steps) {
          const got = await answer(warm, item)
          if (item.kind === 'push') continue
          const cold = table(name)
          await cold.router.push(warm.router.currentRoute.value.fullPath).catch(() => {})
          expect(JSON.stringify(got)).toBe(JSON.stringify(await answer(cold, item)))
        }
      }),
      100,
    )
  })
})
