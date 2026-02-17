import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  routeRules: {
    '/client': { ssr: false },
    '/old-product': { redirect: '/page' },
    '/ru/old-product': { redirect: '/ru/page' },
  },
  compatibilityDate: '2024-08-16',
  i18n: {
    debug: true,
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
    routesLocaleLinks: {
      'dir1-slug': 'index',
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
})
