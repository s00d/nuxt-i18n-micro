import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test',
  testMatch: '*.spec.ts',
  timeout: process.env.CI ? 60000 : 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
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
  testIgnore: [],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
})
