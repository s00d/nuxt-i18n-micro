import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  devtools: { enabled: false },
  routeRules: {
    '/client': { ssr: false },
    '/old-product': { redirect: '/page' },
  },
  compatibilityDate: '2024-08-16',
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN', displayName: 'English' },
      { code: 'de', iso: 'de_DE', displayName: 'German' },
      { code: 'ru', iso: 'ru_RU', displayName: 'Russian' },
      { code: 'fr', iso: 'fr_FR', displayName: 'French', baseUrl: 'https://fr.example.com', baseDefault: true },
      { code: 'ch', iso: 'ch_CH', displayName: 'Chinese', baseUrl: 'https://test.example.com' },
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
