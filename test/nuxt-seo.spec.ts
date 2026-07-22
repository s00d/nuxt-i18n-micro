import { expect, test } from '@nuxt/test-utils/playwright'
import { useSharedFixture } from './setup/shared-host'

test.use({
  nuxt: useSharedFixture('nuxt-seo'),
})

function extractSitemapLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!)
}

function extractHreflangLinks(html: string): Array<{ hreflang: string; href: string }> {
  const links: Array<{ hreflang: string; href: string }> = []
  const regex = /<link[^>]*rel="alternate"[^>]*>/g
  for (const match of html.matchAll(regex)) {
    const tag = match[0]!
    const hreflang = tag.match(/hreflang="([^"]+)"/)?.[1]
    const href = tag.match(/href="([^"]+)"/)?.[1]
    if (hreflang && href) {
      links.push({ hreflang, href })
    }
  }
  return links
}

function extractJsonLd(html: string): unknown[] {
  const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  return scripts.map((match) => JSON.parse(match[1]!))
}

test.describe('@nuxtjs/seo integration (#133)', () => {
  test.setTimeout(process.env.CI ? 120_000 : 60_000)

  test('builds and serves localized pages without plugin dependency error', async ({ page, goto }) => {
    await goto('/en', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/en')
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#hello')).toHaveText('Hello', { timeout: 15_000 })

    await goto('/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
    await expect(page.locator('#locale')).toHaveText('de')
    await expect(page.locator('#hello')).toHaveText('Hallo', { timeout: 15_000 })
  })

  test('client navigation between localized routes works with i18n-link', async ({ page, goto }) => {
    await goto('/en', { waitUntil: 'hydration' })
    await page.click('#about-link')
    await expect(page).toHaveURL('/en/about')
    await expect(page.locator('#about-title')).toHaveText('About EN')

    await page.click('#home-link')
    await expect(page).toHaveURL('/en')
  })

  test('serves robots.txt with sitemap reference', async ({ request }) => {
    const response = await request.get('/robots.txt')

    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toMatch(/User-agent:/i)
    expect(body).toMatch(/Sitemap:/i)
    expect(body).toMatch(/sitemap/i)
  })

  test('serves sitemap index and per-locale sitemaps with localized URLs', async ({ request }) => {
    const indexResponse = await request.get('/sitemap_index.xml')
    expect(indexResponse.status()).toBe(200)
    expect(indexResponse.headers()['content-type']).toMatch(/xml/)

    const indexBody = await indexResponse.text()
    expect(indexBody).toContain('sitemapindex')
    const childSitemapUrls = extractSitemapLocs(indexBody)
    expect(childSitemapUrls.length).toBeGreaterThanOrEqual(2)

    for (const sitemapUrl of childSitemapUrls) {
      const path = new URL(sitemapUrl).pathname
      const localeResponse = await request.get(path)
      expect(localeResponse.status(), `expected 200 for ${path}`).toBe(200)

      const localeBody = await localeResponse.text()
      expect(localeBody).toContain('<urlset')
      const pageUrls = extractSitemapLocs(localeBody)
      expect(pageUrls.length).toBeGreaterThan(0)
      expect(pageUrls.some((url) => url.includes('/en') || url.includes('/de'))).toBe(true)
    }
  })

  test('SSR: micro hreflang and html lang on localized pages', async ({ request }) => {
    const enHtml = await (await request.get('/en/about')).text()
    expect(enHtml).toMatch(/<html[^>]*lang="en-US"/)
    const enAlternates = extractHreflangLinks(enHtml)
    expect(enAlternates.some((link) => link.hreflang === 'en-US')).toBe(true)
    expect(enAlternates.some((link) => link.hreflang === 'de-DE')).toBe(true)
    expect(enAlternates.some((link) => link.hreflang === 'x-default')).toBe(true)

    const deHtml = await (await request.get('/de/about')).text()
    expect(deHtml).toMatch(/<html[^>]*lang="de-DE"/)
  })

  test('SSR: site-config i18n uses translated nuxtSiteConfig per locale', async ({ request }) => {
    const enHtml = await (await request.get('/en/about')).text()
    expect(enHtml).toContain('<title>Site EN</title>')
    expect(enHtml).toMatch(/<meta[^>]*name="description"[^>]*content="English site description"/)

    const deHtml = await (await request.get('/de/about')).text()
    expect(deHtml).toContain('<title>Site DE</title>')
    expect(deHtml).toMatch(/<meta[^>]*name="description"[^>]*content="Deutsche Seitenbeschreibung"/)
  })

  test('SSR: canonical and og:url tags are present on localized pages', async ({ request }) => {
    const html = await (await request.get('/en/about')).text()

    expect(html).toMatch(/<link[^>]*rel="canonical"[^>]*href="[^"]+\/en\/about"/)
    expect(html).toMatch(/<meta[^>]*property="og:url"[^>]*content="[^"]+\/en\/about"/)
    expect(html).toMatch(/<meta[^>]*property="og:locale"[^>]*content="en_US"/)
  })

  test('SSR: schema.org JSON-LD is rendered', async ({ request }) => {
    const html = await (await request.get('/en')).text()
    const jsonLd = extractJsonLd(html)

    expect(jsonLd.length).toBeGreaterThan(0)
    const serialized = JSON.stringify(jsonLd)
    expect(serialized).toMatch(/Organization|WebSite|WebPage/i)
  })

  test('SSR: translated page content per locale', async ({ request }) => {
    const enHtml = await (await request.get('/de/about')).text()
    expect(enHtml).toContain('Über DE')
  })
})
