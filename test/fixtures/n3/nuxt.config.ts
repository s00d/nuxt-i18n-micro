import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import MyModule from '../../../src/module'
import availableLanguages from './app/locales/availableLanguages'
import pages from './app/locales/pages'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },

  css: [resolve(__dirname, 'app/assets/css/tailwind.css')],

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
  vite: {
    plugins: [tailwindcss()],
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
