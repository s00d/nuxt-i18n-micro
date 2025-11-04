import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test',
  testMatch: '*.spec.ts',
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 3,
  testIgnore: [
    'test/performance.spec.ts',
  ],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
})
