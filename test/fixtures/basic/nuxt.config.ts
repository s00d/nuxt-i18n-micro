import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],

  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN' },
      { code: 'de', iso: 'de_DE' },
      { code: 'ru', iso: 'ru_RU' },
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

  compatibilityDate: '2024-08-16',
})
