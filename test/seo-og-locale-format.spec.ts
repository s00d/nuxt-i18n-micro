import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/seo-og-locale-format', import.meta.url)),
  },
})

test.describe('locale.og', () => {
  test('og:locale uses locale.og; html lang and hreflang stay BCP 47 from iso', async ({ page, goto }) => {
    await goto('/en', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')

    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
    expect(ogLocale).toBe('en_US')

    const ogAlts = await page.locator('meta[property="og:locale:alternate"]').all()
    const ogAltContents = await Promise.all(ogAlts.map((el) => el.getAttribute('content')))
    expect(ogAltContents).toContain('ar_AE')

    const hreflangArAe = page.locator('link[rel="alternate"][hreflang="ar-AE"]')
    await expect(hreflangArAe).toHaveCount(1)
  })

  test('non-default locale: og:locale uses locale.og', async ({ page, goto }) => {
    await goto('/ar', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('html')).toHaveAttribute('lang', 'ar-AE')
    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
    expect(ogLocale).toBe('ar_AE')
  })
})
