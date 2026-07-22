import os from 'node:os'
import { defineConfig } from 'vitest/config'

const isCI = !!process.env.CI
const parallelism = typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length
const maxForks = isCI ? 1 : Math.max(1, Math.floor(parallelism / 2))

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
    fileParallelism: !isCI,
    pool: 'forks',
    poolOptions: {
      forks: {
        // Each file may spawn a browser and (isolated) a Nuxt build — cap
        // concurrency like the old Playwright `workers: '50%'`.
        maxForks,
        // Keep CI sequential (maxForks: 1) but restart the fork per file so
        // Playwright/Nuxt memory is released; singleFork OOMs on full suite.
      },
    },
  },
})
