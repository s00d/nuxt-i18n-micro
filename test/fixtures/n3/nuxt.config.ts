import MyModule from '../../../src/module'
import availableLanguages from './app/locales/availableLanguages'
import pages from './app/locales/pages'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@nuxtjs/tailwindcss', MyModule],
  devtools: { enabled: false },

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-04-03',

  i18n: {
    disableWatcher: true,
    locales: availableLanguages,
    autoDetectLanguage: false,
    autoDetectPath: '/',
    includeDefaultLocaleRoute: true,
    globalLocaleRoutes: pages,
    defaultLocale: 'de',
    translationDir: './app/locales',
    meta: true,
  },
})
