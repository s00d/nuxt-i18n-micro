import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  router: {
    options: {
      hashMode: true,
    },
  },
  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN' },
      { code: 'de', iso: 'de_DE' },
      { code: 'ru', iso: 'ru_RU' },
    ],
    defaultLocale: 'en',
    fallbackLocale: 'en',
    autoDetectLanguage: true,
    includeDefaultLocaleRoute: false,
    disablePageLocales: false,
  },

  compatibilityDate: '2024-08-16',
})
