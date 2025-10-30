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
  nitro: {
    externals: {
      // инлайнить, чтобы не было импорта из output/server/node_modules
      inline: ['vue', 'vue/server-renderer', '@vue/server-renderer'],
      external: [],
    },
  },

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
