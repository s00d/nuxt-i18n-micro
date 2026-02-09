import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/content', import.meta.url)),
  },
})

async function switchLocale(page: import('@playwright/test').Page, localeClass: string) {
  const switcher = page.locator('#locale-switcher button')
  await switcher.waitFor({ state: 'visible', timeout: 10000 })
  // Wait for hydration — ensure button is interactive
  await page.waitForTimeout(500)
  await switcher.click()

  const localeOption = page.locator(localeClass)
  await localeOption.waitFor({ state: 'visible', timeout: 5000 })
  await localeOption.click()
}

test.describe('content', () => {
  test('Test About Page', async ({ page, goto }) => {
    test.setTimeout(60000)

    await goto('/about', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/about')

    // Wait for content to load - use text content
    await expect(page.getByRole('heading', { level: 1 })).toContainText('About Us', { timeout: 10000 })
    await expect(page.getByText('Learn more about our mission and values.')).toBeVisible()

    // Find contact link by text
    const pageLink = page.getByRole('link', { name: 'Contact Us' })
    await expect(pageLink).toHaveAttribute('href', '/contact')

    await pageLink.click()

    await expect(page).toHaveURL('/contact')
    await expect(page.getByText('Phone')).toBeVisible({ timeout: 10000 })

    await switchLocale(page, '.switcher-locale-cs')

    await expect(page).toHaveURL('/cs/contact')
  })

  test('Test cs About Page', async ({ page, goto }) => {
    test.setTimeout(60000)

    await goto('/about', { waitUntil: 'hydration' })

    await switchLocale(page, '.switcher-locale-cs')

    await expect(page).toHaveURL('/cs/about')

    // Wait for content to load - use text content
    await expect(page.getByRole('heading', { level: 1 })).toContainText('O nás', { timeout: 10000 })
    await expect(page.getByText('Zjistěte více o naší misi a hodnotách.')).toBeVisible()

    // Find contact link - in Czech the link text might be different
    const pageLink = page.getByRole('link', { name: 'Contact Us' })
    await expect(pageLink).toHaveAttribute('href', '/cs/contact')

    await pageLink.click()

    await expect(page).toHaveURL('/cs/contact')
    await expect(page.getByText('Telefon')).toBeVisible({ timeout: 10000 })
  })
})
