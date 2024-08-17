import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  },
})

test('test index', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  await expect(page.locator('#locale')).toHaveText('en')

  await goto('/de', { waitUntil: 'hydration' })
  await expect(page.locator('#locale')).toHaveText('de')
})

test('test plugin methods output on page', async ({ page, goto }) => {
  // Navigate to the /page route
  await goto('/page', { waitUntil: 'hydration' })

  // Verify the locale
  await expect(page.locator('#locale')).toHaveText('Current Locale: en')

  // Verify the list of locales
  await expect(page.locator('#locales')).toHaveText('en, de')

  // Verify the translation for a key
  await expect(page.locator('#translation')).toHaveText('Page example in en') // Replace with actual expected content

  // Verify the pluralization for items
  await expect(page.locator('#plural')).toHaveText('2 items') // Replace with actual pluralization result

  // Verify the localized route generation
  await expect(page.locator('#localized-route')).toHaveText('/de/page')
})

test('test locale switching on page', async ({ page, goto }) => {
  // Navigate to the /page route in English
  await goto('/page', { waitUntil: 'hydration' })

  await expect(page).toHaveURL('/page')

  await expect(page.locator('#locale')).toHaveText('Current Locale: en')

  // Verify the translation for a key after switching locale
  await expect(page.locator('#translation')).toHaveText('Page example in en') // Replace with actual expected content

  // Verify the pluralization for items after switching locale
  await expect(page.locator('#plural')).toHaveText('2 items') // Replace with actual pluralization result in German

  // Verify the localized route generation after switching locale
  await expect(page.locator('#localized-route')).toHaveText('/de/page')

  // Click the link to switch to the German locale
  await page.click('#link-de')

  // Verify that the URL has changed
  await expect(page).toHaveURL('/de/page')

  // Verify the locale after switching
  await expect(page.locator('#locale')).toHaveText('Current Locale: de')

  // Verify the translation for a key after switching locale
  await expect(page.locator('#translation')).toHaveText('Page example in de') // Replace with actual expected content

  // Verify the pluralization for items after switching locale
  await expect(page.locator('#plural')).toHaveText('2 items') // Replace with actual pluralization result in German

  // Verify the localized route generation after switching locale
  await expect(page.locator('#localized-route')).toHaveText('/de/page')
})
