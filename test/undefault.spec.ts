import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/undefault', import.meta.url)),
  },
  // launchOptions: {
  //   headless: false, // Show browser
  //   slowMo: 500, // Slow down execution steps (in milliseconds) for better visibility
  // },
})

test.describe('undefault', () => {
  test('test redirection and link clicks in English', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    // Navigate to /page2, should redirect to /en/custom-page2-en
    await goto('/page2', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/en/custom-page2-en')

    // Click on 'unlocalized' link, should redirect to /unlocalized
    await page.click('#unlocalized')
    await expect(page).toHaveURL('/unlocalized')

    // Click on 'page2' link, should return to /en/custom-page2-en
    await page.click('#link-en')
    await expect(page).toHaveURL('/en/custom-page2-en')
  })

  test('test redirection and link clicks in German', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    // Navigate to /page2, should redirect to /de/custom-page2-de
    await goto('/de/custom-page2-de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de/custom-page2-de')

    // Click on 'unlocalized' link, should redirect to /unlocalized
    await page.click('#unlocalized')
    await expect(page).toHaveURL('/unlocalized')

    // Click on 'page2' link, should return to /en/custom-page2-en
    await page.click('#link-de')
    await expect(page).toHaveURL('/de/custom-page2-de')
  })

  test('should correctly render post section pages with localized routes', async ({ page, goto }) => {
    // Check in German
    await goto('/de/post/1/all/s2', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#name')).toHaveText('de')
    await expect(page.locator('#name-page')).toHaveText('de page')

    // Check in English
    await goto('/en/post/1/all/s2', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#name')).toHaveText('en')
    await expect(page.locator('#name-page')).toHaveText('en page')

    // Check in Russian
    await goto('/ru/post/1/all/s2', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#name')).toHaveText('ru')
    await expect(page.locator('#name-page')).toHaveText('ru page')
  })
})
