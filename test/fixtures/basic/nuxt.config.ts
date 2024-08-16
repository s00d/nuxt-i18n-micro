import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],

  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN' },
      { code: 'de', iso: 'de_DE' },
    ],
    mata: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: true,
  },

  compatibilityDate: '2024-08-16',
})
