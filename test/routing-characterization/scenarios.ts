/**
 * Realistic apps for the routing characterization: each is a `pages/` file list plus the i18n
 * options a project writes in nuxt.config, and the `$defineI18nRoute` calls on its pages (the
 * module keys those by the page's file path, e.g. `blog/[slug]`, and merges them under the
 * config's globalLocaleRoutes). Every app runs under every strategy.
 */
import type { Locale, Strategies } from '@i18n-micro/types'

export interface PageI18n {
  /** `$defineI18nRoute({ localeRoutes })` */
  localeRoutes?: Record<string, string>
  /** `$defineI18nRoute({ locales })` */
  locales?: string[]
}

export interface App {
  name: string
  description: string
  files: string[]
  /** definePageMeta({ alias }) per route name */
  aliases?: Record<string, string[]>
  locales?: Locale[]
  defaultLocale?: string
  globalLocaleRoutes?: Record<string, Record<string, string> | false>
  /** $defineI18nRoute per page file path (without `.vue`, `index` dropped) */
  pageI18n?: Record<string, PageI18n>
  routeLocales?: Record<string, string[]>
  routesLocaleLinks?: Record<string, string>
  localizedRouteNamePrefix?: string
  customRegexMatcher?: string
  hashMode?: boolean
  /** A `routeRules` redirect with no page: Nuxt adds an unnamed stub record for `/old`. */
  hasStub?: boolean
  noPrefixRedirect?: boolean
  excludePatterns?: string[]
  /** params used to build concrete URLs of dynamic routes */
  params?: Record<string, string | string[]>
  strategies?: Strategies[]
}

const enDeFr: Locale[] = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
]

export const PARAMS: Record<string, string | string[]> = {
  id: '42',
  slug: 'hello-world',
  category: 'shoes',
  item: 'red-boot',
  page: '2',
  year: '2025',
}

export const APPS: App[] = [
  {
    name: 'plain',
    description: 'small site without any custom path, one routeRules redirect',
    files: ['index.vue', 'about.vue', 'contact.vue', 'blog/index.vue', 'blog/[slug].vue'],
    hasStub: true,
  },
  {
    name: 'company',
    description:
      'typical company site: translated slugs, dynamic pages, catch-all, unlocalized legal page, per-page locale restriction, one routeRules redirect',
    hasStub: true,
    files: [
      'index.vue',
      'about.vue',
      'contact.vue',
      'blog/index.vue',
      'blog/[slug].vue',
      'products/index.vue',
      'products/[id].vue',
      'legal/imprint.vue',
      'careers.vue',
      '[...slug].vue',
    ],
    globalLocaleRoutes: {
      about: { en: '/about-us', de: '/ueber-uns', fr: '/a-propos' },
      contact: { de: '/kontakt', fr: '/contact-fr' },
      'blog/[slug]': { de: '/artikel/[slug]', fr: '/article/[slug]' },
      'legal/imprint': false,
    },
    pageI18n: {
      'products/[id]': { localeRoutes: { en: '/products/[id]', de: '/produkte/[id]', fr: '/produits/[id]' } },
      careers: { locales: ['en', 'de'] },
    },
  },
  {
    name: 'nested',
    description: 'parent pages with child routes: translated parents, relative and full-URL child values, an index child, deep nesting',
    files: [
      'index.vue',
      'account.vue',
      'account/index.vue',
      'account/settings.vue',
      'account/orders.vue',
      'account/orders/[id].vue',
      'shop.vue',
      'shop/[category].vue',
      'shop/[category]/[item].vue',
    ],
    globalLocaleRoutes: {
      account: { de: '/konto', fr: '/compte' },
      'account/settings': { de: 'einstellungen', fr: 'parametres' },
      'account/orders': { de: '/konto/bestellungen' },
      shop: { en: '/store', de: '/laden' },
      'shop/[category]/[item]': { de: 'artikel/[item]' },
    },
  },
  {
    name: 'dashed',
    description: 'pages that share a Nuxt route name (about-team) and dashed folders, keyed by name and by file path',
    files: [
      'index.vue',
      'about.vue',
      'about-team.vue',
      'team.vue',
      'team/members.vue',
      'docs/index.vue',
      'docs/getting-started.vue',
      'foo-bar/baz.vue',
    ],
    globalLocaleRoutes: {
      about: { de: '/ueber-uns' },
      'about-team': { de: '/team-seite', fr: 'equipe' },
      team: { de: '/mannschaft' },
      'team/members': { de: 'mitglieder' },
      'docs/getting-started': { en: '/docs/start', de: '/dokumente/einstieg' },
      'foo-bar': { de: '/foo-bar-de' },
    },
  },
  {
    name: 'aliases',
    description: 'definePageMeta aliases on plain, translated, dynamic and parent pages',
    files: ['index.vue', 'about.vue', 'help.vue', 'blog/[slug].vue', 'docs.vue', 'docs/intro.vue'],
    aliases: { about: ['/company', '/über'], help: ['/support'], 'blog-slug': ['/news/:slug()'], docs: ['/documentation'] },
    globalLocaleRoutes: { about: { de: '/ueber-uns' }, 'docs/intro': { de: 'einfuehrung' } },
  },
  {
    name: 'restrictions',
    description: 'routeLocales and $defineI18nRoute locales, unlocalized pages and routesLocaleLinks',
    files: ['index.vue', 'about.vue', 'de-only.vue', 'blog/index.vue', 'blog/[slug].vue', 'admin.vue', 'admin/users.vue', 'landing.vue'],
    routeLocales: { '/about': ['en', 'fr'] },
    pageI18n: { 'de-only': { locales: ['de'] }, landing: { locales: ['en', 'de'], localeRoutes: { de: '/start' } } },
    globalLocaleRoutes: { admin: false, 'admin/users': false },
    routesLocaleLinks: { 'blog-slug': 'blog' },
  },
  {
    name: 'unicode-and-params',
    description: 'non-ASCII custom paths, param matchers and optional params',
    files: ['index.vue', 'über-uns.vue', 'archive/[year].vue', 'docs/[[page]].vue', 'post-[id].vue'],
    globalLocaleRoutes: {
      'über-uns': { en: '/about', de: '/über-uns', fr: '/à-propos' },
      'archive/[year]': { de: '/archiv/:year(\\d+)' },
      'docs/[[page]]': { fr: '/documentation/[[page]]' },
    },
  },
  {
    name: 'options',
    description:
      'hyphenated locale codes, custom route-name prefix, custom locale regex with a page shaped like a locale, noPrefixRedirect, excluded paths',
    files: ['index.vue', 'about.vue', 'go.vue', 'blog/[slug].vue', 'api-docs.vue'],
    locales: [
      { code: 'en-us', iso: 'en-US' },
      { code: 'pt-br', iso: 'pt-BR' },
      { code: 'de', iso: 'de-DE' },
    ],
    defaultLocale: 'en-us',
    localizedRouteNamePrefix: 'i18n-',
    customRegexMatcher: '[a-z]{2}-[a-z]{2}|[a-z]{2}',
    noPrefixRedirect: true,
    excludePatterns: ['/api-docs'],
    globalLocaleRoutes: { about: { 'pt-br': '/sobre', de: '/ueber-uns' } },
  },
  {
    name: 'documented',
    description:
      'cases the docs and e2e tests pin: a renamed parent moving its children, localeRoutes adding a param, a doubled slash, a value equal to the original path, an unlocalized page',
    files: [
      'index.vue',
      'activity.vue',
      'activity/hiking.vue',
      'activity/skiing.vue',
      'page.vue',
      'product/[...slug].vue',
      'unlocalized.vue',
      'same.vue',
    ],
    globalLocaleRoutes: {
      activity: { en: '/change-activity', de: '/change-buchen' },
      'activity/skiing': { en: '/book-activity/skiing', de: '/aktivitaet-buchen/ski-fahren' },
      unlocalized: false,
      same: { de: '/same' },
    },
    pageI18n: {
      page: { localeRoutes: { en: '/page/:id', de: '/page/:id' } },
      'product/[...slug]': { localeRoutes: { de: '/produkte//[...slug]' } },
    },
  },
  {
    name: 'hash-mode',
    description: 'router hashMode: the locale is not read from the URL',
    files: ['index.vue', 'about.vue', 'blog/[slug].vue'],
    hashMode: true,
    globalLocaleRoutes: { about: { de: '/ueber-uns' } },
  },
  {
    name: 'disabled-locale',
    description: 'a locale disabled in the config: no records, the strategy still knows it',
    files: ['index.vue', 'about.vue', 'blog/[slug].vue'],
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
      { code: 'es', iso: 'es-ES', disabled: true },
    ],
  },
  {
    name: 'multi-domain',
    description: 'locales on their own domains (baseUrl, baseDefault)',
    files: ['index.vue', 'about.vue', 'blog/[slug].vue'],
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE', baseUrl: 'https://example.de', baseDefault: true },
      { code: 'fr', iso: 'fr-FR', baseUrl: 'https://example.fr' },
    ],
    globalLocaleRoutes: { about: { de: '/ueber-uns', fr: '/a-propos' } },
  },
]

export const STRATEGIES: Strategies[] = ['prefix_except_default', 'prefix', 'prefix_and_default', 'no_prefix']

export function appLocales(app: App): Locale[] {
  return app.locales ?? enDeFr
}
