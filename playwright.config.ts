import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test', // Путь к вашим тестам
  testMatch: '*.test.ts',
  retries: 3, // Количество повторов тестов при падении
  testIgnore: [
    'test/performance.test.ts', // Игнорируемый файл
    'test/n3.test.ts', // Игнорируемый файл
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
