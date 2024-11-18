import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test', // Путь к вашим тестам
  retries: 3, // Количество повторов тестов при падении

  projects: [
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'], // Настройка устройства для Firefox
      },
    },
  ],
});
