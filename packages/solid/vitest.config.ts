import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'solid-js',
  },
  resolve: {
    alias: [
      { find: '@i18n-micro/core', replacement: fileURLToPath(new URL('../core/src/index.ts', import.meta.url)) },
      { find: '@i18n-micro/types', replacement: fileURLToPath(new URL('../types/src/index.ts', import.meta.url)) },
      { find: '@i18n-micro/devtools-ui', replacement: fileURLToPath(new URL('./tests/mocks/devtools-ui-mock.ts', import.meta.url)) },
      { find: 'solid-js/web', replacement: fileURLToPath(new URL('./tests/mocks/solid-web-mock.ts', import.meta.url)) },
      { find: 'solid-js/store', replacement: fileURLToPath(new URL('./tests/mocks/solid-store-mock.ts', import.meta.url)) },
      { find: 'solid-js', replacement: fileURLToPath(new URL('./tests/mocks/solid-js-mock.ts', import.meta.url)) },
    ],
  },
  test: {
    name: 'solid',
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'tests/publish/**', '**/perf-benchmark*', '**/__perf__/**'],
  },
})
