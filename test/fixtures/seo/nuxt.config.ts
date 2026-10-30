import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  experimental: {
    // typedPages: true,
    appManifest: false,
  },
  compatibilityDate: '2024-08-16',

  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN', displayName: 'English' },
      { code: 'de', iso: 'de_DE', displayName: 'German' },
      { code: 'ru', iso: 'ru_RU', displayName: 'Russian', seo: false },
      // og:locale formats: fr derives fr_FR from iso, ar has an explicit og, zh-Hans cannot be mapped (no og:locale)
      { code: 'fr', iso: 'fr-FR', displayName: 'French' },
      { code: 'ar', iso: 'ar-AE', og: 'ar_AE', dir: 'rtl', displayName: 'Arabic' },
      { code: 'zh', iso: 'zh-Hans', displayName: 'Chinese' },
    ],
    meta: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
    strategy: 'prefix',
    canonicalQueryWhitelist: ['page', 'filter', 'q'],
  },
})
