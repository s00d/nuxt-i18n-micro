import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/redirect', import.meta.url)),
  },
  // launchOptions: {
  //   headless: false, // Show browser
  //   slowMo: 500, // Slow down execution steps (in milliseconds) for better visibility
  // },
})
test.describe('redirect', () => {
  test('test language detection and redirect based on navigator.languages', async ({ page, goto }) => {
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    })

    // Navigate to main page
    await goto('/ru/page', { waitUntil: 'hydration' })

    const currentURL = page.url()

    expect(new URL(currentURL).pathname).toBe('/page')

    await expect(page.locator('#locale')).toHaveText('en')
  })
})
