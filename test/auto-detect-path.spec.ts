import { describe, expect, setupE2E, test } from './setup/vitest-e2e'

await setupE2E({ shared: 'cookie-auto-detect-root' })

describe('autoDetectPath: `/` (#242)', () => {
  test('cookie still redirects `/` to preferred locale', async ({ page, goto, baseURL }) => {
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL! }])

    await goto('/', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/de')
  })

  test('cookie redirects `/` when a query value contains a dot', async ({ page, goto, baseURL }) => {
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL! }])

    // The dot in the query value must not be mistaken for a static-asset
    // extension by the server middleware
    await goto('/?utm_source=news.example.com', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/de?utm_source=news.example.com')
  })

  test('deep unprefixed links are not rewritten by the cookie', async ({ page, goto, baseURL }) => {
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL! }])

    await goto('/page', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/page')
    await expect(page.locator('#locale')).toHaveText('en')
  })
})
