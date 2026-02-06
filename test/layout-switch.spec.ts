import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/layout-switch', import.meta.url)),
  },
})

test.describe('Layout Switch and Cookie Redirect', () => {
  test.describe('$switchLocale - layout translations', () => {
    test('layout text should update when switching locale via $switchLocale', async ({ page, goto }) => {
      await goto('/', { waitUntil: 'hydration' })

      // Check initial English state
      await expect(page.locator('.layout-title')).toHaveText('My App')
      await expect(page.locator('.nav-home')).toHaveText('Home')
      await expect(page.locator('.nav-about')).toHaveText('About')
      await expect(page.locator('.page-welcome')).toHaveText('Welcome to our site')

      // Click ZH button to switch locale
      await page.click('[data-locale="zh"]')

      // Wait for navigation/update
      await page.waitForURL(/\/zh/)

      // Check that BOTH layout AND page content switched to Chinese
      await expect(page.locator('.layout-title')).toHaveText('我的应用')
      await expect(page.locator('.nav-home')).toHaveText('首页')
      await expect(page.locator('.nav-about')).toHaveText('关于')
      await expect(page.locator('.page-welcome')).toHaveText('欢迎来到我们的网站')
      await expect(page.locator('.locale-value')).toHaveText('zh')

      // Switch to Japanese
      await page.click('[data-locale="ja"]')
      await page.waitForURL(/\/ja/)

      // Check Japanese translations
      await expect(page.locator('.layout-title')).toHaveText('マイアプリ')
      await expect(page.locator('.nav-home')).toHaveText('ホーム')
      await expect(page.locator('.page-welcome')).toHaveText('私たちのサイトへようこそ')

      // Switch back to English
      await page.click('[data-locale="en"]')
      // For prefix_except_default, English goes to / without prefix
      await page.waitForTimeout(500)

      // Check English again
      await expect(page.locator('.layout-title')).toHaveText('My App')
      await expect(page.locator('.nav-home')).toHaveText('Home')
    })

    test('layout should update on direct URL navigation to different locale', async ({ page, goto }) => {
      // Start with Chinese
      await goto('/zh', { waitUntil: 'hydration' })

      // Should be Chinese
      await expect(page.locator('.layout-title')).toHaveText('我的应用')
      await expect(page.locator('.page-welcome')).toHaveText('欢迎来到我们的网站')

      // Navigate directly to Japanese URL
      await goto('/ja', { waitUntil: 'hydration' })

      // Should be Japanese
      await expect(page.locator('.layout-title')).toHaveText('マイアプリ')
      await expect(page.locator('.page-welcome')).toHaveText('私たちのサイトへようこそ')
    })
  })

  test.describe('Cookie-based redirect', () => {
    test('should redirect to cookie locale on homepage visit', async ({ page, goto }) => {
      await goto('/', { waitUntil: 'hydration' })

      // Switch to Japanese and verify cookie is set
      await page.click('[data-locale="ja"]')
      await page.waitForURL(/\/ja/)

      // Verify we're on /ja
      expect(page.url()).toContain('/ja')
      await expect(page.locator('.locale-value')).toHaveText('ja')

      // Get cookies
      const cookies = await page.context().cookies()
      const localeCookie = cookies.find(c => c.name === 'i18n_locale')
      expect(localeCookie?.value).toBe('ja')

      // Now visit homepage directly - should redirect to /ja based on cookie
      await goto('/', { waitUntil: 'hydration' })

      // Should have redirected to Japanese (URL should be /ja after redirect)
      expect(page.url()).toContain('/ja')
      await expect(page.locator('.locale-value')).toHaveText('ja')
      await expect(page.locator('.layout-title')).toHaveText('マイアプリ')
    })

    test('cookie should take priority over Accept-Language header', async ({ page, goto, baseURL }) => {
      // First visit to set up context
      await goto('/', { waitUntil: 'hydration' })

      // Set cookie to Japanese
      await page.context().addCookies([{
        name: 'i18n_locale',
        value: 'ja',
        domain: new URL(baseURL!).hostname,
        path: '/',
      }])

      // Set Chinese Accept-Language
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'zh-CN,zh;q=0.9',
      })

      // Visit homepage - should redirect to /ja based on cookie (cookie > Accept-Language)
      await goto('/', { waitUntil: 'hydration' })

      // Should use cookie value (ja), not Accept-Language (zh)
      expect(page.url()).toContain('/ja')
      await expect(page.locator('.locale-value')).toHaveText('ja')
      await expect(page.locator('.layout-title')).toHaveText('マイアプリ')
    })
  })
})
