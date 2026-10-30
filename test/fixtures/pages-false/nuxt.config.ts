import MyModule from '../../../src/module'

// One fixture, two recipes (test/recipes.ts): prefix_except_default with redirects, and STRATEGY=no_prefix.
const strategy = process.env.STRATEGY === 'no_prefix' ? 'no_prefix' : 'prefix_except_default'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [MyModule],
  pages: false,
  devtools: { enabled: false },
  compatibilityDate: '2025-01-24',
  i18n: {
    strategy,
    defaultLocale: 'en',
    locales: [
      { code: 'en', iso: 'en-US', name: 'English' },
      { code: 'zh', iso: 'zh-CN', name: '简体中文' },
    ],
    disablePageLocales: true,
    autoDetectLanguage: false,
    localeCookie: 'user-locale',
    redirects: strategy === 'prefix_except_default',
  },
})
