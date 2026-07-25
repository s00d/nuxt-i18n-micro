import { defineConfig } from 'vitest/config'
import { INTEGRATION_TESTS, OPT_IN_TESTS } from './test/setup/heavy-tests'

/**
 * Fast unit tests in `test/` — no Nuxt build, no browser, no servers.
 * Runs in well under a second, so it works as a local feedback loop.
 *
 * Build-spawning suites live in `vitest.integration.config.ts` (see
 * test/setup/heavy-tests.ts for the shared list).
 */
export default defineConfig({
  test: {
    name: 'unit',
    include: ['test/**/*.test.ts'],
    exclude: [...INTEGRATION_TESTS, ...OPT_IN_TESTS, 'test/fixtures/**'],
    testTimeout: 30_000,
    pool: 'forks',
  },
})
