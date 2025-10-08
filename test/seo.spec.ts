import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/seo', import.meta.url)),
  },
})

test.describe('SEO with strategy: prefix', () => {
  test('should include only whitelisted query params in canonical and og:url', async ({ page, goto }) => {
    await goto('/en/contact?q=hello&page=2&foo=ignore', { waitUntil: 'domcontentloaded' })

    const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
    const ogUrlContent = await page.locator('meta[property="og:url"]').getAttribute('content')

    const canonicalURL = new URL(canonicalHref!)
    const ogURL = new URL(ogUrlContent!)

    // Check paths
    expect(canonicalURL.pathname).toBe('/en/contact')
    expect(ogURL.pathname).toBe('/en/contact')

    // Check query parameters
    const canonicalParams = canonicalURL.searchParams
    const ogParams = ogURL.searchParams

    expect(canonicalParams.get('q')).toBe('hello')
    expect(canonicalParams.get('page')).toBe('2')
    expect(canonicalParams.has('foo')).toBe(false)

    expect(ogParams.get('q')).toBe('hello')
    expect(ogParams.get('page')).toBe('2')
    expect(ogParams.has('foo')).toBe(false)

    // Check identity of canonical and og:url
    expect(canonicalURL.toString()).toBe(ogURL.toString())
  })

  test('should render html lang and dir attributes correctly', async ({ page, goto }) => {
    await goto('/de/kontakt', { waitUntil: 'domcontentloaded' })
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'de_DE')
    await expect(html).toHaveAttribute('dir', 'auto')
  })

  test('should render og:locale and og:locale:alternate metas', async ({ page, goto }) => {
    await goto('/en/contact', { waitUntil: 'domcontentloaded' })

    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
    expect(ogLocale).toBe('en_EN')

    const ogAlternate = await page.locator('meta[property="og:locale:alternate"]').all()
    const contents = await Promise.all(ogAlternate.map(el => el.getAttribute('content')))
    expect(contents).toContain('de_DE')
  })

  test('should generate alternate hreflang links for other locales', async ({ page, goto }) => {
    await goto('/en/about', { waitUntil: 'domcontentloaded' })

    const links = page.locator('link[rel="alternate"]')
    const count = await links.count()
    expect(count).toBeGreaterThan(0)

    const hreflangs = await Promise.all(
      Array.from({ length: count }).map((_, i) =>
        links.nth(i).getAttribute('hreflang'),
      ),
    )
    expect(hreflangs).toContain('en')
    expect(hreflangs).toContain('de')
  })

  test('should support locale path override with $defineI18nRoute', async ({ page, goto }) => {
    await goto('/de/kontakt', { waitUntil: 'domcontentloaded' })

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toContain('/de/kontakt')

    const content = await page.locator('#content').textContent()
    expect(content).not.toBe('')
  })
})
