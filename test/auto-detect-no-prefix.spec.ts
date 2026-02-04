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

  test('detects German from Accept-Language header and sets locale', async ({ request }) => {
    const res = await request.get('/', {
      headers: { 'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8' },
    })
    expect(res.status()).toBe(200)
    const html = await res.text()
    expect(html).toContain('id="locale">de</p>')
    expect(html).toContain('id="greeting">Hallo</p>')
  })

  test('detects Russian from Accept-Language header', async ({ request }) => {
    // Use direct request - Playwright setExtraHTTPHeaders may not reach SSR for initial doc
    const res = await request.get('/', {
      headers: { 'Accept-Language': 'ru-RU,ru;q=0.9' },
    })
    expect(res.status()).toBe(200)
    const html = await res.text()
    expect(html).toContain('id="locale">ru</p>')
    expect(html).toContain('id="greeting">Привет</p>')
  })

  test('falls back to default locale for unknown language', async ({ page, goto }) => {
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-CN,zh;q=0.9',
    })

    await goto('/', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/')
    // Should fallback to default (en)
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#greeting')).toHaveText('Hello')
  })

  test('uses default locale when Accept-Language matches default', async ({ page, goto }) => {
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
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

    // Set Accept-Language to Russian (cookie should take precedence)
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ru-RU,ru;q=0.9',
    })

    await goto('/', { waitUntil: 'hydration' })

    // Cookie should take precedence
    await expect(page.locator('#locale')).toHaveText('de')
    await expect(page.locator('#greeting')).toHaveText('Hallo')
  })
})
