import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    exclude: [
      'test/performance.test.ts',
      'test/fixtures/**',
    ],
    testTimeout: 300_000, // 5 min per suite
    // Один воркер: тесты не запускаются параллельно по файлам, чтобы фикстуры
    // (strategy, async-components) не затирали друг другу .nuxt/.output при полном прогоне.
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 1,
      },
    },
  },
})
