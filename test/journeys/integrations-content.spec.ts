import type { Page } from '@playwright/test'
import { describe, expect, test } from 'untestutils/vitest'

async function switchToCs(page: Page) {
  await page.locator('#locale-switcher button').click()
  await page.locator('.switcher-locale-cs').click()
}

describe('J9 integrations: @nuxt/content', () => {
  test.override({ harness: 'content' })

  test('content pages per locale, links and the switcher', async ({ page, goto }) => {
    // step 1: open /about (en) → heading, text, Contact link → /contact Phone
    // was: content › Test About Page
    await goto('/about', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/about')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('About Us')
    await expect(page.getByText('Learn more about our mission and values.')).toBeVisible()
    const enLink = page.getByRole('link', { name: 'Contact Us' })
    await expect(enLink).toHaveAttribute('href', '/contact')
    await enLink.click()
    await expect(page).toHaveURL('/contact')
    await expect(page.getByText('Phone')).toBeVisible()

    // step 2: switch to cs on /contact → /cs/contact Telefon
    await switchToCs(page)
    await expect(page).toHaveURL('/cs/contact')
    await expect(page.getByText('Telefon')).toBeVisible()

    // step 3: open /about, switch to cs → /cs/about cs content, link → /cs/contact Telefon
    // was: content › Test cs About Page
    await goto('/about', { waitUntil: 'hydration' })
    await switchToCs(page)
    await expect(page).toHaveURL('/cs/about')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('O nás')
    await expect(page.getByText('Zjistěte více o naší misi a hodnotách.')).toBeVisible()
    const csLink = page.getByRole('link', { name: 'Contact Us' })
    await expect(csLink).toHaveAttribute('href', '/cs/contact')
    await csLink.click()
    await expect(page).toHaveURL('/cs/contact')
    await expect(page.getByText('Telefon')).toBeVisible()
  })
})
