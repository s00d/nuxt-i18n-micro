import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n', '@nuxtjs/robots'],
  i18n: {
    defaultLocale: 'en',
    lazy: true,
    detectBrowserLanguage: false,
    langDir: 'locales',
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.json',
      },
      {
        code: 'ru',
        iso: 'ru-RU',
        file: 'ru.json',
      },
      {
        code: 'de',
        iso: 'de-De',
        file: 'de.json',
      },
    ],
  },
  devtools: { enabled: true },
  experimental: {
    externalVue: false,
  },
  compatibilityDate: '2024-08-14',
})
