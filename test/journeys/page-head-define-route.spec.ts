import type { Page } from '@playwright/test'
import { describe, expect, test } from 'untestutils/vitest'

// `define-i18n-route` fixture: pec, en (en_EN) / es (es-ES), meta true.
// /test is restricted to en by $defineI18nRoute; /product has localeRoutes (/our-products, /nuestros-productos)
// and the detail page sets per-locale slugs with $setI18nRouteParams.
const EN_DESCRIPTION = 'Discover our collection of high-quality products designed to meet your needs and exceed your expectations.'
const ES_DESCRIPTION = 'Descubra nuestra colección de productos de alta calidad diseñados para satisfacer sus necesidades y superar sus expectativas.'

const attrs = (page: Page, selector: string, attr: string) =>
  page.locator(selector).evaluateAll((els, a) => els.map((el) => el.getAttribute(a)), attr)

interface MetaIds {
  og: string
  ogUrl: string
  ogAlt: [id: string, content: string]
  enHref: string
  esHref: string
}

async function expectMetaIds(page: Page, base: string, m: MetaIds) {
  await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', m.og)
  await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${base}${m.ogUrl}`)
  await expect(page.locator(`meta#i18n-og-alt-${m.ogAlt[0]}`)).toHaveAttribute('content', m.ogAlt[1])
  await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${base}${m.ogUrl}`)
  await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', `${base}${m.enHref}`)
  await expect(page.locator('link#i18n-alternate-es-ES')).toHaveAttribute('href', `${base}${m.esHref}`)
}

describe('J7 $defineI18nRoute page head', () => {
  test.override({ harness: 'define-i18n-route' })

  test('D-T1: a page restricted to en has en-only alternates and no es route', async ({ page, goto, request, baseURL }) => {
    const base = baseURL!.replace(/\/$/, '')

    // step 1: open /test → en content; hreflangs only en_EN + x-default; canonical, og en_EN, no og alternates
    // was: define-i18n-route › should generate alternates only for specified locales in $defineI18nRoute
    // was: define-i18n-route › should work correctly for default locale without prefix
    await goto('/test', { waitUntil: 'hydration' })
    await expect(page.getByText('test in en')).toBeVisible()
    expect((await attrs(page, 'link[rel="alternate"]', 'hreflang')).sort()).toEqual(['en_EN', 'x-default'])
    // was: define-i18n-route › should generate correct canonical URL for restricted locale page
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/test$/)
    // was: define-i18n-route › should generate correct og:locale meta for restricted locale page
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_EN')
    // was: define-i18n-route › should generate correct og:locale:alternate meta only for specified locales
    await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveCount(0)
    // was: define-i18n-route › should generate x-default hreflang pointing to the default locale URL
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', `${base}/test`)

    // step 2: GET /test (SSR HTML) → no es hreflang or og alternate, en_EN and x-default present
    // was: define-i18n-route › should not generate alternates for non-specified locales in build output
    const html = await (await request.get('/test')).text()
    expect(html).not.toContain('hreflang="es"')
    expect(html).not.toContain('hreflang="es-ES"')
    expect(html).not.toContain('og:locale:alternate" content="es-ES"')
    expect(html).toContain('hreflang="en_EN"')
    expect(html).not.toContain('hreflang="en"')
    expect(html).toContain('hreflang="x-default"')

    // step 3: GET /es/test → 404 (was `>= 400`)
    // was: define-i18n-route › should return 404 for non-specified locale when accessing directly
    expect((await request.get('/es/test', { maxRedirects: 0 })).status()).toBe(404)
  })

  test('D-T2: product index and detail in both locales, with SPA navigation', async ({ page, goto, request, baseURL }) => {
    const base = baseURL!.replace(/\/$/, '')

    // step 1: open /our-products → en texts, switcher es link, product link, meta ids, iso hreflangs
    // was: define-i18n-route › Product index › should be accessible via localized routes
    // was: define-i18n-route › Product index › should display correct translations for English locale
    await goto('/our-products', { waitUntil: 'hydration' })
    await expect(page.getByText(EN_DESCRIPTION)).toBeVisible()
    await expect(page.getByText('Coffee Filter')).toBeVisible()
    await expect(page.getByText('$18.00')).toBeVisible()
    // was: define-i18n-route › Product index › should have correct locale switcher links
    await expect(page.locator('.locale-switcher .es')).toHaveAttribute('href', /\/es\/nuestros-productos/)
    // was: define-i18n-route › Product index › should have correct product links
    await expect(page.locator('a:has-text("Coffee Filter")').first()).toHaveAttribute('href', /\/our-products\/coffee-filter-en/)
    // was: define-i18n-route › Product index › should have correct meta tags for English product page
    // was: define-i18n-route › Product index › should have correct canonical URL for English page
    await expectMetaIds(page, base, {
      og: 'en_EN',
      ogUrl: '/our-products',
      ogAlt: ['es_ES', 'es_ES'],
      enHref: '/our-products',
      esHref: '/es/nuestros-productos',
    })
    // was: define-i18n-route › Product index › should have correct alternate links
    const indexHreflangs = await attrs(page, 'link[rel="alternate"]', 'hreflang')
    expect(indexHreflangs).toContain('en_EN')
    expect(indexHreflangs).toContain('es-ES')
    expect(indexHreflangs).not.toContain('en')
    expect(indexHreflangs).not.toContain('es')

    // step 2: click Coffee Filter → SPA detail; es alternate and switcher use the es slug; detail meta ids
    // was: define-i18n-route › SPA meta timing › client SPA: meta hreflang updates after navigating from English product index to detail
    await page.click('a:has-text("Coffee Filter")')
    await expect(page).toHaveURL(`${base}/our-products/coffee-filter-en`)
    await expect(page.locator('link#i18n-alternate-es-ES')).toHaveAttribute('href', `${base}/es/nuestros-productos/filtro-cafe-es`)
    // was: $setI18nRouteParams › should use correct slug from $setI18nRouteParams when switching from English to Spanish
    await expect(page.locator('.locale-switcher .es').first()).toHaveAttribute('href', /\/es\/nuestros-productos\/filtro-cafe-es$/)
    // was: Product detail › should have correct meta tags for English product detail page
    await expectMetaIds(page, base, {
      og: 'en_EN',
      ogUrl: '/our-products/coffee-filter-en',
      ogAlt: ['es_ES', 'es_ES'],
      enHref: '/our-products/coffee-filter-en',
      esHref: '/es/nuestros-productos/filtro-cafe-es',
    })

    // step 3: open /es/nuestros-productos → es texts, switcher en link, es product link, meta ids
    // was: Product index › should display correct translations for Spanish locale
    await goto('/es/nuestros-productos', { waitUntil: 'hydration' })
    await expect(page.getByText(ES_DESCRIPTION)).toBeVisible()
    await expect(page.getByText('Filtro de Café')).toBeVisible()
    await expect(page.getByText('18,00 €')).toBeVisible()
    await expect(page.locator('.locale-switcher .en')).toHaveAttribute('href', /\/our-products/)
    // was: Product index › should have correct product links for Spanish locale
    await expect(page.locator('a:has-text("Filtro de Café")').first()).toHaveAttribute('href', /\/es\/nuestros-productos\/filtro-cafe-es/)
    // was: Product index › should have correct meta tags for Spanish product page
    // was: Product index › should have correct canonical URL for Spanish page
    await expectMetaIds(page, base, {
      og: 'es_ES',
      ogUrl: '/es/nuestros-productos',
      ogAlt: ['en_EN', 'en_EN'],
      enHref: '/our-products',
      esHref: '/es/nuestros-productos',
    })

    // step 4: click Filtro de Café → SPA es detail; en alternate and switcher use the en slug; detail meta ids
    // was: SPA meta timing › client SPA: meta hreflang updates after navigating from Spanish product index to detail
    await page.click('a:has-text("Filtro de Café")')
    await expect(page).toHaveURL(`${base}/es/nuestros-productos/filtro-cafe-es`)
    await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', `${base}/our-products/coffee-filter-en`)
    // was: $setI18nRouteParams › should use correct slug from $setI18nRouteParams when switching from Spanish to English
    await expect(page.locator('.locale-switcher .en').first()).toHaveAttribute('href', /\/our-products\/coffee-filter-en$/)
    // was: Product detail › should have correct meta tags for Spanish product detail page
    await expectMetaIds(page, base, {
      og: 'es_ES',
      ogUrl: '/es/nuestros-productos/filtro-cafe-es',
      ogAlt: ['en_EN', 'en_EN'],
      enHref: '/our-products/coffee-filter-en',
      esHref: '/es/nuestros-productos/filtro-cafe-es',
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
    // step 1: GET the en detail → es alternate uses the es slug; og:locale en_EN, og alternate es_ES
    // was: SSR: hreflang alternates use locale-specific slugs on English product detail
    const en = await request.get('/our-products/coffee-filter-en')
    expect(en.status()).toBe(200)
    const enHtml = await en.text()
    expect(enHtml).toContain('id="i18n-alternate-es-ES"')
    expect(enHtml).toContain('/es/nuestros-productos/filtro-cafe-es')
    expect(enHtml).not.toContain('/es/nuestros-productos/coffee-filter-en')
    expect(enHtml).toMatch(/<meta[^>]*property="og:locale"[^>]*content="en_EN"/)
    expect(enHtml).toMatch(/<meta[^>]*property="og:locale:alternate"[^>]*content="es_ES"/)

    // step 2: GET the es detail → en alternate uses the en slug; og:locale es_ES, og alternate en_EN
    // was: SSR: hreflang alternates use locale-specific slugs on Spanish product detail
    const es = await request.get('/es/nuestros-productos/filtro-cafe-es')
    expect(es.status()).toBe(200)
    const esHtml = await es.text()
    expect(esHtml).toContain('id="i18n-alternate-en_EN"')
    expect(esHtml).toContain('/our-products/coffee-filter-en')
    expect(esHtml).not.toContain('/our-products/filtro-cafe-es')
    expect(esHtml).toMatch(/<meta[^>]*property="og:locale"[^>]*content="es_ES"/)
    expect(esHtml).toMatch(/<meta[^>]*property="og:locale:alternate"[^>]*content="en_EN"/)
  })
})
