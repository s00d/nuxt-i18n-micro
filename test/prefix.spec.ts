import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/strategy', import.meta.url)),
    nuxtConfig: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      i18n: {
        strategy: 'prefix',
        localeCookie: 'user-locale',
      },
    },
  },
})

test.describe('prefix strategy', () => {
  test('navigate to test-page, check URL and text, switch language and verify text and URL changes', async ({ page, goto }) => {
    // Go to the main page
    await goto('/', { waitUntil: 'hydration' })

    // Ensure the URL contains the default locale
    await expect(page).toHaveURL('/en/')

    // Check the initial text for the default locale
    await expect(page.locator('#content')).toHaveText('en')

    await page.click('#contact') // Assuming the link to the Contact page has id 'contact'

    // Check the URL for the Contact page in German
    await expect(page).toHaveURL('/en/contact')

    await page.goBack()

    // Click on the language switcher to show language options
    await page.click('.language-switcher') // Assuming the switcher has a class 'language-switcher'

    // Switch language to 'de'
    await page.click('a.switcher-locale-de') // Assuming the link for switching to 'de' has this class

    // Wait for the language switch to take effect
    await page.waitForTimeout(500) // Adjust timing if needed

    await expect(page).toHaveURL('/de')

    await expect(page.locator('#content')).toHaveText('de')

    await page.click('#contact')

    // Check the URL for the Contact page in English
    await expect(page).toHaveURL('/de/kontakt')

    await goto('/en', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/en')

    await goto('/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
  })

  test('redirect from / to /<locale>/ with cookie set - no error flash', async ({ page, goto, baseURL }) => {
    // Clear cookies first
    await page.context().clearCookies()

    // Set cookie to non-default locale (de)
    await page.context().addCookies([{
      name: 'user-locale',
      value: 'de',
      url: baseURL!,
    }])

    // Track responses to check for redirect behavior
    const responses: { url: string, status: number }[] = []
    page.on('response', (response) => {
      responses.push({ url: response.url(), status: response.status() })
    })

    await goto('/', { waitUntil: 'hydration' })

    // Should be redirected to /de/
    await expect(page).toHaveURL('/de/')

    // Should show German content
    await expect(page.locator('#content')).toHaveText('de')

    // Check that the first response was a redirect (302), not an error
    const rootResponse = responses.find(r => r.url.endsWith('/') && !r.url.includes('/de'))
    if (rootResponse) {
      // Should be 302 redirect, not 404/500
      expect([200, 301, 302]).toContain(rootResponse.status)
    }
  })

  test('redirect from / to /en/ with no cookie - uses defaultLocale', async ({ page, goto }) => {
    // Clear all cookies
    await page.context().clearCookies()

    await goto('/', { waitUntil: 'hydration' })

    // Should redirect to /en/ (defaultLocale)
    await expect(page).toHaveURL('/en/')

    // Should show English content
    await expect(page.locator('#content')).toHaveText('en')
  })
})
