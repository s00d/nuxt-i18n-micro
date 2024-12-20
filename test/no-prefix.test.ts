import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/strategy', import.meta.url)),
    nuxtConfig: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      i18n: {
        strategy: 'no_prefix',
      },
    },
  },
})

test.describe('no_prefix', () => {
  test('navigate to test-page, check URL and text, switch language and verify text changes', async ({ page, goto }) => {
    // Go to the main page
    await goto('/', { waitUntil: 'hydration' })

    // Ensure the URL stays the same
    await expect(page).toHaveURL('/')

    // Check the initial text for the default locale
    await expect(page.locator('#content')).toHaveText('en')

    // Click on the language switcher to show language options
    await page.click('.language-switcher') // Assuming the switcher has a class 'language-switcher'

    // Switch language to 'de'
    await page.click('a.switcher-locale-de') // Assuming the link for switching to 'de' has this class

    // Wait for the language switch to take effect
    await page.waitForTimeout(500) // Adjust timing if needed

    await expect(page).toHaveURL('/')

    await expect(page.locator('#content')).toHaveText('de')

    await goto('/', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/')

    await expect(page.locator('#content')).toHaveText('de')
  })
})
