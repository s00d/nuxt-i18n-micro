import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  experimental: {
    appManifest: false,
  },
  compatibilityDate: '2024-08-16',

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English' },
      { code: 'zh', name: 'Simplified Chinese' },
      { code: 'ja', name: 'Japanese' },
    ],
    disablePageLocales: true,
    redirects: true,
    meta: true,
    autoDetectLanguage: true,
    autoDetectPath: '/',
    localeCookie: 'i18n_locale',
  },
})
