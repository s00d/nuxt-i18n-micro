import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  experimental: {
    appManifest: false,
  },
  compatibilityDate: '2024-08-16',

  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN', displayName: 'English' },
      { code: 'de', iso: 'de_DE', displayName: 'German' },
      { code: 'ru', iso: 'ru_RU', displayName: 'Russian' },
    ],
    meta: true,
    // metaBaseUrl is undefined by default → resolved dynamically from request
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
    strategy: 'prefix',
  },
})
