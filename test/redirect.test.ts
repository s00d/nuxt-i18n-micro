import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/redirect', import.meta.url)),
    nuxtConfig: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      i18n: {
        autoDetectPath: '*',
      },
    },
  },
  // launchOptions: {
  //   headless: false, // Показывать браузер
  //   slowMo: 500, // Замедлить выполнение шагов (в миллисекундах) для лучшей видимости
  // },
})

test('test language detection and redirect based on navigator.languages', async ({ page, goto }) => {
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
  })

  // Переходим на главную страницу
  await goto('/ru/page', { waitUntil: 'hydration' })

  const currentURL = page.url()

  expect(new URL(currentURL).pathname).toBe('/page')

  await expect(page.locator('#locale')).toHaveText('en')
})
