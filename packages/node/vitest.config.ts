import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'node',
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'tests/publish/**', '**/perf-benchmark*', '**/__perf__/**'],
  },
})
