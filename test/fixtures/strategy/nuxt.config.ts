import { join } from 'node:path'
import type { Strategies } from '../../../src/module'
import MyModule from '../../../src/module'

// Несколько тестовых файлов собирают эту фикстуру параллельно — каждый задаёт
// свой NUXT_TEST_BUILD_DIR, чтобы сборки не затирали общие .nuxt/.output.
const testBuildDir = process.env.NUXT_TEST_BUILD_DIR

const STRATEGIES = ['no_prefix', 'prefix', 'prefix_except_default', 'prefix_and_default'] as const

// Validate instead of blind-casting: a typo in STRATEGY would otherwise only
// surface deep inside module resolution at runtime.
function resolveStrategy(): Strategies {
  const value = process.env.STRATEGY
  if (value && (STRATEGIES as readonly string[]).includes(value)) return value as Strategies
  if (value) console.warn(`[fixture] unknown STRATEGY "${value}", falling back to no_prefix`)
  return 'no_prefix'
}

// REGION_CODES=1 (`strategy-region-codes`): codes en-us / de-de / ru-ru behind customRegexMatcher, page-a and page-b
// under globalLocaleRoutes. Same iso values, so the head stays comparable.
const regionCodes = process.env.REGION_CODES === '1'
const code = (short: string, region: string) => (regionCodes ? region : short)
// DOMAINS (`strategy-domains-*`): en on example.com, de on example.de, ru on every host; the value is app.baseURL
const domain = (host: string) =>
  process.env.DOMAINS ? { baseUrl: `https://${host}${process.env.DOMAINS.replace(/^\/$/, '')}`, baseDefault: true } : {}
const locales = [
  { code: code('en', 'en-us'), iso: 'en_EN', displayName: 'English', ...domain('example.com') },
  { code: code('de', 'de-de'), iso: 'de_DE', displayName: 'German', ...domain('example.de') },
  { code: code('ru', 'ru-ru'), iso: 'ru_RU', displayName: 'Russian' },
  // `strategy-disabled-locale`: off at build time
  ...(process.env.DISABLED_LOCALE ? [{ code: process.env.DISABLED_LOCALE, iso: 'es_ES', disabled: true }] : []),
]
const regionI18n = {
  customRegexMatcher: '[a-z]{2}-[a-z]{2}',
  globalLocaleRoutes: {
    'page-a': { 'en-us': '/custom-a-en', 'de-de': '/custom-a-de', 'ru-ru': '/custom-a-ru' },
    'page-b': false,
  },
}

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  experimental: {
    // typedPages: true,
    appManifest: false,
  },
  compatibilityDate: '2024-08-16',

  // a wildcard over a page with custom paths (`/de/kontakt`, `/kontakt`)
  routeRules: { '/contact/**': { headers: { 'x-section': 'contact' } } },

  ...(testBuildDir ? { buildDir: testBuildDir } : {}),

  // generate does not stop at the first prerender error: test/helpers/strategy-suite.ts collects
  // every failed route from the log and expects the list to be empty, so a failure names them all.
  nitro: {
    prerender: {
      failOnError: false,
    },
    ...(testBuildDir ? { output: { dir: join(testBuildDir, 'output'), publicDir: process.env.PUBLIC_DIR } } : {}),
  },

  i18n: {
    locales,
    meta: true,
    defaultLocale: locales[0]!.code,
    translationDir: 'locales',
    autoDetectLanguage: process.env.AUTO_DETECT_LANGUAGE === '1',
    strategy: resolveStrategy(),
    ...(process.env.LOCALE_COOKIE ? { localeCookie: process.env.LOCALE_COOKIE } : {}),
    // `strategy-redirect`: detection on every path, with a whole-segment exclude
    ...(process.env.AUTO_DETECT_PATH ? { autoDetectPath: process.env.AUTO_DETECT_PATH } : {}),
    ...(process.env.EXCLUDE_PATTERNS ? { excludePatterns: process.env.EXCLUDE_PATTERNS.split(',') } : {}),
    ...(regionCodes ? regionI18n : {}),
  },
})
