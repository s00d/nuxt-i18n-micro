import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/define-i18n-route', import.meta.url)),
  },
})

test.describe('$defineI18nRoute behavior', () => {
  test('should generate alternates only for specified locales in $defineI18nRoute', async ({ page, goto }) => {
    // Navigate to test page that uses $defineI18nRoute with locales: ['en']
    await goto('/test', { waitUntil: 'domcontentloaded' })

    // Check that page loaded
    await expect(page.getByText('test in en')).toBeVisible()

    // Get all alternate links
    const alternateLinks = page.locator('link[rel="alternate"]')
    const count = await alternateLinks.count()

    // Should only be alternate links for 'en' locale
    const hreflangs = await Promise.all(
      Array.from({ length: count }).map((_, i) =>
        alternateLinks.nth(i).getAttribute('hreflang'),
      ),
    )

    // Check that there's only 'en' and 'en_EN' (ISO code)
    expect(hreflangs).toContain('en')
    expect(hreflangs).toContain('en_EN')

    // Check that there's NO 'es' and 'es-ES' alternate links
    expect(hreflangs).not.toContain('es')
    expect(hreflangs).not.toContain('es-ES')
  })

  test('should generate correct canonical URL for restricted locale page', async ({ page, goto }) => {
    await goto('/test', { waitUntil: 'domcontentloaded' })

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toContain('/test')
  })

  test('should generate correct og:locale meta for restricted locale page', async ({ page, goto }) => {
    await goto('/test', { waitUntil: 'domcontentloaded' })

    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
    expect(ogLocale).toBe('en_EN')
  })

  test('should generate correct og:locale:alternate meta only for specified locales', async ({ page, goto }) => {
    await goto('/test', { waitUntil: 'domcontentloaded' })

    const ogAlternate = await page.locator('meta[property="og:locale:alternate"]').all()
    const contents = await Promise.all(ogAlternate.map(el => el.getAttribute('content')))

    // Should only be 'en_EN'
    expect(contents).toContain('en_EN')

    // Should NOT be 'es-ES'
    expect(contents).not.toContain('es-ES')
  })

  test('should return 404 for non-specified locale when accessing directly', async ({ page }) => {
    // Attempt to access /es/test should return 404, as 'es' is not specified in $defineI18nRoute
    const response = await page.goto('/es/test', { waitUntil: 'networkidle' })

    // Check that page is not accessible (404 or redirect)
    expect(response?.status()).toBeGreaterThanOrEqual(400)
  })

  test('should work correctly for default locale without prefix', async ({ page, goto }) => {
    // Test access to page without prefix (default locale)
    await goto('/test', { waitUntil: 'domcontentloaded' })

    // Check that content displays correctly
    await expect(page.getByText('test in en')).toBeVisible()

    // Check that alternate links are correct
    const alternateLinks = page.locator('link[rel="alternate"]')
    const hreflangs = await Promise.all(
      Array.from({ length: await alternateLinks.count() }).map((_, i) =>
        alternateLinks.nth(i).getAttribute('hreflang'),
      ),
    )

    expect(hreflangs).toContain('en')
    expect(hreflangs).not.toContain('es')
  })

  test('should not generate alternates for non-specified locales in build output', async ({ page, goto }) => {
    await goto('/test', { waitUntil: 'domcontentloaded' })

    // Get HTML content of the page
    const html = await page.content()

    // Check that HTML does NOT contain alternate links for 'es'
    expect(html).not.toContain('hreflang="es"')
    expect(html).not.toContain('hreflang="es-ES"')

    // Check that HTML does NOT contain og:locale:alternate for 'es-ES'
    expect(html).not.toContain('og:locale:alternate" content="es-ES"')

    // Check that there are alternate links for 'en'
    expect(html).toContain('hreflang="en"')
    expect(html).toContain('hreflang="en_EN"')
  })

  test('should generate alternate links with localized paths from localeRoutes', async ({ page, goto, baseURL }) => {
    const normalizedBaseURL = (baseURL || 'http://localhost:3000').replace(/\/$/, '')

    // Navigate to English page with localized route
    await goto('/our-products', { waitUntil: 'domcontentloaded' })

    // Check that page loaded with correct content
    await expect(page.getByText('Our Products')).toBeVisible()

    // Check alternate links for English (default locale, no prefix)
    await expect(page.locator('link#i18n-alternate-en')).toHaveAttribute('href', `${normalizedBaseURL}/our-products`)
    await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', `${normalizedBaseURL}/our-products`)

    // Check alternate links for Spanish (should use localized path from localeRoutes)
    await expect(page.locator('link#i18n-alternate-es')).toHaveAttribute('href', `${normalizedBaseURL}/es/nuestros-productos`)
    await expect(page.locator('link#i18n-alternate-es-ES')).toHaveAttribute('href', `${normalizedBaseURL}/es/nuestros-productos`)

    // Navigate to Spanish page with localized route
    await goto('/es/nuestros-productos', { waitUntil: 'domcontentloaded' })

    // Check that page loaded with correct content
    await expect(page.getByText('Nuestros Productos')).toBeVisible()

    // Check alternate links for Spanish
    await expect(page.locator('link#i18n-alternate-es')).toHaveAttribute('href', `${normalizedBaseURL}/es/nuestros-productos`)
    await expect(page.locator('link#i18n-alternate-es-ES')).toHaveAttribute('href', `${normalizedBaseURL}/es/nuestros-productos`)

    // Check alternate links for English (should use localized path from localeRoutes)
    await expect(page.locator('link#i18n-alternate-en')).toHaveAttribute('href', `${normalizedBaseURL}/our-products`)
    await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', `${normalizedBaseURL}/our-products`)
  })

  test('should generate correct canonical URL with localized paths from localeRoutes', async ({ page, goto, baseURL }) => {
    const normalizedBaseURL = (baseURL || 'http://localhost:3000').replace(/\/$/, '')

    // Navigate to English page with localized route
    await goto('/our-products', { waitUntil: 'domcontentloaded' })

    // Check canonical URL for English (should use localized path, no prefix for default locale)
    const canonicalEn = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonicalEn).toBe(`${normalizedBaseURL}/our-products`)

    // Navigate to Spanish page with localized route
    await goto('/es/nuestros-productos', { waitUntil: 'domcontentloaded' })

    // Check canonical URL for Spanish (should use localized path with locale prefix)
    const canonicalEs = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonicalEs).toBe(`${normalizedBaseURL}/es/nuestros-productos`)
  })
})
