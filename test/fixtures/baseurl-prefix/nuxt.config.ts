import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',
  app: {
    baseURL: '/examples',
  },
  i18n: {
    strategy: 'prefix',
    defaultLocale: 'ja',
    locales: [{ code: 'ja' }, { code: 'en' }],
    autoDetectLanguage: false,
    translationDir: 'locales',
  },
})
