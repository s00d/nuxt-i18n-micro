import os from 'node:os'
import { defineConfig } from 'vitest/config'

const parallelism = typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length
// One fork per core. Most specs only drive a browser against an already-running
// shared server (cheap); the `isolated` specs that build their own app are the
// memory-heavy ones, and a per-core cap keeps those within a CI runner.
// Override with VITEST_E2E_MAX_FORKS if a runner turns out to be tighter.
const maxForks = Number(process.env.VITEST_E2E_MAX_FORKS) || Math.max(1, parallelism)

/**
 * Browser e2e specs, run through Vitest's node runner driving a real Playwright
 * browser against real Nuxt servers (see test/setup/vitest-e2e.ts). Shared
 * fixtures are prebuilt+served once by the globalSetup; `isolated`/`dev` specs
 * build their own app via @nuxt/test-utils.
 */
export default defineConfig({
  test: {
    name: 'e2e',
    include: ['test/**/*.spec.ts'],
    globalSetup: ['./test/setup/vitest-global-setup.ts'],
    // Populate NUXT_TEST_URL_* before top-level await setupE2E() in spec files.
    setupFiles: ['./test/setup/vitest-e2e-env.ts'],
    // isolated specs run a full Nuxt build inside the setup hook
    testTimeout: 120_000,
    hookTimeout: 240_000,
    // Parity with the pre-migration Playwright config (`retries: CI ? 1 : 0`).
    // Shared fixtures are already built, so a retry is cheap, and it absorbs
    // races between the parallel dev-server specs. A real break still fails twice.
    retry: process.env.CI ? 1 : 0,
    fileParallelism: true,
    pool: 'forks',
    // Vitest 4 moved pool sizing/isolation out of `poolOptions`.
    maxWorkers: maxForks,
    // Fresh worker per file so Playwright/Nuxt memory is released between specs.
    isolate: true,
  },
})
