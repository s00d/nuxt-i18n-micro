import { cpus } from 'node:os'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    exclude: [
      'test/performance.test.ts',
      'test/fixtures/**',
    ],
    testTimeout: 300_000, // 5 min per suite
    pool: 'forks',
    poolOptions: {
      forks: {
        // Build-spawning tests are isolated per file (NUXT_TEST_BUILD_DIR or
        // unique fixtures), so files can run in parallel. Each spawned
        // `nuxi build` is itself multi-process — cap forks to avoid thrash.
        maxForks: Math.max(2, Math.floor(cpus().length / 2)),
      },
    },
  },
})
