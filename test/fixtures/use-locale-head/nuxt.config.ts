import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
    ],
    meta: false,
    strategy: 'prefix',
    defaultLocale: 'en',
    translationDir: 'locales',
    localeCookie: 'user_i18n_redirected',
    autoDetectLanguage: false,
  },
})
