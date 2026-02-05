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

    // Wait for content to load - use text content
    await expect(page.getByRole('heading', { level: 1 })).toContainText('About Us')
    await expect(page.getByText('Learn more about our mission and values.')).toBeVisible()

    // Find contact link by text
    const pageLink = page.getByRole('link', { name: 'Contact Us' })
    await expect(pageLink).toHaveAttribute('href', '/contact')

    await pageLink.click()

    await expect(page).toHaveURL('/contact')
    await expect(page.getByText('Phone')).toBeVisible()

    await page.locator('#locale-switcher button').waitFor({ state: 'visible' })
    await page.click('#locale-switcher button')

    // Wait for dropdown to appear
    await page.locator('.switcher-locale-cs').waitFor({ state: 'visible' })
    await page.click('.switcher-locale-cs')

    await expect(page).toHaveURL('/cs/contact')
  })

  test('Test cs About Page', async ({ page, goto }) => {
    await goto('/about', { waitUntil: 'hydration' })

    await page.locator('#locale-switcher button').waitFor({ state: 'visible' })
    await page.click('#locale-switcher button')

    // Wait for dropdown to appear
    await page.locator('.switcher-locale-cs').waitFor({ state: 'visible' })
    await page.click('.switcher-locale-cs')

    await expect(page).toHaveURL('/cs/about')

    // Wait for content to load - use text content
    await expect(page.getByRole('heading', { level: 1 })).toContainText('O nás')
    await expect(page.getByText('Zjistěte více o naší misi a hodnotách.')).toBeVisible()

    // Find contact link - in Czech the link text might be different
    const pageLink = page.getByRole('link', { name: 'Contact Us' })
    await expect(pageLink).toHaveAttribute('href', '/cs/contact')

    await pageLink.click()

    await expect(page).toHaveURL('/cs/contact')
    await expect(page.getByText('Telefon')).toBeVisible()
  })
})
