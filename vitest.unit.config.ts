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
    // On CI, run files serially: these tests spawn heavy subprocesses (nuxi
    // build, headless Chromium), and running several in parallel forks on a
    // constrained runner OOM-kills a worker (ERR_IPC_CHANNEL_CLOSED). Local
    // machines keep parallelism for speed.
    fileParallelism: !process.env.CI,
    poolOptions: {
      forks: {
        maxForks: Math.max(2, Math.floor(cpus().length / 2)),
      },
    },
  },
})
