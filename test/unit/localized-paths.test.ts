import { RouteGenerator } from '@i18n-micro/route-strategy'
import type { Locale } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'
import { describe, expect, test } from 'vitest'
import { createLocalizedPathResolver, unfixedOriginWarning } from '../../src/localized-paths'

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
