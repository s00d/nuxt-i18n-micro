import { resolve } from 'node:path'
import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import VueDevtools from 'vite-plugin-vue-devtools'

// the walks measure the app, not the tools around it
const bench = process.env.BENCH === '1'

export default defineConfig({
  plugins: [vue(), ...(bench ? [] : [VueDevtools(), i18nDevToolsPlugin({ base: '/__i18n_api', translationDir: 'src/locales', injectButton: true })])],
  cacheDir: process.env.BENCH_CACHE,
  publicDir: resolve(import.meta.dirname, '../../../benchmark/integrations/public'),
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  optimizeDeps: {
    include: bench ? [] : ['@i18n-micro/devtools-ui'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
      },
    },
  },
  ssr: {
    noExternal: ['@i18n-micro/vue', '@i18n-micro/core', '@i18n-micro/types'],
  },
})
