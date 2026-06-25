import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',

  i18n: {
    debug: true,
    locales: [{ code: 'en' }, { code: 'de', fallbackLocale: 'en' }],
    defaultLocale: 'en',
    fallbackLocale: 'en',
    strategy: 'prefix',
    translationDir: 'locales',
    autoDetectLanguage: false,
    hmr: true,
    meta: false,
    routesLocaleLinks: {
      'about-alias': 'about',
    },
  },
})
