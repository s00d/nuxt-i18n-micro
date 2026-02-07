import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  routeRules: {
    '/async-components-test': { ssr: false },
    '/async-components-test-2': { ssr: false },
  },
  compatibilityDate: '2024-08-16',
  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN', displayName: 'English' },
      { code: 'ru', iso: 'ru_RU', displayName: 'Russian' },
      { code: 'de', iso: 'de_DE', displayName: 'German' },
    ],
    meta: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
  },
})
