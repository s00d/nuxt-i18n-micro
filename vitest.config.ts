import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    exclude: [
      'test/performance.test.ts',
      'test/fixtures/**',
    ],
    testTimeout: 300_000, // 5 min per suite
    // Single worker: tests do not run in parallel by file, so fixtures
    // (strategy, async-components) don't overwrite each other's .nuxt/.output during full runs.
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 1,
      },
    },
  },
})
