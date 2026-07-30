import { describe, expect, setupE2E, test } from './setup/vitest-e2e'

// Test: pages: false with i18n (prefix_except_default strategy)
// Note: With pages: false, redirect functionality is limited because
// the router doesn't have page-based routes to redirect to.
await setupE2E({ shared: 'pages-false' })

describe('pages: false with i18n (prefix_except_default)', () => {
  // Fresh browser context per test — cookies start clean.

  test('prefix_except_default: renders default locale content on root path', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Should show English content (default locale)
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#greeting')).toHaveText('Hello')
  })

  test('prefix_except_default: respects cookie locale and shows correct translations', async ({ page, goto, baseURL }) => {
    // Set Chinese locale cookie
    await page.context().addCookies([
      {
        name: 'user-locale',
        value: 'zh',
        url: baseURL!,
      },
    ])

    await goto('/', { waitUntil: 'hydration' })

    // With pages: false and prefix_except_default, there's no redirect
    // but translations should still work based on cookie
    await expect(page.locator('#locale')).toHaveText('zh')
    await expect(page.locator('#greeting')).toHaveText('你好')
  })

  test('prefix_except_default: handles invalid cookie gracefully', async ({ page, goto, baseURL }) => {
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

  test('prefix_except_default: handles cleared cookie gracefully', async ({ page, goto }) => {
    // No cookie set
    await goto('/', { waitUntil: 'hydration' })

    // Should use default locale (en), not throw error
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#greeting')).toHaveText('Hello')
  })
})
