import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

// Tests for 'prefix' strategy (fixtures/named has strategy: 'prefix', defaultLocale: 'de')
test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/named', import.meta.url)),
  },
})

test.describe('cookie-based redirect - prefix strategy', () => {
  test('redirect to cookie locale when valid', async ({ page, goto, baseURL }) => {
    // Clear cookies first
    await page.context().clearCookies()

    // Set valid locale cookie
    await page.context().addCookies([
      {
        name: 'user-locale',
        value: 'en',
        url: baseURL!,
      },
    ])

    await goto('/', { waitUntil: 'hydration' })

    // Should redirect to /en because cookie is set to 'en'
    await expect(page).toHaveURL('/en')
  })

  test('fallback to defaultLocale when cookie has invalid locale', async ({ page, goto, baseURL }) => {
    // Clear cookies first
    await page.context().clearCookies()

    // Set INVALID locale cookie (locale that doesn't exist)
    await page.context().addCookies([
      {
        name: 'user-locale',
        value: 'fr', // 'fr' is not in locales: ['de', 'en']
        url: baseURL!,
      },
    ])

    await goto('/', { waitUntil: 'hydration' })

    // Should redirect to /de (defaultLocale) because 'fr' is invalid
    await expect(page).toHaveURL('/de')
  })

  test('fallback to defaultLocale when cookie is empty', async ({ page, goto }) => {
    // Clear all cookies
    await page.context().clearCookies()

    await goto('/', { waitUntil: 'hydration' })

    // Should redirect to /de (defaultLocale) because no cookie is set
    await expect(page).toHaveURL('/de')
  })

  test('cookie with valid non-default locale works', async ({ page, goto, baseURL }) => {
    // Clear cookies first
    await page.context().clearCookies()

    // Set cookie to 'en' (non-default, default is 'de')
    await page.context().addCookies([
      {
        name: 'user-locale',
        value: 'en',
        url: baseURL!,
      },
    ])

    await goto('/', { waitUntil: 'hydration' })

    // Should redirect to /en because cookie is set to 'en'
    await expect(page).toHaveURL('/en')

    // Verify content is in English
    await expect(page.locator('#localized-route-2')).toHaveText('/en/page/id-222?info=1111')
  })
})
