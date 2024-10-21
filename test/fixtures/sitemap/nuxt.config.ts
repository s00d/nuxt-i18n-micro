import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
    '@nuxtjs/sitemap',
  ],

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
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
    includeDefaultLocaleRoute: false,
  },

  compatibilityDate: '2024-08-16',
})
