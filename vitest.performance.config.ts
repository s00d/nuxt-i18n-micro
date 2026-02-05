import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/performance.test.ts'],
    exclude: ['test/fixtures/**'],
    testTimeout: 1_600_000, // ~27 min for performance test
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 1,
      },
    },
  },
})
