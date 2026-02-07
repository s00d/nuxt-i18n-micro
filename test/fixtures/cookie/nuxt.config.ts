import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  experimental: {
    // typedPages: true,
    appManifest: false,
  },
  compatibilityDate: '2024-08-16',

  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN', displayName: 'English' },
      { code: 'de', iso: 'de_DE', displayName: 'German' },
    ],
    defaultLocale: 'en',
    localeCookie: 'user-locale',
    disablePageLocales: true,
    strategy: 'prefix_except_default',
  },
})
