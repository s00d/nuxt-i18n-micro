import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  devtools: { enabled: false },
  experimental: {
    externalVue: false,
    appManifest: false,
  },
  compatibilityDate: '2024-08-14',
  i18n: {
    defaultLocale: 'en',
    // @ts-expect-error lazy is valid for @nuxtjs/i18n runtime
    lazy: true,
    detectBrowserLanguage: false,
    langDir: 'locales',
    baseUrl: 'http://localhost:3000/',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: 'en.json',
      },
      {
        code: 'ru',
        language: 'ru-RU',
        file: 'ru.json',
      },
      {
        code: 'de',
        language: 'de-De',
        file: 'de.json',
      },
    ],
  },
})
