import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test',
  testMatch: '*.spec.ts',
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 3,
  use: {
    // In CI save trace on error, locally — disable
    trace: process.env.CI ? 'retain-on-failure' : 'off',

    // In CI save video on error, locally — disable
    video: process.env.CI ? 'retain-on-failure' : 'off',

    // Screenshots only on error
    screenshot: 'only-on-failure',
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
