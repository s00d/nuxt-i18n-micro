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
})

test.describe('$setI18nRouteParams behavior', () => {
  test('should use correct slug from $setI18nRouteParams when switching from English to Spanish', async ({ page, goto }) => {
    // Navigate to English product page
    await goto('/our-products/coffee-filter-en', { waitUntil: 'domcontentloaded' })

    // Check that page loaded
    await expect(page.getByText('Coffee Filter')).toBeVisible()

    // Find the locale switcher link for Spanish (the link itself has class .es)
    const spanishLink = page.locator('.locale-switcher .es').first()

    // The link should point to Spanish version with correct slug
    const href = await spanishLink.getAttribute('href')

    // Should be /es/nuestros-productos/filtro-cafe-es (not /es/nuestros-productos/coffee-filter-en)
    expect(href).toBeTruthy()
    expect(href).toContain('/es/nuestros-productos/filtro-cafe-es')
    expect(href).not.toContain('/es/nuestros-productos/coffee-filter-en')
  })

  test('should use correct slug from $setI18nRouteParams when switching from Spanish to English', async ({ page, goto }) => {
    // Navigate to Spanish product page
    await goto('/es/nuestros-productos/filtro-cafe-es', { waitUntil: 'domcontentloaded' })

    // Check that page loaded
    await expect(page.getByText('Filtro de Café')).toBeVisible()

    // Find the locale switcher link for English (the link itself has class .en)
    const englishLink = page.locator('.locale-switcher .en').first()

    // The link should point to English version with correct slug
    const href = await englishLink.getAttribute('href')

    // Should be /our-products/coffee-filter-en (not /our-products/filtro-cafe-es)
    expect(href).toBeTruthy()
    expect(href).toContain('/our-products/coffee-filter-en')
    expect(href).not.toContain('/our-products/filtro-cafe-es')
  })
})

test.describe('Product index page with localeRoutes', () => {
  test('should be accessible via localized routes', async ({ page, goto }) => {
    // Test English route
    await goto('/our-products', { waitUntil: 'domcontentloaded' })
    // Check that page loaded (title may be from global translations, but description should be from $defineI18nRoute)
    await expect(page.getByText('Discover our collection of high-quality products designed to meet your needs and exceed your expectations.')).toBeVisible()

    // Test Spanish route
    await goto('/es/nuestros-productos', { waitUntil: 'domcontentloaded' })
    // Check that page loaded
    await expect(page.getByText('Descubra nuestra colección de productos de alta calidad diseñados para satisfacer sus necesidades y superar sus expectativas.')).toBeVisible()
  })

  test('should display correct translations for English locale', async ({ page, goto }) => {
    await goto('/our-products', { waitUntil: 'domcontentloaded' })

    // Check English description (from $defineI18nRoute)
    await expect(page.getByText('Discover our collection of high-quality products designed to meet your needs and exceed your expectations.')).toBeVisible()

    // Check that products are displayed
    await expect(page.getByText('Coffee Filter')).toBeVisible()
    await expect(page.getByText('$18.00')).toBeVisible()
  })

  test('should display correct translations for Spanish locale', async ({ page, goto }) => {
    await goto('/es/nuestros-productos', { waitUntil: 'domcontentloaded' })

    // Check Spanish description (from $defineI18nRoute)
    await expect(page.getByText('Descubra nuestra colección de productos de alta calidad diseñados para satisfacer sus necesidades y superar sus expectativas.')).toBeVisible()

    // Check that products are displayed
    await expect(page.getByText('Filtro de Café')).toBeVisible()
    await expect(page.getByText('18,00 €')).toBeVisible()
  })

  test('should have correct locale switcher links', async ({ page, goto }) => {
    // Test from English page
    await goto('/our-products', { waitUntil: 'domcontentloaded' })

    const spanishLink = page.locator('.locale-switcher .es')
    const spanishHref = await spanishLink.getAttribute('href')
    expect(spanishHref).toBeTruthy()
    expect(spanishHref).toContain('/es/nuestros-productos')

    // Test from Spanish page
    await goto('/es/nuestros-productos', { waitUntil: 'domcontentloaded' })

    const englishLink = page.locator('.locale-switcher .en')
    const englishHref = await englishLink.getAttribute('href')
    expect(englishHref).toBeTruthy()
    expect(englishHref).toContain('/our-products')
  })

  test('should have correct product links', async ({ page, goto }) => {
    await goto('/our-products', { waitUntil: 'domcontentloaded' })

    // Find Coffee Filter link
    const coffeeFilterLink = page.locator('a:has-text("Coffee Filter")').first()
    const href = await coffeeFilterLink.getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).toContain('/our-products/coffee-filter-en')
  })

  test('should have correct product links for Spanish locale', async ({ page, goto }) => {
    await goto('/es/nuestros-productos', { waitUntil: 'domcontentloaded' })

    // Find Filtro de Café link
    const filtroLink = page.locator('a:has-text("Filtro de Café")').first()
    const href = await filtroLink.getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).toContain('/es/nuestros-productos/filtro-cafe-es')
  })

  test('should redirect from /product to /our-products for default locale', async ({ page, goto }) => {
    // Try to access /product (should redirect to /our-products)
    const response = await goto('/product', { waitUntil: 'networkidle' })

    // Should redirect or be accessible
    expect(response?.status()).toBeLessThan(400)

    // Check that we're on the correct page by checking description
    await expect(page.getByText('Discover our collection of high-quality products designed to meet your needs and exceed your expectations.')).toBeVisible()
  })

  test('should have correct canonical URL for English page', async ({ page, goto }) => {
    await goto('/our-products', { waitUntil: 'domcontentloaded' })

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBeTruthy()
    expect(canonical).toContain('/our-products')
  })

  test('should have correct canonical URL for Spanish page', async ({ page, goto }) => {
    await goto('/es/nuestros-productos', { waitUntil: 'domcontentloaded' })

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBeTruthy()
    expect(canonical).toContain('/es/nuestros-productos')
  })

  test('should have correct alternate links', async ({ page, goto }) => {
    await goto('/our-products', { waitUntil: 'domcontentloaded' })

    const alternateLinks = page.locator('link[rel="alternate"]')
    const hreflangs = await Promise.all(
      Array.from({ length: await alternateLinks.count() }).map((_, i) =>
        alternateLinks.nth(i).getAttribute('hreflang'),
      ),
    )

    // Should have alternates for both locales
    expect(hreflangs).toContain('en')
    expect(hreflangs).toContain('es')
  })
})
