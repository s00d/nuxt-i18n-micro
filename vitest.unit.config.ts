import { cpus } from 'node:os'
import { defineConfig } from 'vitest/config'

/**
 * Unit / build-level tests in `test/` (`*.test.ts`) — no browser, no fixtures
 * server. Spawned Nuxt builds are isolated per file, so files run in parallel.
 */
export default defineConfig({
  test: {
    name: 'unit',
    include: ['test/**/*.test.ts'],
    exclude: ['test/performance.test.ts', 'test/fixtures/**'],
    testTimeout: 300_000, // 5 min per suite
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: Math.max(2, Math.floor(cpus().length / 2)),
      },
    },
  },
})
