import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: resolve(import.meta.dirname),
  resolve: {
    alias: {
      '@i18n-micro/types': resolve(import.meta.dirname, '../../types/src/index.ts'),
    },
  },
  server: {
    open: true,
  },
})
