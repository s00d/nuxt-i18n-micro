import { extractJsonLd, extractSitemapLocs, parseSeoHead } from 'untestutils/utils'
import { describe, expect, test } from 'untestutils/vitest'

describe('J9 integrations: @nuxtjs/seo (#133)', () => {
  test.override({ harness: 'nuxt-seo' })

  test('browser: localized pages and i18n-link navigation', async ({ page, goto }) => {
    // step 1: open /en and /de → locale and hello per locale
    // was: nuxt-seo › builds and serves localized pages without plugin dependency error
    await goto('/en', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/en')
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#hello')).toHaveText('Hello')
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
    await expect(page.locator('#locale')).toHaveText('de')
    await expect(page.locator('#hello')).toHaveText('Hallo')

    // step 2: /en → #about-link → /en/about → #home-link → /en
    // was: nuxt-seo › client navigation between localized routes works with i18n-link
    await goto('/en', { waitUntil: 'hydration' })
    await page.click('#about-link')
    await expect(page).toHaveURL('/en/about')
    await expect(page.locator('#about-title')).toHaveText('About EN')
    await page.click('#home-link')
    await expect(page).toHaveURL('/en')
  })

  test('SSR: robots, sitemaps, site config, canonical, JSON-LD', async ({ request }) => {
    // step 1: GET /robots.txt → user-agent and sitemap reference
    // was: nuxt-seo › serves robots.txt with sitemap reference
    const robots = await request.get('/robots.txt')
    expect(robots.status()).toBe(200)
    const robotsBody = await robots.text()
    expect(robotsBody).toMatch(/User-agent:/i)
    expect(robotsBody).toMatch(/Sitemap:/i)

    // step 2: GET /sitemap_index.xml and each child → localized URLs
    // was: nuxt-seo › serves sitemap index and per-locale sitemaps with localized URLs
    const index = await request.get('/sitemap_index.xml')
    expect(index.status()).toBe(200)
    expect(index.headers()['content-type']).toMatch(/xml/)
    const indexBody = await index.text()
    expect(indexBody).toContain('sitemapindex')
    const children = extractSitemapLocs(indexBody)
    expect(children.length).toBeGreaterThanOrEqual(2)
    for (const url of children) {
      const path = new URL(url).pathname
      const child = await request.get(path)
      expect(child.status(), `expected 200 for ${path}`).toBe(200)
      const body = await child.text()
      expect(body).toContain('<urlset')
      const locs = extractSitemapLocs(body)
      expect(locs.length).toBeGreaterThan(0)
      expect(locs.some((loc) => loc.includes('/en') || loc.includes('/de'))).toBe(true)
    }

    // step 3: GET /en/about → html lang, hreflangs on site.url, translated title and description
    // was: nuxt-seo › SSR: micro hreflang and html lang; › SSR: site-config i18n uses translated nuxtSiteConfig per locale
    const enHtml = await (await request.get('/en/about')).text()
    expect(enHtml).toMatch(/<html[^>]*lang="en-US"/)
    const alternates = parseSeoHead(enHtml).hreflangs
    expect(alternates.some((link) => link.hreflang === 'en-US' && link.href.startsWith('https://example.com/'))).toBe(true)
    expect(alternates.some((link) => link.hreflang === 'de-DE' && link.href.startsWith('https://example.com/'))).toBe(true)
    expect(alternates.some((link) => link.hreflang === 'x-default')).toBe(true)
    expect(enHtml).toContain('<title>Site EN</title>')
    expect(enHtml).toMatch(/<meta[^>]*name="description"[^>]*content="English site description"/)

    // step 4: same page → canonical and og:url from site.url (#240), og:locale en_US
    // was: nuxt-seo › SSR: canonical and og:url use site.url when metaBaseUrl is unset (#240); › canonical and og:url tags are present
    expect(enHtml).toMatch(/<link[^>]*rel="canonical"[^>]*href="https:\/\/example\.com\/en\/about"/)
    expect(enHtml).toMatch(/<meta[^>]*property="og:url"[^>]*content="https:\/\/example\.com\/en\/about"/)
    expect(enHtml).toMatch(/<meta[^>]*property="og:locale"[^>]*content="en_US"/)

    // step 5: GET /de/about → de lang, site title, description, page content
    // was: nuxt-seo › SSR: translated page content per locale
    const deHtml = await (await request.get('/de/about')).text()
    expect(deHtml).toMatch(/<html[^>]*lang="de-DE"/)
    expect(deHtml).toContain('<title>Site DE</title>')
    expect(deHtml).toMatch(/<meta[^>]*name="description"[^>]*content="Deutsche Seitenbeschreibung"/)
    expect(deHtml).toContain('Über DE')

    // step 6: GET /en → schema.org JSON-LD
    // was: nuxt-seo › SSR: schema.org JSON-LD is rendered
    const jsonLd = extractJsonLd(await (await request.get('/en')).text())
    expect(jsonLd.length).toBeGreaterThan(0)
    expect(JSON.stringify(jsonLd)).toMatch(/Organization|WebSite|WebPage/i)
  })
})
