import MyModule from '../../../src/module'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [MyModule],
  i18n: {
    locales: [{ code: 'en', iso: 'en-US', dir: 'ltr', displayName: 'English' }],
    autoDetectLanguage: false,
  },
})
