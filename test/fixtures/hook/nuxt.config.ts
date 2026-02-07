import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: ['~/modules/pages/index', MyModule],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',

  i18n: {
    locales: [{ code: 'de' }, { code: 'en' }],
    defaultLocale: 'en',
  },
})
