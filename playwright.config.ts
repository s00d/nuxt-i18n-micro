import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test',
  testMatch: '*.spec.ts',
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 3,
  use: {
    // В CI сохранять трейс при ошибке, локально — выключить
    trace: process.env.CI ? 'retain-on-failure' : 'off',

    // В CI сохранять видео при ошибке, локально — выключить
    video: process.env.CI ? 'retain-on-failure' : 'off',

    // Скриншоты только при ошибке
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
