import { fileURLToPath } from 'node:url'
import MyModule from '../../../src/module'
import n3Locales from './n3/locales/availableLanguages'
import n3Routes from './n3/locales/pages'

// One fixture, several builds (test/recipes.ts). BASIC_VARIANT picks the variant below; the default is basic.
// The `basic-layer` recipe builds ./layer, which extends this dir.
type Variant = 'basic' | 'pages-false' | 'serverless' | 'n3'

const routeRules = {
  '/client': { ssr: false },
  '/async-components-test': { ssr: false },
  '/async-components-test-2': { ssr: false },
  '/old-product': { redirect: '/page' },
  '/ru/old-product': { redirect: '/ru/page' },
}

// pages: false — no router; app.pages-false.vue is the whole app. STRATEGY=no_prefix for the second recipe.
const pagesFalseStrategy = process.env.STRATEGY === 'no_prefix' ? 'no_prefix' : 'prefix_except_default'

const variants: Record<Variant, Record<string, unknown>> = {
  basic: {
    i18n: {
      debug: true,
      // Deterministic cache-busting value for tests.
      dateBuild: '12345',
      locales: [
        { code: 'en', iso: 'en_EN', displayName: 'English', flag: '🇬🇧', currency: 'GBP' },
        { code: 'de', iso: 'de_DE', displayName: 'German', flag: '🇩🇪', currency: 'EUR' },
        { code: 'ru', iso: 'ru_RU', displayName: 'Russian', flag: '🇷🇺', currency: 'RUB' },
        { code: 'fr', iso: 'fr_FR', displayName: 'French', baseUrl: 'https://fr.example.com', baseDefault: true, flag: '🇫🇷', currency: 'EUR' },
        { code: 'ch', iso: 'ch_CH', displayName: 'Chinese', baseUrl: 'https://test.example.com', flag: '🇨🇳', currency: 'CNY' },
      ],
      meta: true,
      defaultLocale: 'en',
      translationDir: 'locales',
      autoDetectLanguage: false,
      // storage-cwd.e2e.test.ts: payloads served by the handler only, never prerendered
      ...(process.env.PRERENDER_PAYLOADS === '0' ? { translationPayloads: { prerenderRoutes: false } } : {}),
      routesLocaleLinks: {
        'dir1-slug': 'index',
        'post-id-status-section': 'post-id',
      },
      globalLocaleRoutes: {
        page2: {
          en: '/custom-page2-en',
          de: '/custom-page2-de',
          ru: '/custom-page2-ru',
        },
        unlocalized: false, // Unlocalized page should not be localized
      },
    },
  },
  'pages-false': {
    pages: false,
    hooks: {
      'app:resolve'(app: { mainComponent?: string }) {
        app.mainComponent = fileURLToPath(new URL('app.pages-false.vue', import.meta.url))
      },
    },
    i18n: {
      strategy: pagesFalseStrategy,
      defaultLocale: 'en',
      locales: [
        { code: 'en', iso: 'en-US', displayName: 'English' },
        { code: 'zh', iso: 'zh-CN', displayName: '简体中文' },
      ],
      translationDir: 'locales',
      disablePageLocales: true,
      autoDetectLanguage: false,
      localeCookie: 'user-locale',
      redirects: pagesFalseStrategy === 'prefix_except_default',
    },
  },
  // global fallbackLocale en, fr falls back to de (/fallback); route-cached payloads in memory storage (/cache)
  serverless: {
    routeRules: { ...routeRules, '/_locales/**': { cache: { maxAge: 3600 } } },
    nitro: { storage: { cache: { driver: 'memory' } } },
    i18n: {
      locales: [
        { code: 'en', iso: 'en_EN' },
        { code: 'de', iso: 'de_DE' },
        { code: 'fr', iso: 'fr_FR', fallbackLocale: 'de' },
      ],
      defaultLocale: 'en',
      fallbackLocale: 'en',
      translationDir: 'locales',
      autoDetectLanguage: false,
    },
  },
  // A real app's routing kept as a regression matrix (test/journeys/n3-matrix.spec.ts): 27 locales over
  // globalLocaleRoutes built from n3/pages, default de, prefix.
  n3: {
    dir: { pages: 'n3/pages' },
    nitro: {
      externals: {
        // inline to prevent imports from output/server/node_modules
        inline: ['vue', 'vue/server-renderer', '@vue/server-renderer'],
        external: [],
      },
    },
    i18n: {
      disableWatcher: true,
      locales: n3Locales,
      autoDetectLanguage: false,
      autoDetectPath: '/',
      strategy: 'prefix',
      globalLocaleRoutes: n3Routes,
      defaultLocale: 'de',
      translationDir: 'n3/locales',
      meta: true,
    },
  },
}

const variant = (process.env.BASIC_VARIANT ?? 'basic') as Variant
if (!variants[variant]) throw new Error(`[fixture basic] unknown BASIC_VARIANT "${variant}"`)

export default defineNuxtConfig({
  // modules/hook (a local module) is registered by Nuxt itself
  modules: [MyModule],
  devtools: { enabled: false },
  routeRules,
  compatibilityDate: '2024-08-16',
  ...variants[variant],
})
