import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { GlobalLocaleRoutes, Locale, Strategies } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'
import { describe, expect, test, vi } from 'vitest'
import { isLocaleAllowedForUnlocalizedRoute, normalizeRouteKey, RouteGenerator, type RouteGeneratorOptions } from '../src'

const locales: Locale[] = [{ code: 'en' }, { code: 'de' }, { code: 'fr' }]

function generator(strategy: Strategies, options: Partial<RouteGeneratorOptions> = {}) {
  return new RouteGenerator({ locales, defaultLocaleCode: 'en', strategy, globalLocaleRoutes: {}, noPrefixRedirect: false, ...options })
}

/** Generated routes as `name path` lines (children indented, aliases in brackets). */
function generate(strategy: Strategies, pages: NuxtPage[], options: Partial<RouteGeneratorOptions> = {}): string[] {
  const list = structuredClone(pages)
  generator(strategy, options).extendPages(list)
  const lines: string[] = []
  const walk = (routes: NuxtPage[], depth: number) => {
    for (const r of routes) {
      const alias = r.alias?.length ? ` [${r.alias.join(', ')}]` : ''
      const redirect = r.redirect ? ` -> ${String(r.redirect)}` : ''
      lines.push(`${'  '.repeat(depth)}${r.name ?? '-'} ${r.path}${alias}${redirect}`)
      if (r.children) walk(r.children, depth + 1)
    }
  }
  walk(list, 0)
  return lines
}

const about: NuxtPage = { path: '/about', name: 'about', file: 'pages/about.vue' }
const account: NuxtPage = {
  path: '/account',
  file: 'pages/account.vue',
  children: [
    { path: '', name: 'account', file: 'pages/account/index.vue' },
    {
      path: 'orders',
      name: 'account-orders',
      file: 'pages/account/orders.vue',
      children: [{ path: ':id()', name: 'account-orders-id', file: 'pages/account/orders/[id].vue' }],
    },
  ],
}

describe('strategies', () => {
  test('prefix_except_default: default unprefixed, locales sharing a path share one record', () => {
    expect(generate('prefix_except_default', [about])).toEqual(['about /about', 'localized-about /:locale(de|fr)/about'])
  })

  test('prefix: every locale prefixed', () => {
    expect(generate('prefix', [about])).toEqual(['localized-about /:locale(en|de|fr)/about'])
  })

  test('prefix_and_default: default served unprefixed and prefixed', () => {
    expect(generate('prefix_and_default', [about])).toEqual(['about /about', 'localized-about /:locale(en|de|fr)/about'])
  })

  test('no_prefix: the page as written', () => {
    expect(generate('no_prefix', [about])).toEqual(['about /about'])
  })

  test('every localized record says which page and locales it serves', () => {
    const pages = [structuredClone(about)]
    generator('prefix_except_default', { globalLocaleRoutes: { about: { de: '/ueber-uns' } } }).extendPages(pages)
    expect(pages.map((p) => [p.name, p.meta?.i18n])).toEqual([
      ['about', { name: 'about', locales: ['en'] }],
      ['localized-about', { name: 'about', locales: ['fr'] }],
      ['localized-about-de', { name: 'about', locales: ['de'] }],
    ])
  })
})

describe('custom paths', () => {
  const rules: GlobalLocaleRoutes = { about: { en: '/about-us', de: '/ueber-uns' } }

  test.each([
    ['prefix_except_default', ['about /about-us [/about]', 'localized-about /:locale(fr)/about', 'localized-about-de /:locale(de)/ueber-uns']],
    [
      'prefix',
      [
        'redirect-about /about -> /en/about-us',
        'localized-about /:locale(fr)/about',
        'localized-about-en /:locale(en)/about-us',
        'localized-about-de /:locale(de)/ueber-uns',
      ],
    ],
    [
      'prefix_and_default',
      [
        'about /about-us',
        'localized-about /:locale(fr)/about',
        'localized-about-en /:locale(en)/about-us',
        'localized-about-de /:locale(de)/ueber-uns',
      ],
    ],
    ['no_prefix', ['about /about', 'localized-about-en /about-us', 'localized-about-de /ueber-uns']],
  ] as const)('%s', (strategy, expected) => {
    expect(generate(strategy, [about], { globalLocaleRoutes: rules })).toEqual(expected)
  })

  test('a value equal to the original path is no custom path', () => {
    expect(generate('prefix_except_default', [about], { globalLocaleRoutes: { about: { de: '/about', fr: 'about' } } })).toEqual([
      'about /about',
      'localized-about /:locale(de|fr)/about',
    ])
  })

  test('file-path values: brackets, optional and catch-all params, doubled slashes', () => {
    const pages: NuxtPage[] = [
      { path: '/blog/:slug()', name: 'blog-slug', file: 'pages/blog/[slug].vue' },
      { path: '/docs/:page?', name: 'docs-page', file: 'pages/docs/[[page]].vue' },
      { path: '/shop/:all(.*)*', name: 'shop-all', file: 'pages/shop/[...all].vue' },
    ]
    const globalLocaleRoutes = {
      'blog/[slug]': { de: '/artikel/[slug]' },
      'docs/[[page]]': { de: '/doku/[[page]]' },
      'shop/[...all]': { de: '/laden//[...all]' },
    }
    expect(generate('prefix_except_default', pages, { globalLocaleRoutes }).filter((l) => l.includes('-de '))).toEqual([
      'localized-blog-slug-de /:locale(de)/artikel/:slug',
      'localized-docs-page-de /:locale(de)/doku/:page?',
      'localized-shop-all-de /:locale(de)/laden/:all(.*)*',
    ])
  })

  test('a value that starts with its locale code warns: the prefix is added', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    generate('prefix', [about], { globalLocaleRoutes: { about: { fr: '/fr/a-propos' } } })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('starts with the locale code'))
    warn.mockRestore()
  })

  test('key forms: the file path wins over the name; `/name` is a path, not a name', () => {
    const child: NuxtPage[] = [
      { path: '/about', name: 'about', file: 'pages/about.vue', children: [{ path: 'team', name: 'about-team', file: 'pages/about/team.vue' }] },
    ]
    const de = (rules: GlobalLocaleRoutes) =>
      generate('prefix_except_default', child, { globalLocaleRoutes: rules })
        .find((l) => l.includes('about-team-de'))
        ?.trim()
    expect(de({ 'about-team': { de: 'name' }, 'about/team': { de: 'path' } })).toBe('localized-about-team-de path')
    expect(de({ 'about-team': { de: 'name' } })).toBe('localized-about-team-de name')
    expect(de({ '/about-team': { de: 'slashed' } })).toBeUndefined()
  })
})

describe('nested pages', () => {
  const rules: GlobalLocaleRoutes = { account: { de: '/konto' }, 'account/orders': { de: '/konto/bestellungen', fr: 'commandes' } }

  test('child values: relative, or a full URL under the localized parent; one tree per locale', () => {
    expect(generate('prefix_except_default', [account], { globalLocaleRoutes: rules })).toEqual([
      '- /account',
      '  account ',
      '  account-orders orders',
      '    account-orders-id :id()',
      '- /:locale(de)/konto',
      '  localized-account-de ',
      '  localized-account-orders-de bestellungen',
      '    localized-account-orders-id-de :id()',
      '- /:locale(fr)/account',
      '  localized-account-fr ',
      '  localized-account-orders-fr commandes',
      '    localized-account-orders-id-fr :id()',
    ])
  })

  test('an unnamed parent with an index child stays unnamed (no duplicate route names)', () => {
    const names = generate('prefix', [account]).map((l) => l.trim().split(' ')[0])
    expect(names.filter((n) => n !== '-')).toEqual([...new Set(names.filter((n) => n !== '-'))])
  })

  test('no_prefix: a locale whose child differs gets its own tree at the same parent path', () => {
    expect(generate('no_prefix', [account], { globalLocaleRoutes: { 'account/orders': { fr: 'commandes' } } })).toEqual([
      '- /account',
      '  account ',
      '  account-orders orders',
      '    account-orders-id :id()',
      '- /account',
      '  localized-account-fr ',
      '  localized-account-orders-fr commandes',
      '    localized-account-orders-id-fr :id()',
    ])
  })
})

describe('restrictions and unlocalized pages', () => {
  test('routeLocales / $defineI18nRoute locales', () => {
    expect(generate('prefix_except_default', [about], { routeLocales: { about: ['de'] } })).toEqual(['localized-about /:locale(de)/about'])
    expect(generate('prefix', [about], { routeLocales: { '/about': ['en', 'fr'] } })).toEqual(['localized-about /:locale(en|fr)/about'])
  })

  test('a restricted child is left out of that locale', () => {
    expect(generate('prefix', [account], { routeLocales: { 'account/orders': ['en'] } })).toEqual([
      '- /:locale(en)/account',
      '  localized-account ',
      '  localized-account-orders orders',
      '    localized-account-orders-id :id()',
      '- /:locale(de)/account',
      '  localized-account-de ',
      '- /:locale(fr)/account',
      '  localized-account-fr ',
    ])
  })

  test('false, excludePatterns and redirect-only pages are kept as written', () => {
    const pages: NuxtPage[] = [about, { path: '/admin', name: 'admin', file: 'pages/admin.vue' }, { path: '/old', redirect: '/about' }]
    expect(generate('prefix', pages, { globalLocaleRoutes: { admin: false }, excludePatterns: ['/about'] })).toEqual([
      'about /about',
      'admin /admin',
      '- /old -> /about',
    ])
  })

  test('an unlocalized child is kept in the unprefixed tree only', () => {
    expect(generate('prefix_except_default', [account], { globalLocaleRoutes: { 'account/orders': false } })).toEqual([
      '- /account',
      '  account ',
      '  account-orders orders',
      '    account-orders-id :id()',
      '- /:locale(de|fr)/account',
      '  localized-account ',
    ])
  })
})

describe('aliases and options', () => {
  test('declared aliases follow the record prefix; non-ASCII paths get an encoded alias', () => {
    const page: NuxtPage = { path: '/über', name: 'uber', file: 'pages/über.vue', alias: ['/company'] }
    expect(generate('prefix_except_default', [page])).toEqual([
      'uber /über [/%C3%BCber, /company]',
      'localized-uber /:locale(de|fr)/über [/:locale(de|fr)/%C3%BCber, /:locale(de|fr)/company]',
    ])
  })

  test('localizedRouteNamePrefix, customRegexMatcher, noPrefixRedirect', () => {
    expect(generate('prefix', [about], { localizedRouteNamePrefix: 'i18n-', customRegexMatcher: '[a-z]{2}' })).toEqual([
      'i18n-about /:locale([a-z]{2})/about',
    ])
    expect(generate('no_prefix', [about], { noPrefixRedirect: true, globalLocaleRoutes: { about: { en: '/about-us' } } })).toEqual([
      'about /about -> /about-us',
      'localized-about-en /about-us',
    ])
  })
})

describe('nitro helpers', () => {
  test('resolveLocalizedPath follows the generated pages, and rules before extendPages', () => {
    const rules: GlobalLocaleRoutes = { account: { de: '/konto' }, 'account/orders': { de: 'bestellungen' } }
    const g = generator('prefix_except_default', { globalLocaleRoutes: rules })
    expect(g.resolveLocalizedPath('/account', 'de')).toBe('/de/konto')
    g.extendPages(structuredClone([account]))
    expect(g.resolveLocalizedPath('/account/orders', 'de')).toBe('/de/konto/bestellungen')
    expect(g.resolveLocalizedPath('/account/orders', 'en')).toBe('/account/orders')
    expect(g.resolveLocalizedPath('/api/**', 'fr')).toBe('/fr/api/**')
    expect(generator('prefix').resolveLocalizedPath('/', 'en')).toBe('/en')
    expect(generator('no_prefix').resolveLocalizedPath('/about', 'de')).toBe('/about')
  })

  test('isLocaleAllowedForUnlocalizedRoute accepts every key form', () => {
    const routeLocales = { 'de-only': ['de'], '/about': ['en', 'xx'] }
    expect(isLocaleAllowedForUnlocalizedRoute(routeLocales, locales, '/de-only', 'en')).toBe(false)
    expect(isLocaleAllowedForUnlocalizedRoute(routeLocales, locales, 'about', 'en')).toBe(true)
    expect(isLocaleAllowedForUnlocalizedRoute(routeLocales, locales, '/about', 'fr')).toBe(false)
    expect(isLocaleAllowedForUnlocalizedRoute(routeLocales, locales, '/other', 'fr')).toBe(true)
  })

  test('generateDataRoutes and ensureTranslationFilesExist', () => {
    const g = generator('prefix', { locales: [{ code: 'en' }, { code: 'de', disabled: true }] })
    expect(g.generateDataRoutes([account], '_locales', false)).toEqual([
      '/_locales/index/en/data.json',
      '/_locales/account/en/data.json',
      '/_locales/account-orders/en/data.json',
      '/_locales/account-orders-id/en/data.json',
    ])
    expect(g.generateDataRoutes([account], '_locales', true)).toEqual(['/_locales/index/en/data.json'])
    const root = mkdtempSync(join(tmpdir(), 'route-strategy-'))
    g.ensureTranslationFilesExist(['about'], 'locales', root)
    expect(readFileSync(join(root, 'locales/pages/about/en.json'), 'utf-8')).toBe('{}')
  })

  test('normalizeRouteKey', () => {
    expect(normalizeRouteKey('/blog/[slug]/[[page]]/[...rest]')).toBe('/blog/:slug/:page?/:rest(.*)*')
    expect(normalizeRouteKey('/post-[id]/:year()/:n(\\d+)')).toBe('/post-:id/:year/:n(\\d+)')
  })
})
