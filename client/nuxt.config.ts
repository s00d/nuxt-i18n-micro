import { resolve } from 'pathe'
import DevtoolsUIKit from '@nuxt/devtools-ui-kit'

export default defineNuxtConfig({

  modules: [
    DevtoolsUIKit,
  ],

  $production: {
    app: {
      // We set a placeholder for the middleware to be replaced with the correct base URL
      baseURL: '/__NUXT_DEVTOOLS_I18N_BASE__/',
    },
  },
  ssr: false,

  devtools: {
    enabled: false,
  },

  app: {
    baseURL: '/__nuxt-i18n-micro/client',
  },

  compatibilityDate: '2024-08-16',

  nitro: {
    output: {
      publicDir: resolve(__dirname, '../dist/client'),
    },
  },
})
