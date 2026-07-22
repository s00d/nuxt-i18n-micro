import { cpus } from 'node:os'
import { defineConfig } from 'vitest/config'

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
    // isolated specs run a full Nuxt build inside the setup hook
    testTimeout: 120_000,
    hookTimeout: 240_000,
    pool: 'forks',
    poolOptions: {
      forks: {
        // Each file may spawn a browser and (isolated) a Nuxt build — cap
        // concurrency like the old Playwright `workers: '50%'`.
        maxForks: Math.max(2, Math.floor(cpus().length / 2)),
      },
    },
  },
})
