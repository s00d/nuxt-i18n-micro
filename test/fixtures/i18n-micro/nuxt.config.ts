import { defineNuxtConfig } from 'nuxt/config'
import { locales } from './perf-locales.mjs'

export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  devtools: {
    enabled: false,
  },
  experimental: {
    externalVue: false,
    appManifest: false,
  },
  compatibilityDate: '2024-08-14',
  i18n: {
    locales,
    meta: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
    define: false,
  },
})
