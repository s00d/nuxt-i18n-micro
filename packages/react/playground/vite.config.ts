import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    i18nDevToolsPlugin({
      base: '/__i18n_api',
      translationDir: 'src/locales',
      injectButton: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
