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
    mata: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: true,
    routesLocaleLinks: {
      'dir1-slug': 'index',
    },
  },

  compatibilityDate: '2024-08-16',
})
