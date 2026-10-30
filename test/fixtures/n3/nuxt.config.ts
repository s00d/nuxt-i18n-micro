import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import MyModule from '../../../src/module'
import availableLanguages from './app/locales/availableLanguages'
import pages from './app/locales/pages'

const __dirname = dirname(fileURLToPath(import.meta.url))

// A real app kept as a regression matrix (test/journeys/n3-matrix.spec.ts): tailwind and the vue-final-modal
// plugin are there for realism only, no assertion reads them.
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
      // inline to prevent imports from output/server/node_modules
      inline: ['vue', 'vue/server-renderer', '@vue/server-renderer'],
      external: [],
    },
  },
  vite: {
    plugins: [tailwindcss() as never],
  },

  i18n: {
    disableWatcher: true,
    locales: availableLanguages,
    autoDetectLanguage: false,
    autoDetectPath: '/',
    strategy: 'prefix',
    globalLocaleRoutes: pages,
    defaultLocale: 'de',
    translationDir: './app/locales',
    meta: true,
  },
})
