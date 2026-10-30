import { emulateDomain, forwardedHostHeaders, parseSeoHead } from 'untestutils/utils'
import { describe, expect, test } from '../helpers/guarded-test.ts'

// `seo` fixture: prefix, en/de/ru (ru seo:false) + fr/ar/zh (og:locale formats), no metaBaseUrl (host from the request),
// canonicalQueryWhitelist [page, filter, q]. Absorbs the old `seo-auto` and `canonical-whitelist` builds.
const xDefaultHref = (html: string) => html.match(/<link[^>]*id="i18n-xd"[^>]*href="([^"]+)"/)?.[1]

describe('J6 seo head', () => {
  test.override({ harness: 'seo' })

  test('S-T1: SSR head follows the forwarded host and the query whitelist', async ({ request }) => {
    // step 1: GET /en on example.com → canonical and og:url on that domain
    // was: seo-auto › SSR: canonical and og:url use domain from X-Forwarded-Host
    const en = await request.get('/en', { headers: forwardedHostHeaders('example.com', 'https') })
    expect(en.status()).toBe(200)
    const enHead = parseSeoHead(await en.text())
    expect(enHead.canonical).toBe('https://example.com/en')
    expect(enHead.ogUrl).toBe('https://example.com/en')

    // step 2: GET /en/about on site-a, then site-b → each canonical and og:url on its own domain
    // was: seo-auto › SSR: two different domains produce different canonical for the same path
    for (const host of ['site-a.example.com', 'site-b.example.com']) {
      const head = parseSeoHead(await (await request.get('/en/about', { headers: forwardedHostHeaders(host, 'https') })).text())
      expect(head.canonical).toBe(`https://${host}/en/about`)
      expect(head.ogUrl).toBe(`https://${host}/en/about`)
    }

    // step 3: GET /en/about on multi.example.org → every hreflang on that domain, no `auto` token
    // was: seo-auto › SSR: alternate hreflang links use the forwarded domain
    const multiAbout = parseSeoHead(await (await request.get('/en/about', { headers: forwardedHostHeaders('multi.example.org', 'https') })).text())
    expect(multiAbout.hreflangs.map((l) => l.hreflang).sort()).toEqual(['ar-AE', 'de_DE', 'en_EN', 'fr-FR', 'x-default', 'zh-Hans'])
    for (const { href } of multiAbout.hreflangs) {
      expect(href).toContain('https://multi.example.org/')
      expect(href).not.toMatch(/(^|\/)auto(\/|$)/)
    }

    // step 4: x-default on /en/about and on /de (multi) → default-locale URL; /de html lang + og:locale de_DE
    // was: seo-auto › SSR: x-default hreflang link points to default locale URL
    expect(xDefaultHref(await (await request.get('/en/about', { headers: forwardedHostHeaders('example.com', 'https') })).text())).toBe(
      'https://example.com/en/about',
    )
    // was: seo-auto › SSR: x-default hreflang uses forwarded domain
    expect(xDefaultHref(await (await request.get('/de', { headers: forwardedHostHeaders('multi.example.org', 'https') })).text())).toBe(
      'https://multi.example.org/en',
    )
    // was: seo-auto › SSR: og:locale and html lang are correct for a non-default locale
    const deHtml = await (await request.get('/de', { headers: forwardedHostHeaders('example.com', 'https') })).text()
    expect(deHtml).toMatch(/<html[^>]*lang="de_DE"/)
    expect(parseSeoHead(deHtml).ogLocale).toBe('de_DE')

    // step 5: GET /en without a forwarded host → the real server host, no literal `auto`
    // was: seo-auto › SSR: without X-Forwarded-Host falls back to actual server host
    const plain = await (await request.get('/en')).text()
    expect(plain).not.toMatch(/href="auto/)
    expect(plain).not.toMatch(/content="auto/)
    expect(plain).toMatch(/<link[^>]*rel="canonical"[^>]*href="http:\/\/(localhost|127\.0\.0\.1):\d+\/en"/)

    // step 6: GET /en/contact with default-list params → only page and q survive (whitelist replaces the defaults)
    // was: seo › should include only whitelisted query params in canonical and og:url
    // was: canonical-query-whitelist › replaces defaults instead of merging arrays
    const contact = await request.get('/en/contact?sort=latest&search=boots&page=2&q=hello&query=test&tag=sale&foo=ignore')
    expect(contact.status()).toBe(200)
    const contactHtml = await contact.text()
    const contactHead = parseSeoHead(contactHtml)
    expect(contactHead.canonical).toBe(contactHead.ogUrl)
    const urls = {
      canonical: contactHead.canonical!,
      en: contactHead.hreflangs.find((l) => l.hreflang === 'en_EN')!.href,
      de: contactHead.hreflangs.find((l) => l.hreflang === 'de_DE')!.href,
      xd: xDefaultHref(contactHtml)!,
    }
    const pathnames = { canonical: '/en/contact', en: '/en/contact', de: '/de/kontakt', xd: '/en/contact' }
    for (const [key, href] of Object.entries(urls)) {
      const url = new URL(href.replaceAll('&amp;', '&'))
      expect(url.pathname).toBe(pathnames[key as keyof typeof pathnames])
      expect([...url.searchParams.entries()].sort()).toEqual([
        ['page', '2'],
        ['q', 'hello'],
      ])
    }
  })

  test('S-T2: browser head, then an emulated domain with SPA navigation and locale changes', async ({ page, goto, baseURL }) => {
    // step 1: open /de/kontakt → html lang de_DE, dir auto, canonical on the localized path, content rendered
    // was: seo › should render html lang and dir attributes correctly
    // was: seo › should support locale path override with $defineI18nRoute
    await goto('/de/kontakt', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('html')).toHaveAttribute('lang', 'de_DE')
    await expect(page.locator('html')).toHaveAttribute('dir', 'auto')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/de\/kontakt$/)
    await expect(page.locator('#content')).not.toBeEmpty()

    // step 2: open /en/contact → og:locale en_EN; og alternates have de_DE but not ru_RU (seo:false)
    // was: seo › should render og:locale and og:locale:alternate metas
    await goto('/en/contact', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_EN')
    const ogAlternates = await page.locator('meta[property="og:locale:alternate"]').evaluateAll((els) => els.map((el) => el.getAttribute('content')))
    expect(ogAlternates).toContain('de_DE')
    expect(ogAlternates).not.toContain('ru_RU')

    // step 3: open /en/about → hreflangs are iso codes, ru is left out
    // was: seo › should generate alternate hreflang links for other locales
    await goto('/en/about', { waitUntil: 'domcontentloaded' })
    const hreflangs = await page.locator('link[rel="alternate"]').evaluateAll((els) => els.map((el) => el.getAttribute('hreflang')))
    expect(hreflangs).toContain('en_EN')
    expect(hreflangs).toContain('de_DE')
    for (const bare of ['en', 'de', 'ru', 'ru_RU']) expect(hreflangs).not.toContain(bare)

    // step 4: emulate shop.example.com and open /en → the browser is on that origin; canonical and og:url use it
    // was: seo-auto › client: after hydration canonical and og:url use emulated domain
    const domain = 'https://shop.example.com'
    await emulateDomain(page, domain, baseURL!)
    await goto(`${domain}/en`, { waitUntil: 'hydration' })
    expect(await page.evaluate(() => window.location.origin)).toBe(domain)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${domain}/en`)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${domain}/en`)

    // step 5: click #about → SPA navigation; canonical and og:url follow the new path on the same origin
    // was: seo-auto › client: canonical updates to correct path after SPA navigation
    await page.click('#about')
    await expect(page).toHaveURL(`${domain}/en/about`)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${domain}/en/about`)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${domain}/en/about`)

    // step 6: every alternate link starts with the emulated domain
    // was: seo-auto › client: alternate hreflang links use emulated domain
    await expect(page.locator('link[rel="alternate"]')).toHaveCount(6)
    const alternateHrefs = await page.locator('link[rel="alternate"]').evaluateAll((els) => els.map((el) => el.getAttribute('href')))
    for (const href of alternateHrefs) expect(href!.startsWith(`${domain}/`)).toBe(true)

    // step 7: open /de/a-propos → x-default points at the default-locale page on the domain
    // was: seo-auto › client: x-default hreflang link uses emulated domain and points to default locale
    await goto(`${domain}/de/a-propos`, { waitUntil: 'hydration' })
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', `${domain}/en/about`)

    // step 8: open /en, /de, /ru → og:locale, canonical and html lang/dir follow the locale
    // was: seo-auto › client: locale switch updates og:locale and keeps emulated domain in canonical
    // was: seo-auto › client: html lang and dir update on locale change with emulated domain
    await goto(`${domain}/en`, { waitUntil: 'hydration' })
    await expect(page.locator('html')).toHaveAttribute('lang', 'en_EN')
    await expect(page.locator('html')).toHaveAttribute('dir', 'auto')
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_EN')
    await goto(`${domain}/de`, { waitUntil: 'hydration' })
    await expect(page.locator('html')).toHaveAttribute('lang', 'de_DE')
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'de_DE')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${domain}/de`)
    await goto(`${domain}/ru`, { waitUntil: 'hydration' })
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru_RU')
    // in-flight emulated requests would reject with "Route is already handled" when the page closes
    await page.unrouteAll({ behavior: 'ignoreErrors' })
  })
})
