import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],

  i18n: {
    locales: [{ code: 'de' }, { code: 'en' }],
    defaultLocale: 'en',
    fallbackLocale: 'en',
    disablePageLocales: true,
    includeDefaultLocaleRoute: false,
  },

  compatibilityDate: '2024-08-16',
})
