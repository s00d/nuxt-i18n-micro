import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

// Test: autoDetectLanguage with no_prefix strategy
test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/auto-detect-no-prefix', import.meta.url)),
  },
})

test.describe('autoDetectLanguage with no_prefix strategy', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies()
  })

  test('detects German from Accept-Language header and sets locale', async ({ page, goto }) => {
    // Use route interception to add Accept-Language header to ALL requests including SSR
    await page.route('**/*', async (route) => {
      const headers = {
        ...route.request().headers(),
        'accept-language': 'de-DE,de;q=0.9,en;q=0.8',
      }
      await route.continue({ headers })
    })

    await goto('/', { waitUntil: 'hydration' })

    // URL should stay the same (no_prefix)
    await expect(page).toHaveURL('/')

    // Check that locale is detected as German
    await expect(page.locator('#locale')).toHaveText('de')
    await expect(page.locator('#greeting')).toHaveText('Hallo')

    // Verify cookie is set
    const cookies = await page.context().cookies()
    const userLocaleCookie = cookies.find(cookie => cookie.name === 'user-locale')
    expect(userLocaleCookie).toBeDefined()
    expect(userLocaleCookie?.value).toBe('de')
  })

  test('detects Russian from Accept-Language header', async ({ page, goto }) => {
    await page.route('**/*', async (route) => {
      const headers = {
        ...route.request().headers(),
        'accept-language': 'ru-RU,ru;q=0.9',
      }
      await route.continue({ headers })
    })

    await goto('/', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/')
    await expect(page.locator('#locale')).toHaveText('ru')
    await expect(page.locator('#greeting')).toHaveText('Привет')
  })

  test('falls back to default locale for unknown language', async ({ page, goto }) => {
    await page.route('**/*', async (route) => {
      const headers = {
        ...route.request().headers(),
        'accept-language': 'zh-CN,zh;q=0.9',
      }
      await route.continue({ headers })
    })

    await goto('/', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/')
    // Should fallback to default (en)
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#greeting')).toHaveText('Hello')
  })

  test('uses default locale when Accept-Language matches default', async ({ page, goto }) => {
    await page.route('**/*', async (route) => {
      const headers = {
        ...route.request().headers(),
        'accept-language': 'en-US,en;q=0.9',
      }
      await route.continue({ headers })
    })

    await goto('/', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/')
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#greeting')).toHaveText('Hello')
  })

  test('respects existing cookie over Accept-Language', async ({ page, goto, baseURL }) => {
    // First, set cookie to German
    await page.context().addCookies([{
      name: 'user-locale',
      value: 'de',
      url: baseURL!,
    }])

    // Set Accept-Language to Russian via route interception
    await page.route('**/*', async (route) => {
      const headers = {
        ...route.request().headers(),
        'accept-language': 'ru-RU,ru;q=0.9',
      }
      await route.continue({ headers })
    })

    await goto('/', { waitUntil: 'hydration' })

    // Cookie should take precedence
    await expect(page.locator('#locale')).toHaveText('de')
    await expect(page.locator('#greeting')).toHaveText('Hallo')
  })
})
