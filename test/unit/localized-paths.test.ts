import { RouteGenerator } from '@i18n-micro/route-strategy'
import type { Locale } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'
import { describe, expect, test } from 'vitest'
import { createLocalizedPathResolver, seedPrerenderRoutes, unfixedOriginWarning } from '../../src/localized-paths'

const locales: Locale[] = [{ code: 'en' }, { code: 'de' }, { code: 'fr' }]

async function resolver(strategy: 'prefix' | 'prefix_except_default') {
  const pages: NuxtPage[] = [
    { path: '/', name: 'index', file: 'pages/index.vue' },
    { path: '/about', name: 'about', file: 'pages/about.vue' },
    { path: '/blog/:slug()', name: 'blog-slug', file: 'pages/blog/[slug].vue' },
    { path: '/de-only', name: 'de-only', file: 'pages/de-only.vue' },
    { path: '/unloc', name: 'unloc', file: 'pages/unloc.vue' },
  ]
  new RouteGenerator({
    locales,
    defaultLocaleCode: 'en',
    strategy,
    globalLocaleRoutes: { about: { de: '/ueber-uns' }, 'blog/[slug]': { de: '/artikel/[slug]' }, unloc: false },
    routeLocales: { 'de-only': ['de'] },
    noPrefixRedirect: false,
  }).extendPages(pages)
  return createLocalizedPathResolver(pages, { strategy, defaultLocale: 'en', locales })
}

describe('seedPrerenderRoutes', () => {
  interface Seed {
    static?: string[]
    prefixedOnly?: boolean
    off?: string[]
    strategy?: 'prefix' | 'prefix_except_default'
  }

  const seed = async (list: string[], options: Seed) => {
    const routes = new Set(list)
    const result = seedPrerenderRoutes(routes, {
      localize: await resolver(options.strategy ?? 'prefix_except_default'),
      locales,
      staticPaths: options.static ?? null,
      prefixedOnly: options.prefixedOnly ?? false,
      prerendered: (route) => !options.off?.includes(route),
      isInternal: (route) => route.startsWith('/_'),
    })
    return { routes: [...routes], ...result }
  }

  const cases: [string[], Seed, string[]][] = [
    // an SSR build: only what is listed, in every locale that serves it
    [['/about'], {}, ['/about', '/de/ueber-uns', '/fr/about']],
    [['/about', '/_locales/index/en/data.json', '/robots.txt'], {}, ['/about', '/robots.txt', '/de/ueber-uns', '/fr/about']],
    [['/unloc', '/de-only'], {}, ['/unloc', '/de-only', '/de/de-only']],
    [['/about'], { off: ['/de/ueber-uns'] }, ['/about', '/fr/about']],
    [['/about'], { off: ['/about'] }, ['/about']],
    // static output: the pages and the localized roots are seeded
    [[], { static: ['/', '/about'] }, ['/', '/de', '/fr', '/about', '/de/ueber-uns', '/fr/about']],
    [[], { static: ['/about'], off: ['/about', '/'] }, ['/de', '/fr']],
    // a prefix-only strategy: an unprefixed page goes, what is no page stays
    [['/about', '/unloc', '/feed'], { strategy: 'prefix', prefixedOnly: true }, ['/unloc', '/feed', '/en/about', '/de/ueber-uns', '/fr/about']],
  ]

  test.each(cases)('%j %j', async (list, options, expected) => {
    expect((await seed(list, options)).routes).toEqual(expected)
  })

  test('reports what it changed', async () => {
    const { added, removed } = await seed(['/about'], { strategy: 'prefix', prefixedOnly: true })
    expect(added).toEqual(['/en/about', '/de/ueber-uns', '/fr/about'])
    expect(removed).toEqual(['/about'])
  })
})

describe('unfixedOriginWarning', () => {
  const open = [{ code: 'en' }, { code: 'de', baseUrl: 'https://example.de' }]

  test('a domain and nothing that fixes the origin: the owner is told', () => {
    expect(unfixedOriginWarning(open, 'en')).toContain('no public origin is fixed')
  })

  test('any fixed origin, or no domains at all: silent', () => {
    expect(unfixedOriginWarning(open, 'en', 'https://example.com')).toBeNull()
    expect(unfixedOriginWarning(open, 'en', undefined, 'https://example.com')).toBeNull()
    expect(unfixedOriginWarning(open, 'de')).toBeNull()
    expect(unfixedOriginWarning([{ code: 'en' }], 'en')).toBeNull()
  })
})

describe('createLocalizedPathResolver (prerender)', () => {
  test('custom and dynamic paths per locale; nothing for pages a locale does not serve', async () => {
    // step 1: prefix_except_default → custom paths, dynamic ones included; the default keeps the URL as written
    const r = await resolver('prefix_except_default')
    expect(r.path('/about', 'de')).toBe('/de/ueber-uns')
    expect(r.path('/about', 'fr')).toBe('/fr/about')
    expect(r.path('/blog/hello', 'de')).toBe('/de/artikel/hello')
    expect(r.path('/', 'de')).toBe('/de')
    expect(r.path('/about', 'en')).toBeNull()

    // step 2: prefix → no URL for a locale the page is not served in, an unlocalized page or a non-page
    const p = await resolver('prefix')
    expect(p.path('/de-only', 'fr')).toBeNull()
    expect(p.path('/de-only', 'de')).toBe('/de/de-only')
    expect(p.path('/unloc', 'de')).toBeNull()
    expect(p.isUnlocalized('/unloc')).toBe(true)
    expect(p.path('/api/data', 'de')).toBeNull()
    expect(p.isPage('/api/data')).toBe(false)
    expect(p.localeOf('/de/about')).toBe('de')
  })
})
