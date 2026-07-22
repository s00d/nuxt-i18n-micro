import { defineConfig, devices } from '@playwright/test'
import { DEV_SPECS, ISOLATED_SPECS, SHARED_SPECS } from './test/setup/manifest'

const toMatch = (specs: string[]) => specs.map(spec => `**/${spec}`)

export default defineConfig({
  testDir: './test',
  testMatch: '*.spec.ts',
  timeout: process.env.CI ? 60000 : 30000,
  // Shared-project specs no longer rebuild on retry, so one retry is cheap flake cover
  retries: process.env.CI ? 1 : 0,
  // Prebuilt shared fixtures + per-worker buildDir isolation make parallelism
  // safe. Capped at 50%: `isolated` specs each run a full Nuxt build in their
  // worker, and too many concurrent builds starve the browsers into timeouts.
  workers: '50%',
  // Builds shared fixtures once and starts one server per fixture (see test/setup)
  globalSetup: './test/setup/global-setup',
  // Default `list` defers failure stacks until the run ends — Ctrl+C then shows
  // only ✘ lines. `line` prints the error as soon as a test fails.
  reporter: process.env.CI ? 'dot' : 'line',
  use: {
    // In CI save trace on error, locally — disable
    trace: process.env.CI ? 'retain-on-failure' : 'off',

    // In CI save video on error, locally — disable
    video: process.env.CI ? 'retain-on-failure' : 'off',

    // Screenshots only on error
    screenshot: 'only-on-failure',

    // Navigation timeout
    navigationTimeout: 15000,
    actionTimeout: 10000,
  },
  projects: [
    {
      // Specs served by shared prebuilt fixture servers (host mode): no
      // builds at test time, tests can spread freely across workers.
      name: 'shared',
      testMatch: toMatch(SHARED_SPECS),
      fullyParallel: true,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Specs with per-spec nuxtConfig overrides: each spec file builds its
      // own fixture (test-utils already isolates buildDir per worker).
      name: 'isolated',
      testMatch: toMatch(ISOLATED_SPECS),
      fullyParallel: false,
      // The per-worker Nuxt build runs during the first test's timeout window
      timeout: 120000,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Dev-mode HMR specs mutate fixture files; each file is internally
      // serial and the two files use different fixtures, so file-level
      // parallelism is safe.
      name: 'dev-hmr',
      testMatch: toMatch(DEV_SPECS),
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
