import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  router: {
    options: {
      hashMode: true,
    },
  },

  compatibilityDate: '2024-08-16',
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
})
