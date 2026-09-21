import os from 'node:os'
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import { untestutils } from 'untestutils/vitest/plugin'
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
    }),
  ],
  test: {
    name: 'e2e',
    include: ['test/**/*.spec.ts'],
    testTimeout: 120_000,
    hookTimeout: 300_000,
    retry: process.env.CI ? 1 : 0,
    fileParallelism: true,
    pool: 'forks',
    maxWorkers: maxForks,
    isolate: true,
    sequence: { groupOrder: 2 },
  },
})
