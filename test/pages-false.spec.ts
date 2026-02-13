import { fileURLToPath } from 'node:url'
import { test as baseTest, expect } from '@nuxt/test-utils/playwright'

// Test: pages: false with i18n (prefix_except_default strategy)
// Note: With pages: false, redirect functionality is limited because
// the router doesn't have page-based routes to redirect to.
const testPrefixExceptDefault = baseTest.extend({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/pages-false', import.meta.url)),
  },
})

testPrefixExceptDefault.describe('pages: false with i18n (prefix_except_default)', () => {
  testPrefixExceptDefault.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  testPrefixExceptDefault('prefix_except_default: renders default locale content on root path', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Should show English content (default locale)
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#greeting')).toHaveText('Hello')
  })

  testPrefixExceptDefault('prefix_except_default: respects cookie locale and shows correct translations', async ({ page, goto, baseURL }) => {
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

  testPrefixExceptDefault('prefix_except_default: handles invalid cookie gracefully', async ({ page, goto, baseURL }) => {
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

  testPrefixExceptDefault('prefix_except_default: handles cleared cookie gracefully', async ({ page, goto }) => {
    // No cookie set
    await goto('/', { waitUntil: 'hydration' })

    // Should use default locale (en), not throw error
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#greeting')).toHaveText('Hello')
  })
})

// Test: pages: false with no_prefix strategy
// This is the recommended approach for pages: false
const testNoPrefix = baseTest.extend({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/pages-false-no-prefix', import.meta.url)),
  },
})

testNoPrefix.describe('pages: false with i18n (no_prefix)', () => {
  testNoPrefix.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  testNoPrefix('no_prefix: renders default locale content on root path', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Should show English content (default locale)
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#greeting')).toHaveText('Hello')
  })

  testNoPrefix('no_prefix: respects cookie locale and shows correct translations', async ({ page, goto, baseURL }) => {
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
  // For dynamic locale switching with pages: false, consider:
  // 1. Using a full page reload after switching locale
  // 2. Manually loading translations via $mergeTranslations

  testNoPrefix('no_prefix: handles invalid cookie gracefully', async ({ page, goto, baseURL }) => {
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
