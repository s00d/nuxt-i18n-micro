import type { Page } from '@playwright/test'
import { describe, expect, test } from 'untestutils/vitest'

// seo fixture, SEO_VARIANT=use-i18n-head: pec, en (en-US) / fr (fr-FR), meta true.
// /test is restricted to en by $defineI18nRoute; /product has localeRoutes (/our-products, /nos-produits)
// and the detail page sets per-locale slugs with $setI18nRouteParams.
const EN_DESCRIPTION = 'Discover our collection of high-quality products designed to meet your needs and exceed your expectations.'
const FR_DESCRIPTION = 'Découvrez notre collection de produits de haute qualité conçus pour répondre à vos besoins et dépasser vos attentes.'

const attrs = (page: Page, selector: string, attr: string) =>
  page.locator(selector).evaluateAll((els, a) => els.map((el) => el.getAttribute(a)), attr)

interface MetaIds {
  og: string
  ogUrl: string
  ogAlt: [id: string, content: string]
  enHref: string
  frHref: string
}

async function expectMetaIds(page: Page, base: string, m: MetaIds) {
  await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', m.og)
  await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${base}${m.ogUrl}`)
  await expect(page.locator(`meta#i18n-og-alt-${m.ogAlt[0]}`)).toHaveAttribute('content', m.ogAlt[1])
  await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${base}${m.ogUrl}`)
  await expect(page.locator('link#i18n-alternate-en-US')).toHaveAttribute('href', `${base}${m.enHref}`)
  await expect(page.locator('link#i18n-alternate-fr-FR')).toHaveAttribute('href', `${base}${m.frHref}`)
}

describe('J7 $defineI18nRoute page head', () => {
  test.override({ harness: 'seo-use-i18n-head' })

  test('D-T1: a page restricted to en has en-only alternates and no fr route', async ({ page, goto, request, baseURL }) => {
    const base = baseURL!.replace(/\/$/, '')

    // step 1: open /test → en content; hreflangs only en-US + x-default; canonical, og en_US, no og alternates
    // was: define-i18n-route › should generate alternates only for specified locales in $defineI18nRoute
    // was: define-i18n-route › should work correctly for default locale without prefix
    await goto('/test', { waitUntil: 'hydration' })
    await expect(page.getByText('test in en')).toBeVisible()
    expect((await attrs(page, 'link[rel="alternate"]', 'hreflang')).sort()).toEqual(['en-US', 'x-default'])
    // was: define-i18n-route › should generate correct canonical URL for restricted locale page
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/test$/)
    // was: define-i18n-route › should generate correct og:locale meta for restricted locale page
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US')
    // was: define-i18n-route › should generate correct og:locale:alternate meta only for specified locales
    await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveCount(0)
    // was: define-i18n-route › should generate x-default hreflang pointing to the default locale URL
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', `${base}/test`)

    // step 2: GET /test (SSR HTML) → no fr hreflang or og alternate, en-US and x-default present
    // was: define-i18n-route › should not generate alternates for non-specified locales in build output
    const html = await (await request.get('/test')).text()
    expect(html).not.toContain('hreflang="fr"')
    expect(html).not.toContain('hreflang="fr-FR"')
    expect(html).not.toContain('og:locale:alternate" content="fr-FR"')
    expect(html).toContain('hreflang="en-US"')
    expect(html).not.toContain('hreflang="en"')
    expect(html).toContain('hreflang="x-default"')

    // step 3: GET /fr/test → 404 (was `>= 400`)
    // was: define-i18n-route › should return 404 for non-specified locale when accessing directly
    expect((await request.get('/fr/test', { maxRedirects: 0 })).status()).toBe(404)
  })

  test('D-T2: product index and detail in both locales, with SPA navigation', async ({ page, goto, request, baseURL }) => {
    const base = baseURL!.replace(/\/$/, '')

    // step 1: open /our-products → en texts, switcher fr link, product link, meta ids, iso hreflangs
    // was: define-i18n-route › Product index › should be accessible via localized routes
    // was: define-i18n-route › Product index › should display correct translations for English locale
    await goto('/our-products', { waitUntil: 'hydration' })
    await expect(page.getByText(EN_DESCRIPTION)).toBeVisible()
    await expect(page.getByText('Coffee Filter')).toBeVisible()
    await expect(page.getByText('$18.00')).toBeVisible()
    // was: define-i18n-route › Product index › should have correct locale switcher links
    await expect(page.locator('.locale-switcher .fr')).toHaveAttribute('href', /\/fr\/nos-produits/)
    // was: define-i18n-route › Product index › should have correct product links
    await expect(page.locator('a:has-text("Coffee Filter")').first()).toHaveAttribute('href', /\/our-products\/coffee-filter-en/)
    // was: define-i18n-route › Product index › should have correct meta tags for English product page
    // was: define-i18n-route › Product index › should have correct canonical URL for English page
    await expectMetaIds(page, base, {
      og: 'en_US',
      ogUrl: '/our-products',
      ogAlt: ['fr_FR', 'fr_FR'],
      enHref: '/our-products',
      frHref: '/fr/nos-produits',
    })
    // was: define-i18n-route › Product index › should have correct alternate links
    const indexHreflangs = await attrs(page, 'link[rel="alternate"]', 'hreflang')
    expect(indexHreflangs).toContain('en-US')
    expect(indexHreflangs).toContain('fr-FR')
    expect(indexHreflangs).not.toContain('en')
    expect(indexHreflangs).not.toContain('fr')

    // step 2: click Coffee Filter → SPA detail; fr alternate and switcher use the fr slug; detail meta ids
    // was: define-i18n-route › SPA meta timing › client SPA: meta hreflang updates after navigating from English product index to detail
    await page.click('a:has-text("Coffee Filter")')
    await expect(page).toHaveURL(`${base}/our-products/coffee-filter-en`)
    await expect(page.locator('link#i18n-alternate-fr-FR')).toHaveAttribute('href', `${base}/fr/nos-produits/filtre-cafe-fr`)
    // was: $setI18nRouteParams › should use correct slug from $setI18nRouteParams when switching from English to Spanish
    await expect(page.locator('.locale-switcher .fr').first()).toHaveAttribute('href', /\/fr\/nos-produits\/filtre-cafe-fr$/)
    // was: Product detail › should have correct meta tags for English product detail page
    await expectMetaIds(page, base, {
      og: 'en_US',
      ogUrl: '/our-products/coffee-filter-en',
      ogAlt: ['fr_FR', 'fr_FR'],
      enHref: '/our-products/coffee-filter-en',
      frHref: '/fr/nos-produits/filtre-cafe-fr',
    })

    // step 3: open /fr/nos-produits → fr texts, switcher en link, fr product link, meta ids
    // was: Product index › should display correct translations for Spanish locale
    await goto('/fr/nos-produits', { waitUntil: 'hydration' })
    await expect(page.getByText(FR_DESCRIPTION)).toBeVisible()
    await expect(page.getByText('Filtre à café')).toBeVisible()
    await expect(page.getByText('18,00 €')).toBeVisible()
    await expect(page.locator('.locale-switcher .en')).toHaveAttribute('href', /\/our-products/)
    // was: Product index › should have correct product links for Spanish locale
    await expect(page.locator('a:has-text("Filtre à café")').first()).toHaveAttribute('href', /\/fr\/nos-produits\/filtre-cafe-fr/)
    // was: Product index › should have correct meta tags for Spanish product page
    // was: Product index › should have correct canonical URL for Spanish page
    await expectMetaIds(page, base, {
      og: 'fr_FR',
      ogUrl: '/fr/nos-produits',
      ogAlt: ['en_US', 'en_US'],
      enHref: '/our-products',
      frHref: '/fr/nos-produits',
    })

    // step 4: click Filtre à café → SPA fr detail; en alternate and switcher use the en slug; detail meta ids
    // was: SPA meta timing › client SPA: meta hreflang updates after navigating from Spanish product index to detail
    await page.click('a:has-text("Filtre à café")')
    await expect(page).toHaveURL(`${base}/fr/nos-produits/filtre-cafe-fr`)
    await expect(page.locator('link#i18n-alternate-en-US')).toHaveAttribute('href', `${base}/our-products/coffee-filter-en`)
    // was: $setI18nRouteParams › should use correct slug from $setI18nRouteParams when switching from Spanish to English
    await expect(page.locator('.locale-switcher .en').first()).toHaveAttribute('href', /\/our-products\/coffee-filter-en$/)
    // was: Product detail › should have correct meta tags for Spanish product detail page
    await expectMetaIds(page, base, {
      og: 'fr_FR',
      ogUrl: '/fr/nos-produits/filtre-cafe-fr',
      ogAlt: ['en_US', 'en_US'],
      enHref: '/our-products/coffee-filter-en',
      frHref: '/fr/nos-produits/filtre-cafe-fr',
    })

    // step 5: open /product → served (no error) with the en description (was `status < 400`)
    // was: Product index › should redirect from /product to /our-products for default locale
    const productRes = await request.get('/product', { maxRedirects: 0 })
    expect(productRes.status()).toBe(302)
    expect(productRes.headers().location).toMatch(/\/our-products$/)
    await goto('/product', { waitUntil: 'hydration' })
    await expect(page.getByText(EN_DESCRIPTION)).toBeVisible()
  })

  test('D-T3: SSR detail pages carry locale-specific slugs in alternates', async ({ request }) => {
    // step 1: GET the en detail → fr alternate uses the fr slug; og:locale en_US, og alternate fr_FR
    // was: SSR: hreflang alternates use locale-specific slugs on English product detail
    const en = await request.get('/our-products/coffee-filter-en')
    expect(en.status()).toBe(200)
    const enHtml = await en.text()
    expect(enHtml).toContain('id="i18n-alternate-fr-FR"')
    expect(enHtml).toContain('/fr/nos-produits/filtre-cafe-fr')
    expect(enHtml).not.toContain('/fr/nos-produits/coffee-filter-en')
    expect(enHtml).toMatch(/<meta[^>]*property="og:locale"[^>]*content="en_US"/)
    expect(enHtml).toMatch(/<meta[^>]*property="og:locale:alternate"[^>]*content="fr_FR"/)

    // step 2: GET the fr detail → en alternate uses the en slug; og:locale fr_FR, og alternate en_US
    // was: SSR: hreflang alternates use locale-specific slugs on Spanish product detail
    const es = await request.get('/fr/nos-produits/filtre-cafe-fr')
    expect(es.status()).toBe(200)
    const esHtml = await es.text()
    expect(esHtml).toContain('id="i18n-alternate-en-US"')
    expect(esHtml).toContain('/our-products/coffee-filter-en')
    expect(esHtml).not.toContain('/our-products/filtre-cafe-fr')
    expect(esHtml).toMatch(/<meta[^>]*property="og:locale"[^>]*content="fr_FR"/)
    expect(esHtml).toMatch(/<meta[^>]*property="og:locale:alternate"[^>]*content="en_US"/)
  })
})
