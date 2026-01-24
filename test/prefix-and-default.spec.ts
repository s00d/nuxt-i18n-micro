import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/strategy', import.meta.url)),
    nuxtConfig: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      i18n: {
        strategy: 'prefix_and_default',
      },
    },
  },
})

test.describe('prefix_and_default', () => {
  test('navigate to test-page, check URL and text, switch language and verify text and URL changes', async ({ page, goto }) => {
    // Go to the main page
    await goto('/', { waitUntil: 'hydration' })

    // Ensure the URL stays at / (prefix_and_default allows non-prefixed URLs for default locale)
    await expect(page).toHaveURL('/')

    // Check the initial text for the default locale
    await expect(page.locator('#content')).toHaveText('en')

    await page.click('#contact') // Assuming the link to the Contact page has id 'contact'

    // Check the URL for the Contact page in German
    await expect(page).toHaveURL('/en/contact')

    await page.goBack()

    await goto('/en', { waitUntil: 'hydration' })

    // Ensure the URL contains the default locale
    await expect(page).toHaveURL('/en')

    // Check the initial text for the default locale
    await expect(page.locator('#content')).toHaveText('en')

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

    await goto('/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
  })
})
