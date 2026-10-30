import { join } from 'node:path'
import MyModule from '../../../src/module'

// Several suites build this fixture in parallel: each sets its own NUXT_TEST_BUILD_DIR (test/helpers/isolated-build.ts).
const testBuildDir = process.env.NUXT_TEST_BUILD_DIR

// SEO_VARIANT=use-i18n-head (recipe `seo-use-i18n-head`, use-i18n-head-generate.test.ts): pec en/fr, where every
// scenario page overrides parts of the head with useI18nHead(). The default is the module's own head under prefix.
const useI18nHead = process.env.SEO_VARIANT === 'use-i18n-head'

const seoI18n = {
  locales: [
    { code: 'en', iso: 'en_EN', displayName: 'English' },
    { code: 'de', iso: 'de_DE', displayName: 'German' },
    { code: 'ru', iso: 'ru_RU', displayName: 'Russian', seo: false },
    // og:locale formats: fr derives fr_FR from iso, ar has an explicit og, zh-Hans cannot be mapped (no og:locale)
    { code: 'fr', iso: 'fr-FR', displayName: 'French' },
    { code: 'ar', iso: 'ar-AE', og: 'ar_AE', dir: 'rtl' as const, displayName: 'Arabic' },
    { code: 'zh', iso: 'zh-Hans', displayName: 'Chinese' },
  ],
  strategy: 'prefix' as const,
  canonicalQueryWhitelist: ['page', 'filter', 'q'],
}

const useI18nHeadI18n = {
  locales: [
    { code: 'en', iso: 'en-US' },
    { code: 'fr', iso: 'fr-FR' },
  ],
  strategy: 'prefix_except_default' as const,
}

// localized by the module for fr: /fr/prerendered, never /fr/fr/prerendered (#218); /fr/spa is a SPA shell too
const useI18nHeadRouteRules = {
  '/prerendered': { prerender: true },
  '/products/**': { isr: true },
  '/spa': { ssr: false },
}

const useI18nHeadPrerender = [
  '/',
  '/landing',
  '/custom-alternates',
  '/no-hreflang',
  '/reactive',
  '/post/hello-en',
  '/canonical/cms-canonical',
  '/partial/partial-only',
  '/x-default/with-xdefault',
  '/full/full-meta',
  '/blog/shared-blog',
  '/guides/shared-guide',
  '/spa',
]

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  experimental: {
    // the static site reuses prerendered payloads on reload only with the app manifest
    appManifest: useI18nHead,
  },
  compatibilityDate: '2024-08-16',
  routeRules: useI18nHead ? useI18nHeadRouteRules : {},
  ...(testBuildDir ? { buildDir: testBuildDir } : {}),
  nitro: {
    prerender: {
      failOnError: false,
      routes: useI18nHead ? useI18nHeadPrerender : [],
    },
    ...(testBuildDir ? { output: { dir: join(testBuildDir, 'output') } } : {}),
  },

  i18n: {
    ...(useI18nHead ? useI18nHeadI18n : seoI18n),
    meta: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
  },
})
