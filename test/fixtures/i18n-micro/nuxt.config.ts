import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN' },
      { code: 'de', iso: 'de_DE' },
      { code: 'ru', iso: 'ru_RU' },
    ],
    meta: false,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
    define: false,
  },
  devtools: { enabled: true },
  experimental: {
    externalVue: false,
  },
  compatibilityDate: '2024-08-14',
})
