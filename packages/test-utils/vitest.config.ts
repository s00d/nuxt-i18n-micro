import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'test-utils',
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'tests/publish/**', '**/perf-benchmark*', '**/__perf__/**'],
  },
})
