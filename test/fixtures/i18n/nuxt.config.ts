import { defineNuxtConfig } from 'nuxt/config'
import { locales } from './perf-locales.mjs'

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
    locales,
  },
})
