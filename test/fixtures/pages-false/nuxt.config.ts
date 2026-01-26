import MyModule from '../../../src/module'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [MyModule],
  pages: false,
  devtools: { enabled: false },
  compatibilityDate: '2025-01-24',
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    locales: [
      { code: 'en', iso: 'en-US', name: 'English' },
      { code: 'zh', iso: 'zh-CN', name: '简体中文' },
    ],
    disablePageLocales: true,
    autoDetectLanguage: false,
    localeCookie: 'user-locale',
    redirects: true,
  },
})
