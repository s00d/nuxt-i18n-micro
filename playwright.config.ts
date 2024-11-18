import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test', // Путь к вашим тестам
  retries: 3, // Количество повторов тестов при падении
  testIgnore: [
    'test/performance.test.ts', // Игнорируемый файл
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
