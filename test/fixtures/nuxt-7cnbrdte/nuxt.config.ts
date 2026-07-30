import { join } from 'node:path'
import MyModule from '../../../src/module'

const testBuildDir = process.env.NUXT_TEST_BUILD_DIR

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  sourcemap: false,
  modules: [MyModule],
  ...(testBuildDir ? { buildDir: testBuildDir } : {}),
  nitro: {
    ...(testBuildDir ? { output: { dir: join(testBuildDir, 'output') } } : {}),
  },
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', name: 'English' },
      { code: 'fr', iso: 'fr-FR', name: 'Français' },
    ],
    meta: false,
    metaBaseUrl: 'https://www.test.com',
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    translationDir: 'locales',
    localeCookie: 'user_i18n_redirected',
  },
  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/products/**': { isr: true },
  },
})
