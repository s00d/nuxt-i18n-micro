import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule, '@nuxtjs/sitemap'],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',

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
  },
})
