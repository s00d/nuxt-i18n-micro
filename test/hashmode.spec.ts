// Import necessary modules
import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

// Use Nuxt fixture for testing
test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/hashmode', import.meta.url)),
  },
})

test.describe('hashmode', () => {
  test('test language detection and locale handling in hash mode', async ({ page, goto }) => {
    // Set the 'user-locale' cookie to 'vi' before navigation
    await page.context().addCookies([
      {
        name: 'user-locale',
        value: 'de',
        domain: 'localhost',
        path: '/',
        expires: -1, // Session cookie
      },
    ])
    await goto('/', { waitUntil: 'networkidle' })
    // Navigate to the URL with hash indicating the locale
    await page.click('#link-de')

    await page.waitForTimeout(500)

    // Get the current URL
    const currentURL = page.url()

    // Verify that the current URL contains the correct hash with the locale
    expect(currentURL).toContain('/#/de')

    // Check that the locale displayed on the page matches the expected value
    await expect(page.locator('#locale')).toHaveText('de')
  })
})
