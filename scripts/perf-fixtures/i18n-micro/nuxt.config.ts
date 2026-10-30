import { defineNuxtConfig } from 'nuxt/config'
import { PERF_LOCALES } from '../perf-shared/config.mjs'

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
    locales: PERF_LOCALES.map(({ code, iso }) => ({ code, iso: iso.replace('-', '_') })),
    meta: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
    define: false,
  },
})
