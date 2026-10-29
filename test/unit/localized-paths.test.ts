import { RouteGenerator } from '@i18n-micro/route-strategy'
import type { Locale } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'
import { describe, expect, test } from 'vitest'
import { createLocalizedPathResolver } from '../../src/localized-paths'

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

describe('createLocalizedPathResolver (prerender)', () => {
  test('localizes pages with their custom paths, dynamic ones included', async () => {
    const r = await resolver('prefix_except_default')
    expect(r.path('/about', 'de')).toBe('/de/ueber-uns')
    expect(r.path('/about', 'fr')).toBe('/fr/about')
    expect(r.path('/blog/hello', 'de')).toBe('/de/artikel/hello')
    expect(r.path('/', 'de')).toBe('/de')
    // the default locale keeps the URL as written
    expect(r.path('/about', 'en')).toBeNull()
  })

  test('no URLs for locales a page is not served in, for unlocalized pages or for non-pages', async () => {
    const r = await resolver('prefix')
    expect(r.path('/de-only', 'fr')).toBeNull()
    expect(r.path('/de-only', 'de')).toBe('/de/de-only')
    expect(r.path('/unloc', 'de')).toBeNull()
    expect(r.isUnlocalized('/unloc')).toBe(true)
    expect(r.path('/api/data', 'de')).toBeNull()
    expect(r.isPage('/api/data')).toBe(false)
    expect(r.localeOf('/de/about')).toBe('de')
  })
})
