import MyModule from '../../../src/module'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  experimental: {
    typedPages: true,
  },
  compatibilityDate: '2024-11-01',
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'cs', iso: 'cs-CZ', dir: 'ltr' },
    ],
    defaultLocale: 'cs',
    translationDir: 'locales',
    meta: true,
  }
})
