import { describe, expect, test } from '../helpers/guarded-test.ts'

describe('journey: no_prefix custom paths render their own locale', () => {
  test.override({ harness: 'strategy-no-prefix' })

  test('/kontakt is German for everyone', async ({ page, goto, baseURL }) => {
    const base = baseURL.replace(/\/$/, '')
    // step 1: no preference → de, lang and canonical of this URL
    await goto('/kontakt', { waitUntil: 'hydration' })
    await expect(page.locator('.locale-value')).toHaveText('de')
    await expect(page.locator('html')).toHaveAttribute('lang', 'de_DE')
    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${base}/kontakt`)
    await expect(page.locator('.layout-title')).toHaveText('Meine App')

    // step 2: a stored en does not change it, and the browser agrees with the server
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'en', url: baseURL }])
    await goto('/kontakt', { waitUntil: 'hydration' })
    await expect(page.locator('.locale-value')).toHaveText('de')
    await expect(page.locator('.layout-title')).toHaveText('Meine App')

    // step 3: the page's other URL keeps the preference
    await goto('/contact', { waitUntil: 'hydration' })
    await expect(page.locator('.locale-value')).toHaveText('en')
    await expect(page.locator('.layout-title')).toHaveText('My App')
  })
})
