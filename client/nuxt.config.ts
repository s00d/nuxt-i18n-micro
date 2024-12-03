import { resolve } from 'pathe'
import DevtoolsUIKit from '@nuxt/devtools-ui-kit'

export default defineNuxtConfig({
  ssr: false,

  modules: [
    DevtoolsUIKit,
  ],

  devtools: {
    enabled: false,
  },

  nitro: {
    output: {
      publicDir: resolve(__dirname, '../dist/client'),
    },
  },

  app: {
    baseURL: '/__nuxt-i18n-micro/client',
  },

  $production: {
    app: {
      // We set a placeholder for the middleware to be replaced with the correct base URL
      baseURL: '/__NUXT_DEVTOOLS_I18N_BASE__/',
    },
  },

  compatibilityDate: '2024-08-16',
})
