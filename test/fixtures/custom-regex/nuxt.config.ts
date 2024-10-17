import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],

  i18n: {
    locales: [
      { code: 'en-us', iso: 'en_EN' },
      { code: 'de-de', iso: 'de_DE' },
      { code: 'ru-ru', iso: 'ru_RU' },
    ],
    meta: true,
    defaultLocale: 'en-us',
    translationDir: 'locales',
    autoDetectLanguage: false,
    routesLocaleLinks: {
      'dir1-slug': 'index',
    },
    globalLocaleRoutes: {
      page2: {
        ['en-us']: '/custom-page2-en',
        ['de-de']: '/custom-page2-de',
        ['ru-ru']: '/custom-page2-ru',
      },
      unlocalized: false, // Unlocalized page should not be localized
    },
    customRegexMatcher: '[a-z]{2}-[a-z]{2}',
  },

  compatibilityDate: '2024-08-16',
})