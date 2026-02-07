import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },

  compatibilityDate: '2024-08-16',

  i18n: {
    debug: true,
    locales: [
      { code: 'en', iso: 'en_EN' },
      { code: 'de', iso: 'de_DE' },
      { code: 'ru', iso: 'ru_RU' },
    ],
    meta: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
    strategy: 'prefix',
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
})
