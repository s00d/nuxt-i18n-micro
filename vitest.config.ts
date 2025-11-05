import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    exclude: [
      'test/performance.test.ts',
      'test/fixtures/**',
    ],
    testTimeout: 300_000, // 5 min per suite
  },
})
