import { resolve } from 'node:path'
import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// the walks measure the app, not the tools around it
const bench = process.env.BENCH === '1'

export default defineConfig({
  plugins: [react(), ...(bench ? [] : [i18nDevToolsPlugin({ base: '/__i18n_api', translationDir: 'src/locales', injectButton: true })])],
  cacheDir: process.env.BENCH_CACHE,
  publicDir: resolve(import.meta.dirname, '../../../benchmark/integrations/public'),
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  build: { target: 'esnext' },
  ssr: {
    noExternal: [/^@i18n-micro\//],
  },
})
