import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    '~/modules/pages/index',
    MyModule,
  ],

  i18n: {
    locales: [{ code: 'de' }, { code: 'en' }],
    defaultLocale: 'en',
    includeDefaultLocaleRoute: false,
  },

  compatibilityDate: '2024-08-16',
})
