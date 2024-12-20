import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/content', import.meta.url)),
  },
})

test.describe('content', () => {
  test('Test About Page', async ({ page, goto }) => {
    await goto('/about', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/about')
    await expect(page.locator('h1')).toHaveText('About Us')

    const pageLink = page.locator('.page-link').nth(0)
    await expect(pageLink).toHaveAttribute('href', '/contact')

    await expect(page.locator('span').nth(2)).toHaveText('Learn more about our mission and values.')

    await pageLink.click()

    await expect(page).toHaveURL('/contact')

    await expect(page.locator('span').nth(2)).toHaveText('Phone')

    await page.click('#locale-switcher button')

    await page.waitForTimeout(200)

    await page.click('.switcher-locale-cs')

    await expect(page).toHaveURL('/cs/contact')
  })

  test('Test cs About Page', async ({ page, goto }) => {
    await goto('/about', { waitUntil: 'hydration' })

    await page.click('#locale-switcher button')

    await page.waitForTimeout(200)

    await page.click('.switcher-locale-cs')

    await expect(page).toHaveURL('/cs/about')
    await expect(page.locator('h1')).toHaveText('O nás')

    const pageLink = page.locator('.page-link').nth(0)
    await expect(pageLink).toHaveAttribute('href', '/cs/contact')

    await expect(page.locator('span').nth(2)).toHaveText('Zjistěte více o naší misi a hodnotách.')

    await pageLink.click()

    await expect(page).toHaveURL('/cs/contact')

    await expect(page.locator('span').nth(2)).toHaveText('Telefon')
  })
})
