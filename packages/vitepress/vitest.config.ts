import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@i18n-micro\/utils\/(.*)$/, replacement: fileURLToPath(new URL('../utils/src/', import.meta.url)) + '$1' },
      { find: '@i18n-micro/core', replacement: fileURLToPath(new URL('../core/src/index.ts', import.meta.url)) },
      { find: '@i18n-micro/types', replacement: fileURLToPath(new URL('../types/src/index.ts', import.meta.url)) },
      { find: '@i18n-micro/vue', replacement: fileURLToPath(new URL('../vue/src/index.ts', import.meta.url)) },
      { find: '@i18n-micro/node', replacement: fileURLToPath(new URL('../node/src/index.ts', import.meta.url)) },
    ],
  },
  test: {
    name: 'vitepress',
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'playground/**'],
  },
})
