import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
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

describe('unnamed pages', () => {
  const generate = (page: NuxtPage) => {
    const pages = [page]
    new RouteGenerator({
      locales: [{ code: 'en' }, { code: 'de' }],
      defaultLocaleCode: 'en',
      strategy: 'prefix',
      globalLocaleRoutes: {},
      noPrefixRedirect: false,
    }).extendPages(pages)
    return pages.map((p) => p.path)
  }

  test("Nuxt's route-rule stub stays as written, a module's page is localized", () => {
    expect(generate({ path: '/old', file: '/nuxt/dist/pages/runtime/component-stub.js', _sync: true } as NuxtPage)).toEqual(['/old'])
    expect(generate({ path: '/from-module', file: '/mod/page.vue' })).toEqual(['/:locale(en|de)/from-module'])
  })
})

describe('names of unnamed pages', () => {
  test("a module's page gets the name the scanner would give it: records are addressed by name", () => {
    const names = (pages: NuxtPage[]) => {
      const list = structuredClone(pages)
      generator('prefix_except_default').extendPages(list)
      return list.map((p) => [p.name, p.meta?.i18n])
    }
    expect(names([{ path: '/a/:id()/:rest(.*)*', file: 'mod.vue' }])).toEqual([
      ['a-id-rest', { name: 'a-id-rest', locales: ['en'] }],
      ['localized-a-id-rest', { name: 'a-id-rest', locales: ['de', 'fr'] }],
    ])
    expect(generate('prefix', [{ path: '/parent', file: 'p.vue', children: [{ path: 'child', file: 'c.vue' }] }])).toEqual([
      'localized-parent /:locale(en|de|fr)/parent',
      '  localized-parent-child child',
    ])
    // a parent whose index child owns the name stays unnamed; a taken name stays with its page
    expect(generate('prefix', [{ path: '/p', file: 'p.vue', children: [{ path: '', name: 'p', file: 'i.vue' }] }])[0]).toBe('- /:locale(en|de|fr)/p')
    expect(generate('prefix', [about, { path: '/about', file: 'mod.vue' }]).map((l) => l.split(' ')[0])).toEqual(['localized-about', '-'])
  })
})

describe('resolveLocalizedRulePaths', () => {
  const generator = (strategy: 'prefix' | 'no_prefix') =>
    new RouteGenerator({
      locales: [{ code: 'en' }, { code: 'de' }],
      defaultLocaleCode: 'en',
      strategy,
      globalLocaleRoutes: {
        'blog/[slug]': { de: '/artikel/[slug]' },
        'blog/[id]': { de: '/[id]' },
        'blog/latest': { de: '/aktuell' },
        'blog/[...rest]': { de: '/archiv/[...rest]' },
        about: { de: '/ueber-uns' },
      },
      noPrefixRedirect: false,
    })

  test('a wildcard follows the custom paths of the pages under it', () => {
    // step 1: the prefix copy and the custom paths; a value that is only a param stays out
    // a param page keeps its param, a static page is exact: `/de/artikel-archiv` or a sibling tree gets nothing
    expect(generator('prefix').resolveLocalizedRulePaths('/blog/**', 'de')).toEqual([
      '/de/blog/**',
      '/de/artikel/:slug',
      '/de/aktuell',
      '/de/archiv/**',
    ])
    expect(generator('prefix').resolveLocalizedRulePaths('/blog/**', 'en')).toEqual(['/en/blog/**'])

    // step 2: no_prefix has no prefix, the custom path still moves
    expect(generator('no_prefix').resolveLocalizedRulePaths('/blog/**', 'de')).toEqual(['/blog/**', '/artikel/:slug', '/aktuell', '/archiv/**'])

    // step 3: an exact rule is one path
    expect(generator('prefix').resolveLocalizedRulePaths('/about', 'de')).toEqual(['/de/ueber-uns'])
  })
})

describe('resolveLocalizedRulePaths with child pages', () => {
  const generator = (globalLocaleRoutes: GlobalLocaleRoutes, parentPaths?: string[]) =>
    new RouteGenerator({
      locales: [{ code: 'en' }, { code: 'de' }],
      defaultLocaleCode: 'en',
      strategy: 'prefix',
      globalLocaleRoutes,
      noPrefixRedirect: false,
      parentPaths,
    })

  test('a relative child value hangs off its parent, as the page does', () => {
    // step 1: under a parent page
    const child = { 'blog/[slug]': { de: 'artikel/[slug]' } }
    expect(generator(child, ['blog']).resolveLocalizedRulePaths('/blog/**', 'de')).toEqual(['/de/blog/**', '/de/blog/artikel/:slug'])

    // step 2: under a parent with its own custom path; the parent's children move with it
    const moved = { blog: { de: '/beitraege' }, ...child }
    expect(generator(moved, ['blog']).resolveLocalizedRulePaths('/blog/**', 'de')).toEqual([
      '/de/blog/**',
      '/de/beitraege/**',
      '/de/beitraege/artikel/:slug',
    ])

    // step 3: no parent page: the value is the whole path
    expect(generator(child).resolveLocalizedRulePaths('/blog/**', 'de')).toEqual(['/de/blog/**', '/de/artikel/:slug'])
  })

  test("a custom value equal to another page's path stays that value", () => {
    const rules = { 'blog/latest': { de: '/about' }, about: { de: '/ueber-uns' } }
    expect(generator(rules).resolveLocalizedRulePaths('/blog/**', 'de')).toEqual(['/de/blog/**', '/de/about'])
  })
})

describe('a child path outside its parent', () => {
  test('warns once, naming the key; the routes stay as they were', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const pages: NuxtPage[] = [
      {
        path: '/parent',
        name: 'parent',
        file: 'pages/parent.vue',
        children: [{ path: 'child', name: 'parent-child', file: 'pages/parent/child.vue' }],
      },
    ]
    const generator = new RouteGenerator({
      locales: [{ code: 'en' }, { code: 'de' }],
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: { 'parent/child': { de: '/eltern/kind' } },
      noPrefixRedirect: false,
    })

    // step 1: the page stays nested, the warning says where
    generator.extendPages(pages)
    expect(generator.resolveLocalizedPath('/parent/child', 'de')).toBe('/de/parent/eltern/kind')
    expect(warn.mock.calls.map(([text]) => text)).toEqual([
      '[i18n] globalLocaleRoutes["parent/child"].de = "/eltern/kind" is outside its parent "/parent": the page is served at "/parent/eltern/kind".',
    ])

    // step 2: a value under the parent is its URL: no warning
    warn.mockClear()
    new RouteGenerator({
      locales: [{ code: 'en' }, { code: 'de' }],
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: { 'parent/child': { de: '/parent/kind' } },
      noPrefixRedirect: false,
    }).extendPages([
      {
        path: '/parent',
        name: 'parent',
        file: 'pages/parent.vue',
        children: [{ path: 'child', name: 'parent-child', file: 'pages/parent/child.vue' }],
      },
    ])
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
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
  test('every localized record says which page and locales it serves', () => {
    const pages = [structuredClone(about)]
    generator('prefix_except_default', { globalLocaleRoutes: { about: { de: '/ueber-uns' } } }).extendPages(pages)
    expect(pages.map((p) => [p.name, p.meta?.i18n])).toEqual([
      ['about', { name: 'about', locales: ['en'] }],
      ['localized-about', { name: 'about', locales: ['fr'] }],
      ['localized-about-de', { name: 'about', locales: ['de'] }],
    ])
  })

  test.each(['prefix_except_default', 'prefix', 'prefix_and_default', 'no_prefix'] as const)(
    '%s: every record keeps the file and the meta of its page',
    (strategy) => {
      const pages: NuxtPage[] = [{ ...about, meta: { layout: 'wide', auth: true } }]
      generator(strategy, { globalLocaleRoutes: { about: { de: '/ueber-uns' } } }).extendPages(pages)
      const records = pages.filter((p) => p.file)
      expect(records.length).toBeGreaterThan(1)
      for (const record of records) {
        expect({ file: record.file, ...record.meta }).toMatchObject({ file: 'pages/about.vue', layout: 'wide', auth: true })
      }
    },
  )

  test.each(['prefix_except_default', 'prefix', 'prefix_and_default', 'no_prefix'] as const)(
    '%s: the original page objects stay as they were (Nuxt keeps references to them)',
    (strategy) => {
      const freeze = (page: NuxtPage): NuxtPage => {
        page.children?.forEach(freeze)
        Object.freeze(page.children)
        return Object.freeze(page)
      }
      const page = freeze(structuredClone({ ...account, meta: { auth: true }, alias: ['/me'] }))
      const before = structuredClone(page)
      // frozen: a write throws in this strict module, so a mutation anywhere fails the call too
      generator(strategy, { globalLocaleRoutes: { account: { de: '/konto' }, 'account/orders': { de: 'bestellungen' } } }).extendPages([page])
      expect(page).toEqual(before)
    },
  )
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
    generate('prefix', [about], { globalLocaleRoutes: { about: { de: 'de/ueber-uns' } } })
    expect(warn).toHaveBeenCalledTimes(2)
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
    // `about` beats `/about` whatever the order, as for globalLocaleRoutes
    expect(generate('prefix', [about], { routeLocales: { about: ['de'], '/about': ['fr'] } })).toEqual(['localized-about /:locale(de)/about'])
    expect(generate('prefix', [about], { routeLocales: { '/about': ['fr'], about: ['de'] } })).toEqual(['localized-about /:locale(de)/about'])
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

  test('a custom path for a forbidden locale creates nothing', () => {
    const rules: GlobalLocaleRoutes = { about: { de: '/ueber-uns', fr: '/a-propos' } }
    expect(generate('prefix_except_default', [about], { globalLocaleRoutes: rules, routeLocales: { about: ['en', 'de'] } })).toEqual([
      'about /about',
      'localized-about-de /:locale(de)/ueber-uns',
    ])
  })

  test('a locale list without a known code does not restrict the page; unknown codes are dropped from a mixed one', () => {
    const everyLocale = ['about /about', 'localized-about /:locale(de|fr)/about']
    expect(generate('prefix_except_default', [about], { routeLocales: { about: [] } })).toEqual(everyLocale)
    expect(generate('prefix_except_default', [about], { routeLocales: { about: ['xx'] } })).toEqual(everyLocale)
    expect(generate('prefix_except_default', [about], { routeLocales: { about: ['en', 'xx', 'de'] } })).toEqual([
      'about /about',
      'localized-about /:locale(de)/about',
    ])
    expect(isLocaleAllowedForUnlocalizedRoute({ '/about': [] }, locales, '/about', 'fr')).toBe(true)
  })

  test('a page path that starts with a locale code is a page, the prefix goes in front of it', () => {
    const pages: NuxtPage[] = [{ path: '/de/contact', name: 'de-contact', file: 'pages/de/contact.vue' }]
    expect(generate('prefix_except_default', pages)).toEqual(['de-contact /de/contact', 'localized-de-contact /:locale(de|fr)/de/contact'])
    expect(generate('prefix', pages)).toEqual(['localized-de-contact /:locale(en|de|fr)/de/contact'])
  })

  test('a default locale outside the list, or disabled: a bare object, and no unprefixed record serves it', () => {
    const noDefault: Locale[] = [{ code: 'de' }, { code: 'fr' }]
    expect(generator('prefix_except_default', { locales: noDefault }).defaultLocale).toEqual({ code: 'en' })
    expect(generate('prefix_except_default', [about], { locales: noDefault })).toEqual(['localized-about /:locale(de|fr)/about'])

    const disabled = generator('prefix_except_default', { locales: [{ code: 'en', iso: 'en-US', disabled: true }, ...noDefault] })
    expect(disabled.defaultLocale).toEqual({ code: 'en' })
    expect(disabled.locales.map((l) => l.code)).toEqual(['de', 'fr'])
    expect(disabled.disabledLocales.map((l) => l.code)).toEqual(['en'])
  })

  test('an empty locale list leaves nothing to serve', () => {
    expect(generate('prefix_except_default', [about], { locales: [] })).toEqual([])
    expect(generate('prefix', [about], { locales: [] })).toEqual([])
  })

  test('a page under a custom apiBaseUrl is internal, like one under _locales', () => {
    const pages: NuxtPage[] = [{ name: 'x', path: '/custom/x', file: '/x.vue' }]
    expect(generate('prefix', pages, { apiBaseUrl: 'custom' })).toEqual(['x /custom/x'])
    expect(generate('prefix', pages)).not.toContain('x /custom/x')
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
    // a string redirect cannot carry `:id`
    const item: NuxtPage = { path: '/item/:id()', name: 'item-id', file: 'pages/item/[id].vue' }
    expect(generate('no_prefix', [item], { noPrefixRedirect: true, globalLocaleRoutes: { 'item/[id]': { en: '/thing/[id]' } } })).toEqual([
      'item-id /item/:id()',
      'localized-item-id-en /thing/:id',
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

  test('repeated locales: the project comes first in Nuxt, it wins and a layer fills the gaps', () => {
    const merged = [
      { code: 'en', displayName: 'Project' },
      { code: 'en', displayName: 'Layer', iso: 'en-GB' },
    ]
    expect(generator('prefix', { locales: merged }).locales).toEqual([{ code: 'en', displayName: 'Project', iso: 'en-GB' }])
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
    // an unnamed page has no chunk to prerender, its named children do
    const unnamed: NuxtPage[] = [{ path: '/from-module', file: 'mod.vue' }, about]
    expect(g.generateDataRoutes(unnamed, '_locales', false)).toEqual(['/_locales/index/en/data.json', '/_locales/about/en/data.json'])
  })

  test('ensureTranslationFilesExist: a root file per active locale, page files unless disablePageLocales', () => {
    const g = generator('prefix', { locales: [{ code: 'en' }, { code: 'de', disabled: true }, { code: 'fr' }] })
    const root = mkdtempSync(join(tmpdir(), 'route-strategy-'))
    const has = (file: string) => existsSync(join(root, file))

    // step 1: with page locales
    g.ensureTranslationFilesExist(['about'], 'locales', root)
    expect(readFileSync(join(root, 'locales/en.json'), 'utf-8')).toBe('{}')
    expect(readFileSync(join(root, 'locales/pages/about/fr.json'), 'utf-8')).toBe('{}')
    expect(['locales/de.json', 'locales/pages/about/de.json'].filter(has)).toEqual([])

    // step 2: disablePageLocales has root files only
    const flat = mkdtempSync(join(tmpdir(), 'route-strategy-'))
    g.ensureTranslationFilesExist(['about'], 'locales', flat, true)
    expect(existsSync(join(flat, 'locales/fr.json'))).toBe(true)
    expect(existsSync(join(flat, 'locales/pages'))).toBe(false)

    // step 3: an existing file is left alone
    writeFileSync(join(root, 'locales/en.json'), '{"a":"b"}')
    g.ensureTranslationFilesExist([], 'locales', root)
    expect(readFileSync(join(root, 'locales/en.json'), 'utf-8')).toBe('{"a":"b"}')
  })
})

describe('disableMeta', () => {
  test('lands in meta.i18n.noMeta of every record, custom paths and locale lists included', () => {
    const pages = [structuredClone(about), { path: '/shop', name: 'shop', file: 'pages/shop.vue' }]
    generator('prefix_except_default', {
      globalLocaleRoutes: { about: { de: '/ueber-uns' } },
      routeDisableMeta: { '/about': true, shop: ['de'] },
    }).extendPages(pages)
    const noMeta = Object.fromEntries(pages.map((p) => [p.name, (p.meta?.i18n as { noMeta?: unknown } | undefined)?.noMeta]))
    expect(noMeta).toEqual({ about: true, 'localized-about-de': true, 'localized-about': true, shop: ['de'], 'localized-shop': ['de'] })
  })

  test('an unlocalized page keeps it as meta.i18nNoMeta (it has no meta.i18n)', () => {
    const pages = [{ path: '/landing', name: 'landing', file: 'pages/landing.vue' }]
    generator('prefix', { globalLocaleRoutes: { landing: false }, routeDisableMeta: { landing: true } }).extendPages(pages)
    expect(pages.map((p) => [p.name, p.meta?.i18n, p.meta?.i18nNoMeta])).toEqual([['landing', undefined, true]])
  })
})

describe('no_prefix: a path shared by locales', () => {
  const generate = (rules: Record<string, Record<string, string>>, defaultLocale = 'en') => {
    const pages: NuxtPage[] = [{ path: '/about', name: 'about', file: 'pages/about.vue' }]
    new RouteGenerator({
      locales: [{ code: 'at' }, { code: 'en' }, { code: 'de' }],
      defaultLocaleCode: defaultLocale,
      strategy: 'no_prefix',
      globalLocaleRoutes: rules,
      noPrefixRedirect: true,
    }).extendPages(pages)
    return pages
  }

  test('is one record serving each of them', () => {
    const records = generate({ about: { de: '/ueber-uns', at: '/ueber-uns' } })
    expect(records.filter((page) => page.path === '/ueber-uns')).toHaveLength(1)
    expect(records.find((page) => page.path === '/ueber-uns')).toMatchObject({ name: 'localized-about-at', meta: { i18n: { name: 'about', locales: ['at', 'de'] } } })
  })

  test('different paths stay separate records', () => {
    const records = generate({ about: { de: '/ueber-uns', at: '/oesterreich' } })
    expect(records.map((page) => page.name)).toEqual(['about', 'localized-about-at', 'localized-about-de'])
  })

  test('noPrefixRedirect finds the default locale behind another code of the group', () => {
    const records = generate({ about: { en: '/shared', at: '/shared' } })
    expect(records.find((page) => page.name === 'about')?.redirect).toBe('/shared')
  })
})

describe('names repeated by generation', () => {
  const paths = (records: NuxtPage[]) => records.map((page) => [page.name, page.path])

  test('a page named like another page + locale keeps its record', () => {
    const pages: NuxtPage[] = [
      { path: '/about', name: 'about', file: 'pages/about.vue' },
      { path: '/about/de', name: 'about-de', file: 'pages/about/de.vue' },
    ]
    generator('prefix_except_default', { globalLocaleRoutes: { about: { de: '/ueber-uns' } }, locales: [{ code: 'en' }, { code: 'de' }] }).extendPages(pages)
    const names = pages.map((page) => page.name)
    expect(new Set(names).size).toBe(names.length)
    expect(paths(pages)).toEqual(
      expect.arrayContaining([
        ['localized-about-de', '/:locale(de)/ueber-uns'],
        ['localized-about-de-2', '/:locale(de)/about/de'],
      ]),
    )
    expect(pages.find((page) => page.name === 'localized-about-de-2')?.meta?.i18n).toMatchObject({ name: 'about-de' })
  })

  test('a third one counts on, and a page of the app keeps its name', () => {
    const pages: NuxtPage[] = [
      { path: '/about', name: 'about', file: 'pages/about.vue' },
      { path: '/about/de', name: 'about-de', file: 'pages/about/de.vue' },
      { path: '/mine', name: 'localized-about-de-2', file: 'pages/mine.vue' },
    ]
    generator('prefix', { globalLocaleRoutes: { about: { de: '/ueber-uns' }, mine: false } }).extendPages(pages)
    const names = pages.map((page) => page.name)
    expect(new Set(names).size).toBe(names.length)
    expect(names).toContain('localized-about-de-3')
  })
})

describe('characters a browser encodes in a custom path', () => {
  test.each([
    ['/x y', '/:locale(de)/x%20y'],
    ['/a"b', '/:locale(de)/a%22b'],
    ['/ü', '/:locale(de)/%C3%BC'],
  ])('%s has its encoded alias', (custom, alias) => {
    const pages: NuxtPage[] = [{ path: '/about', name: 'about', file: 'pages/about.vue' }]
    generator('prefix', { globalLocaleRoutes: { about: { de: custom } } }).extendPages(pages)
    expect(pages.find((page) => page.name === 'localized-about-de')?.alias).toEqual([alias])
  })

  test('nothing to encode, or only in a param: no alias', () => {
    const pages: NuxtPage[] = [{ path: '/about', name: 'about', file: 'pages/about.vue' }]
    generator('prefix', { globalLocaleRoutes: { about: { de: '/x/:id(a b)' } } }).extendPages(pages)
    expect(pages.find((page) => page.name === 'localized-about-de')?.alias).toEqual([])
  })
})

describe('redirects: false', () => {
  const pages = (): NuxtPage[] => [{ path: '/about', name: 'about', file: 'pages/about.vue' }]
  const rules = { about: { en: '/about-us' } }

  test('under prefix the original URL has no redirect record', () => {
    const list = pages()
    generator('prefix', { globalLocaleRoutes: rules, redirects: false }).extendPages(list)
    expect(list.some((page) => page.redirect)).toBe(false)
  })

  test('by default it has', () => {
    const list = pages()
    generator('prefix', { globalLocaleRoutes: rules }).extendPages(list)
    expect(list.find((page) => page.name === 'redirect-about')?.redirect).toBe('/en/about-us')
  })
})
