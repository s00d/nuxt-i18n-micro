import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  devtools: { enabled: true },
  experimental: {
    externalVue: false,
  },
  compatibilityDate: '2024-08-14',
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  i18n: {
    defaultLocale: 'en',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    lazy: true,
    detectBrowserLanguage: false,
    langDir: 'locales',
    baseUrl: 'http://localhost:3000/',
    locales: [
      {
        code: 'en',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        language: 'en-US',
        file: 'en.json',
      },
      {
        code: 'ru',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        language: 'ru-RU',
        file: 'ru.json',
      },
      {
        code: 'de',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        language: 'de-De',
        file: 'de.json',
      },
    ],
  },
})
