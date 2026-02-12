import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  experimental: { appManifest: false },
  compatibilityDate: '2024-08-16',

  app: {
    // Slow transition so we can observe stale translations during leave phase
    pageTransition: { name: 'page', mode: 'default' },
  },

  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN', displayName: 'English' },
      { code: 'de', iso: 'de_DE', displayName: 'German' },
    ],
    meta: false,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
    strategy: 'prefix',
  },
})
