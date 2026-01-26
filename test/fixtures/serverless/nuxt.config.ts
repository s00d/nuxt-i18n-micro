import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },

  // Route rules with ISR-like caching (similar to Cloudflare setup)
  routeRules: {
    '/_locales/**': { cache: { maxAge: 3600 } },
  },
  compatibilityDate: '2024-08-16',

  // Emulate serverless environment
  nitro: {
    // Use node-server preset but with memory storage to emulate serverless behavior
    preset: 'node-server',
    // Storage will be overridden in test via nuxtConfig
    storage: {
      // Emulate KV-like storage behavior
      cache: {
        driver: 'memory',
      },
    },
  },

  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN' },
      { code: 'de', iso: 'de_DE' },
      { code: 'fr', iso: 'fr_FR' },
    ],
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
  },
})
