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

  test('og:locale is derived from iso when og is omitted', async ({ page, goto }) => {
    await goto('/fr', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-FR')
    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
    expect(ogLocale).toBe('fr_FR')

    const ogAlts = await page.locator('meta[property="og:locale:alternate"]').all()
    const ogAltContents = await Promise.all(ogAlts.map((el) => el.getAttribute('content')))
    expect(ogAltContents).toContain('en_US')
  })
})

test.describe('og:locale SSR and unresolved locales (#230)', () => {
  test('SSR: og:locale uses explicit og and iso-derived format', async ({ request }) => {
    const en = await request.get('/en')
    expect(en.status()).toBe(200)
    expect(await en.text()).toMatch(/<meta[^>]*property="og:locale"[^>]*content="en_US"/)

    const fr = await request.get('/fr')
    expect(fr.status()).toBe(200)
    expect(await fr.text()).toMatch(/<meta[^>]*property="og:locale"[^>]*content="fr_FR"/)
  })

  test('SSR: og:locale is omitted when iso cannot be mapped', async ({ request }) => {
    const res = await request.get('/zh')
    expect(res.status()).toBe(200)
    const html = await res.text()

    expect(html).not.toMatch(/property="og:locale"/)
    expect(html).toContain('hreflang="zh"')
  })

  test('client: og:locale is omitted for unmapped iso', async ({ page, goto }) => {
    await goto('/zh', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('meta[property="og:locale"]')).toHaveCount(0)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  })

  test('client: no og:locale warning in production build (dev warning covered by unit tests)', async ({ page, goto }) => {
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning') warnings.push(msg.text())
    })

    await goto('/zh', { waitUntil: 'domcontentloaded' })

    expect(warnings.some((w) => w.includes('[i18n] Cannot derive og:locale'))).toBe(false)
  })
})
