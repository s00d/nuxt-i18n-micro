import os from 'node:os'
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import { RetryReporter, untestutils } from 'untestutils/vitest/plugin'
import { recipes } from './test/recipes.ts'

const parallelism =
  typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length
const maxForks = Number(process.env.VITEST_E2E_MAX_FORKS) || Math.max(1, parallelism)

/**
 * Browser e2e via untestutils recipes (test/recipes.ts).
 * Specs use `test.override({ harness })` from `untestutils/vitest` — no setupE2E.
 */
export default defineConfig({
  plugins: [
    untestutils({
      recipes,
      browsers: ['chromium'],
      artifactsRoot: fileURLToPath(new URL('./test/.untestutils', import.meta.url)),
      // fixture builds start together, and a build has its own budget (not the test's timeout)
      prewarmConcurrency: maxForks,
      buildTimeout: 600_000,
      // CI retries only infrastructure failures (port, boot, build); a failing assertion fails
      retryInfra: process.env.CI ? 1 : 0,
    }),
  ],
  test: {
    name: 'e2e',
    include: ['test/**/*.spec.ts'],
    testTimeout: 120_000,
    hookTimeout: 300_000,
    fileParallelism: true,
    pool: 'forks',
    maxWorkers: maxForks,
    isolate: true,
    sequence: { groupOrder: 2 },
    reporters: ['default', new RetryReporter({ outputFile: 'test-results/retried.json' })],
  },
})
