import { cpus } from 'node:os'
import { defineConfig } from 'vitest/config'

const isCI = !!process.env.CI

/**
 * Unit / build-level tests in `test/` (`*.test.ts`, excluding `*.e2e.test.ts`).
 * Some suites spawn their own Nuxt server via @nuxt/test-utils; heavy
 * generate/build tests are isolated per file. Browser e2e lives in the e2e project.
 */
export default defineConfig({
  test: {
    name: 'unit',
    include: ['test/**/*.test.ts'],
    exclude: ['test/**/*.e2e.test.ts', 'test/performance.test.ts', 'test/fixtures/**'],
    testTimeout: 300_000, // 5 min per suite
    hookTimeout: 300_000,
    teardownTimeout: 60_000,
    // Fork workers + heavy subprocesses OOM / IPC-crash on GitHub runners after
    // test:packages. Threads + single worker on CI keeps memory lower and avoids
    // tinypool fork IPC entirely.
    pool: isCI ? 'threads' : 'forks',
    fileParallelism: !isCI,
    maxWorkers: isCI ? 1 : undefined,
    poolOptions: isCI
      ? undefined
      : {
          forks: {
            maxForks: Math.max(2, Math.floor(cpus().length / 2)),
          },
        },
  },
})
