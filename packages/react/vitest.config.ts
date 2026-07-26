import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Vite 8 (via Vitest 4) no longer infers the JSX transform for .tsx here.
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  resolve: {
    alias: [
      { find: /\.vue$/, replacement: fileURLToPath(new URL('./tests/mocks/vue-mock.ts', import.meta.url)) },
      { find: '@i18n-micro/core', replacement: fileURLToPath(new URL('../core/src/index.ts', import.meta.url)) },
      { find: '@i18n-micro/types', replacement: fileURLToPath(new URL('../types/src/index.ts', import.meta.url)) },
    ],
  },
  test: {
    name: 'react',
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'tests/publish/**', '**/perf-benchmark*', '**/__perf__/**'],
  },
})
