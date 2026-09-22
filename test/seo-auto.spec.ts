import { emulateDomain, forwardedHostHeaders, parseSeoHead } from 'untestutils/utils'
import { describe, expect, test } from 'untestutils/vitest'

describe('SEO with dynamic metaBaseUrl (undefined)', () => {
  test.override({ harness: 'seo-auto' })

  // ── SSR: raw HTTP responses (no browser) ──

  test('SSR: canonical and og:url use domain from X-Forwarded-Host', async ({ request }) => {
    const res = await request.get('/en', {
      headers: forwardedHostHeaders('example.com', 'https'),
    })
    expect(res.status()).toBe(200)
    const head = parseSeoHead(await res.text())

    expect(head.canonical).toBe('https://example.com/en')
    expect(head.ogUrl).toBe('https://example.com/en')
  })

  test('SSR: two different domains produce different canonical for the same path', async ({ request }) => {
    const res1 = await request.get('/en/about', {
      headers: forwardedHostHeaders('site-a.example.com', 'https'),
    })
    const head1 = parseSeoHead(await res1.text())
    expect(head1.canonical).toBe('https://site-a.example.com/en/about')
    expect(head1.ogUrl).toBe('https://site-a.example.com/en/about')

    const res2 = await request.get('/en/about', {
      headers: forwardedHostHeaders('site-b.example.com', 'https'),
    })
    const head2 = parseSeoHead(await res2.text())
    expect(head2.canonical).toBe('https://site-b.example.com/en/about')
    expect(head2.ogUrl).toBe('https://site-b.example.com/en/about')
  })

  test('SSR: alternate hreflang links use the forwarded domain', async ({ request }) => {
    const res = await request.get('/en/about', {
      headers: forwardedHostHeaders('multi.example.org', 'https'),
    })
    const hrefs = parseSeoHead(await res.text()).hreflangs.map((l) => l.href)
    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) {
      expect(href).toContain('https://multi.example.org/')
      // Catch literal broken host/path tokens leaking into alternates (full HTML used to scan for "auto")
      expect(href).not.toMatch(/(^|\/)auto(\/|$)/)
    }
  })

  test('SSR: x-default hreflang link points to default locale URL', async ({ request }) => {
    const res = await request.get('/en/about', {
      headers: forwardedHostHeaders('example.com', 'https'),
    })
    const html = await res.text()

    const xdHref = html.match(/<link[^>]*id="i18n-xd"[^>]*href="([^"]+)"/)?.[1]
    expect(xdHref).toBe('https://example.com/en/about')
  })

  test('SSR: x-default hreflang uses forwarded domain', async ({ request }) => {
    const res = await request.get('/de', {
      headers: forwardedHostHeaders('multi.example.org', 'https'),
    })
    const html = await res.text()

    const xdHref = html.match(/<link[^>]*id="i18n-xd"[^>]*href="([^"]+)"/)?.[1]
    expect(xdHref).toBe('https://multi.example.org/en')
  })

  test('SSR: og:locale and html lang are correct for a non-default locale', async ({ request }) => {
    const res = await request.get('/de', {
      headers: forwardedHostHeaders('example.com', 'https'),
    })
    const html = await res.text()
    const head = parseSeoHead(html)

    expect(html).toMatch(/<html[^>]*lang="de_DE"/)
    expect(head.ogLocale).toBe('de_DE')
  })

  test('SSR: without X-Forwarded-Host falls back to actual server host', async ({ request }) => {
    const res = await request.get('/en')
    const html = await res.text()

    expect(html).not.toMatch(/href="auto/)
    expect(html).not.toMatch(/content="auto/)
    expect(html).toMatch(/<link[^>]*rel="canonical"[^>]*href="http:\/\/(localhost|127\.0\.0\.1):\d+\/en"/)
  })

  // ── Client: emulate a real domain in the browser ──

  test('client: after hydration canonical and og:url use emulated domain', async ({ page, baseURL }) => {
    const domain = 'http://my-app.example.com'
    await emulateDomain(page, domain, baseURL!)

    await page.goto(`${domain}/en`, { waitUntil: 'networkidle' })

    // Browser must believe it is on the emulated origin
    const origin = await page.evaluate(() => window.location.origin)
    expect(origin).toBe(domain)

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBe(`${domain}/en`)

    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content')
    expect(ogUrl).toBe(`${domain}/en`)
  })

  test('client: alternate hreflang links use emulated domain', async ({ page, baseURL }) => {
    const domain = 'https://shop.example.com'
    await emulateDomain(page, domain, baseURL!)

    await page.goto(`${domain}/en/about`, { waitUntil: 'networkidle' })

    const links = page.locator('link[rel="alternate"]')
    const count = await links.count()
    expect(count).toBeGreaterThan(0)

    const hrefs = await Promise.all(Array.from({ length: count }, (_, i) => links.nth(i).getAttribute('href')))
    for (const href of hrefs) {
      expect(href).toBeTruthy()
      expect(href!.startsWith(`${domain}/`)).toBe(true)
    }
  })

  test('client: x-default hreflang link uses emulated domain and points to default locale', async ({ page, baseURL }) => {
    const domain = 'https://xd-test.example.com'
    await emulateDomain(page, domain, baseURL!)

    await page.goto(`${domain}/de/about`, { waitUntil: 'networkidle' })

    const xDefault = page.locator('link[hreflang="x-default"]')
    await expect(xDefault).toHaveAttribute('href', `${domain}/en/about`)
  })

  test('client: canonical updates to correct path after SPA navigation', async ({ page, baseURL }) => {
    const domain = 'http://spa-test.example.com'
    await emulateDomain(page, domain, baseURL!)

    await page.goto(`${domain}/en`, { waitUntil: 'networkidle' })

    // Before navigation
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBe(`${domain}/en`)

    // SPA navigate to /en/about
    await page.click('#about')
    await page.waitForURL('**/en/about')

    // After navigation — path changes, origin stays the same (poll: head may lag URL)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${domain}/en/about`)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${domain}/en/about`)
  })

  test('client: locale switch updates og:locale and keeps emulated domain in canonical', async ({ page, baseURL }) => {
    const domain = 'https://i18n.example.com'
    await emulateDomain(page, domain, baseURL!)

    await page.goto(`${domain}/en`, { waitUntil: 'networkidle' })

    let ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
    expect(ogLocale).toBe('en_EN')
    let canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBe(`${domain}/en`)

    // Navigate to German locale
    await page.goto(`${domain}/de`, { waitUntil: 'networkidle' })

    ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
    expect(ogLocale).toBe('de_DE')
    canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBe(`${domain}/de`)
  })

  test('client: html lang and dir update on locale change with emulated domain', async ({ page, baseURL }) => {
    const domain = 'http://lang-test.example.com'
    await emulateDomain(page, domain, baseURL!)

    await page.goto(`${domain}/en`, { waitUntil: 'networkidle' })
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'en_EN')
    await expect(html).toHaveAttribute('dir', 'auto')

    await page.goto(`${domain}/de`, { waitUntil: 'networkidle' })
    await expect(html).toHaveAttribute('lang', 'de_DE')

    await page.goto(`${domain}/ru`, { waitUntil: 'networkidle' })
    await expect(html).toHaveAttribute('lang', 'ru_RU')
  })
})
