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

    const dataItem = page.locator('.data-item')
    await expect(dataItem.locator('span').nth(1)).toHaveText('Learn more about our mission and values.')

    await pageLink.click()

    await expect(page).toHaveURL('/contact')
    const dataItem2 = page.locator('.data-item')
    await expect(dataItem2.locator('span').nth(1)).toHaveText('Phone')

    await page.locator('#locale-switcher button').waitFor({ state: 'visible' })
    await page.click('#locale-switcher button')

    await page.waitForTimeout(200)

    await page.click('.switcher-locale-cs')

    await expect(page).toHaveURL('/cs/contact')
  })

  test('Test cs About Page', async ({ page, goto }) => {
    await goto('/about', { waitUntil: 'hydration' })

    await page.locator('#locale-switcher button').waitFor({ state: 'visible' })
    await page.click('#locale-switcher button')

    await page.waitForTimeout(200)

    await page.click('.switcher-locale-cs')

    await expect(page).toHaveURL('/cs/about')
    await expect(page.locator('h1')).toHaveText('O nás')

    const pageLink = page.locator('.page-link').nth(0)
    await expect(pageLink).toHaveAttribute('href', '/cs/contact')

    const dataItem = page.locator('.data-item')
    await expect(dataItem.locator('span').nth(1)).toHaveText('Zjistěte více o naší misi a hodnotách.')

    await pageLink.click()

    await expect(page).toHaveURL('/cs/contact')
    const dataItem2 = page.locator('.data-item')
    await expect(dataItem2.locator('span').nth(1)).toHaveText('Telefon')
  })
})
