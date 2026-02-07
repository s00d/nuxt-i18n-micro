import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    nuxtConfig: {
      i18n: {
        locales: [
          { code: 'en', iso: 'en_EN' },
          { code: 'de', iso: 'de_DE' },
          { code: 'ru', iso: 'ru_RU' },
        ],
        meta: true,
        defaultLocale: 'en',
        translationDir: 'locales',
        autoDetectLanguage: false,
      },
      ssr: false,
    },
  },
  // launchOptions: {
  //   headless: false, // Show browser
  //   slowMo: 500, // Slow down execution steps (in milliseconds) for better visibility
  // },
})

test.describe('no-ssr', () => {
  test('no-ssr test', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('en')

    await goto('/de', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('de')
  })
})
