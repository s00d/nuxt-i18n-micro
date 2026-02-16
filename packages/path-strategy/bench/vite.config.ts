import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: resolve(__dirname),
  resolve: {
    alias: {
      '@i18n-micro/types': resolve(__dirname, '../../types/src/index.ts'),
    },
  },
  server: {
    open: true,
  },
})
