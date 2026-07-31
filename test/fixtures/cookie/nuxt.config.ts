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
    localeCookie: process.env.LOCALE_COOKIE ?? 'user-locale',
    disablePageLocales: true,
    strategy: 'prefix_except_default',
    // Default `*` keeps strategy cleanup (/de → /) for cookie.spec.
    // auto-detect-root variant uses AUTO_DETECT_PATH=/ (#242).
    autoDetectPath: process.env.AUTO_DETECT_PATH ?? '*',
    autoDetectLanguage: false,
  },
})
