import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

// Test: prefix strategy
test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/locale-state', import.meta.url)),
    nuxtConfig: {
      i18n: {
        strategy: 'prefix',
      },
    },
  },
})

test.describe('useState locale override - prefix', () => {
  test('redirect from / to /ja/ when useState sets locale', async ({ page, goto }) => {
    // With prefix strategy, visiting / should redirect to /<currentLocale>/
    await goto('/', { waitUntil: 'hydration' })

    // Should redirect to /ja because useState('i18n-locale') is 'ja'
    await expect(page).toHaveURL('/ja')

    // Check that the locale is set to 'ja'
    await expect(page.locator('#locale')).toHaveText('ja')

    // Check that the translation is in Japanese
    await expect(page.locator('#greeting')).toHaveText('こんにちは')

    // Verify cookie is set correctly
    const cookies = await page.context().cookies()
    const userLocaleCookie = cookies.find((cookie) => cookie.name === 'user-locale')

    expect(userLocaleCookie).toBeDefined()
    expect(userLocaleCookie?.value).toBe('ja')
  })

  test('no hydration mismatch when locale set via useState', async ({ page, goto }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        const text = msg.text()
        if (text.includes('hydration') || text.includes('mismatch')) {
          consoleErrors.push(text)
        }
      }
    })

    await goto('/', { waitUntil: 'hydration' })
    await page.waitForTimeout(500)

    expect(consoleErrors.filter((e) => e.toLowerCase().includes('hydration'))).toHaveLength(0)
    await expect(page.locator('#greeting')).toHaveText('こんにちは')
  })

  test('cookie is not overwritten when useState sets locale', async ({ page, goto }) => {
    const cookieWarnings: string[] = []
    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('cookie') && text.includes('overridden')) {
        cookieWarnings.push(text)
      }
    })

    await goto('/', { waitUntil: 'hydration' })
    await page.waitForTimeout(500)

    expect(cookieWarnings).toHaveLength(0)
  })

  test('no 404 error when visiting / with useState (custom-fallback-route fix)', async ({ page, goto }) => {
    // This test ensures that custom-fallback-route doesn't cause 404 errors
    // when trying to load translations for it (bug fix verification)
    const errors: string[] = []
    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('404') || text.includes('custom-fallback-route')) {
        errors.push(text)
      }
    })

    await goto('/', { waitUntil: 'hydration' })

    // Page should load successfully and redirect to /ja
    await expect(page).toHaveURL('/ja')
    await expect(page.locator('#greeting')).toHaveText('こんにちは')

    // Should not have 404 errors related to custom-fallback-route translations
    const translationErrors = errors.filter((e) => e.includes('custom-fallback-route') && e.includes('404'))
    expect(translationErrors).toHaveLength(0)
  })
})
