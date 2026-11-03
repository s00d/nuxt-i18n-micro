// The manual test bench: one source, every build variant chosen by env. `bench/matrix.mjs` lists the variants.
//
// BENCH_VARIANT    keeps each variant's build apart (.bench/<variant>)
// BENCH_STRATEGY   prefix (default) | prefix_except_default | prefix_and_default | no_prefix
// BENCH_HASH=1     router hash mode
// BENCH_SSR=0      ssr: false
// BENCH_BASE_URL   app.baseURL
// BENCH_LOCALES    domains: en and de on their own hosts (BENCH_DOMAIN_PORT, default 4790)
// BENCH_EXCLUDE=1  excludePatterns with /admin, a glob and a RegExp
// BENCH_PLURAL=1   a custom `plural` function
// BENCH_DETECT=1   plugins/00.detect.server.ts picks the locale from `x-bench-locale`
// BENCH_RULES      0: no route rules, hybrid: more of them
// BENCH_LAYER=0    without layer-base
// BENCH_HUGE=0     without the generated dictionaries
// BENCH_DEVTOOLS=0 without Nuxt DevTools
// BENCH_MISMATCH=1 hydration mismatch details in production builds
// BENCH_TYPES_GEN=1 with @i18n-micro/types-generator
// BENCH_I18N       JSON merged over the `i18n` block: any option
// BENCH_NUXT       JSON merged over the whole config: anything else
import { join } from 'node:path'
import { defineNuxtConfig } from 'nuxt/config'
import { splitLocaleRoutes } from '../packages/utils/src/split-locale-routes'
import { generateHugeData } from './bench/gen-data.mjs'

const env = process.env
const flag = (name: string) => env[name] === '1'
const json = (name: string): Record<string, unknown> => (env[name] ? JSON.parse(env[name]!) : {})

type Plain = Record<string, unknown>
const isPlain = (value: unknown): value is Plain => typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof RegExp)
/** `over` wins, nested objects merge. A `null` stays: that is how a variant switches an option off. */
const merge = (base: Plain, over: Plain): Plain => {
  const out = { ...base }
  for (const [key, value] of Object.entries(over)) {
    const current = out[key]
    out[key] = isPlain(value) && isPlain(current) ? merge(current, value) : value
  }
  return out
}

if (env.BENCH_HUGE !== '0') generateHugeData()

const baseURL = env.BENCH_BASE_URL
const domainPort = env.BENCH_DOMAIN_PORT ?? '4790'
const domain = (host: string) =>
  env.BENCH_LOCALES === 'domains' ? { baseUrl: `http://${host}:${domainPort}${(baseURL ?? '').replace(/\/$/, '')}`, baseDefault: true } : {}

const hybridRules = {
  '/static-page': { prerender: true },
  '/t/**': { swr: 60 },
  '/client/**': { ssr: false },
}
const routeRules = {
  '/rr/prerender': { prerender: true },
  '/rr/swr': { swr: 60 },
  '/rr/isr': { isr: 60 },
  '/rr/spa': { ssr: false },
  '/rr/headers': { headers: { 'x-bench-rule': 'headers' } },
  '/rr/wild/**': { headers: { 'x-bench-rule': 'wild' } },
  '/rr/redirect': { redirect: '/rr/target' },
  '/rr/cors': { cors: true },
  ...(env.BENCH_RULES === 'hybrid' ? hybridRules : {}),
}

// routes pushed in pages:extend have no page file to read $defineI18nRoute from
const extended = splitLocaleRoutes([
  { name: 'ext-tag', path: '/ext/:tag', file: '~/components/BenchExtended.vue', paths: { de: '/erweitert/:tag' } },
  { name: 'ext-internal', path: '/ext-internal', file: '~/components/BenchExtended.vue', paths: false },
])

const i18n = {
  locales: [
    { code: 'en', iso: 'en-US', displayName: 'English', og: 'en_US', ...domain('en.bench.localhost') },
    { code: 'de', iso: 'de-DE', displayName: 'Deutsch', ...domain('de.bench.localhost') },
    { code: 'fr', iso: 'fr-FR', displayName: 'Français', fallbackLocale: 'de' },
    { code: 'ru', iso: 'ru-RU', displayName: 'Русский' },
    { code: 'ar', iso: 'ar-AE', displayName: 'العربية', dir: 'rtl', og: 'ar_AE' },
    { code: 'es', iso: 'es-ES', displayName: 'Español', disabled: true },
  ],
  defaultLocale: 'en',
  fallbackLocale: 'en',
  strategy: env.BENCH_STRATEGY ?? 'prefix',
  localeCookie: 'user-locale',
  translationDir: 'locales',
  additionalTranslationDirs: ['locales-extra'],
  timeZone: 'UTC',
  excludePatterns: [
    '/sitemap*.xml',
    '/robots.txt',
    /\.(pdf|doc)$/,
    ...(flag('BENCH_EXCLUDE') ? ['/admin', '/excluded-glob/*', /^\/excluded-regex\//] : []),
  ],
  routesLocaleLinks: { 'linked-id': 'linked', 'huge-many-t': 'huge-10k' },
  routeLocales: { '/routing/restricted-config': ['en', 'de'] },
  routeDisableMeta: { 'head-no-meta-config': true },
  globalLocaleRoutes: {
    contact: { en: '/contact-us', de: '/kontakt', ru: '/kontakty' },
    'dir-slug': { en: '/dir-one/:slug()', de: '/dir-eins/:slug()', ru: '/dir-odin/:slug()' },
    unlocalized: false,
    ...extended.globalLocaleRoutes,
  },
  numberFormats: {
    en: { currency: { style: 'currency', currency: 'USD' }, short: { maximumFractionDigits: 1 } },
    de: { currency: { style: 'currency', currency: 'EUR' }, short: { maximumFractionDigits: 1 } },
  },
  datetimeFormats: {
    en: { short: { year: 'numeric', month: 'short', day: 'numeric' }, tokyo: { timeStyle: 'short', timeZone: 'Asia/Tokyo' } },
    de: { short: { year: 'numeric', month: '2-digit', day: '2-digit' }, tokyo: { timeStyle: 'short', timeZone: 'Asia/Tokyo' } },
  },
  ...(flag('BENCH_PLURAL')
    ? {
        // serialized into the build: no imports, no outer variables
        plural: function (key: string, count: number, _params: unknown, locale: string, getter: (key: string) => unknown) {
          if (locale !== 'de') return null
          return `custom:${String(getter(key) ?? '').split('|').length}:${count}`
        },
      }
    : {}),
}

const config = {
  extends: env.BENCH_LAYER === '0' ? [] : ['./layer-base'],
  modules: ['../src/module', ...(flag('BENCH_TYPES_GEN') ? ['../packages/types-generator/src/nuxt'] : [])],
  ...(flag('BENCH_TYPES_GEN') ? { i18nTypes: { translationDir: 'locales' } } : {}),
  devtools: { enabled: env.BENCH_DEVTOOLS !== '0' },
  compatibilityDate: '2024-08-14',
  // the other variants' builds: watching them runs dev out of file handles (EMFILE)
  ignore: ['.bench/**'],
  vite: {
    server: { watch: { ignored: ['**/.bench/**'] } },
    define: flag('BENCH_MISMATCH') ? { __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true } : {},
  },
  ssr: env.BENCH_SSR !== '0',
  app: baseURL ? { baseURL } : {},
  router: flag('BENCH_HASH') ? { options: { hashMode: true } } : {},
  experimental: { componentIslands: { selectiveClient: true } },
  runtimeConfig: { public: { benchDetect: flag('BENCH_DETECT') } },
  routeRules: env.BENCH_RULES === '0' ? {} : routeRules,
  hooks: {
    'pages:extend'(pages: unknown[]) {
      pages.push(...extended.pages)
    },
  },
  nitro: {
    // the error pages are in the crawl on purpose
    prerender: { failOnError: false },
    ...(env.BENCH_VARIANT ? { output: { dir: join('.bench', env.BENCH_VARIANT, '.output') } } : {}),
  },
  ...(env.BENCH_VARIANT ? { buildDir: join('.bench', env.BENCH_VARIANT, '.nuxt') } : {}),
  i18n: merge(i18n, json('BENCH_I18N')),
}

export default defineNuxtConfig(merge(config, json('BENCH_NUXT')))
