import { describe, expect, setupE2E, test } from './setup/vitest-e2e'

await setupE2E({ shared: 'cookie-auto-detect-root' })

describe('autoDetectPath: `/` (#242)', () => {
  test('cookie still redirects `/` to preferred locale', async ({ page, goto, baseURL }) => {
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL! }])

    await goto('/', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/de')
  })

  test('deep unprefixed links are not rewritten by the cookie', async ({ page, goto, baseURL }) => {
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL! }])

    await goto('/page', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/page')
    await expect(page.locator('#locale')).toHaveText('en')
  })
})
