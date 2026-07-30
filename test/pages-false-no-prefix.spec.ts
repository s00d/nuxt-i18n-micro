import { describe, expect, setupE2E, test } from './setup/vitest-e2e'

// Test: pages: false with no_prefix strategy.
// This is the recommended approach for pages: false.
await setupE2E({ shared: 'pages-false-no-prefix' })

describe('pages: false with i18n (no_prefix)', () => {
  // Fresh browser context per test — cookies start clean.

  test('no_prefix: renders default locale content on root path', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Should show English content (default locale)
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#greeting')).toHaveText('Hello')
  })

  test('no_prefix: respects cookie locale and shows correct translations', async ({ page, goto, baseURL }) => {
    // Set Chinese locale cookie
    await page.context().addCookies([
      {
        name: 'user-locale',
        value: 'zh',
        url: baseURL!,
      },
    ])

    await goto('/', { waitUntil: 'hydration' })

    // With no_prefix, locale is determined by cookie
    await expect(page.locator('#locale')).toHaveText('zh')
    await expect(page.locator('#greeting')).toHaveText('你好')
  })

  // Note: Client-side locale switching with pages: false requires
  // a page reload because the router doesn't have routes to trigger
  // translation reloading. This is a known limitation.

  test('no_prefix: handles invalid cookie gracefully', async ({ page, goto, baseURL }) => {
    // Set invalid locale cookie
    await page.context().addCookies([
      {
        name: 'user-locale',
        value: 'invalid-locale',
        url: baseURL!,
      },
    ])

    await goto('/', { waitUntil: 'hydration' })

    // Should fallback to default locale (en), not throw error
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#greeting')).toHaveText('Hello')
  })
})
