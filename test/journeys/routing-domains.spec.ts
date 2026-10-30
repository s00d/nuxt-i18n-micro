import { describe, expect, test } from '../helpers/guarded-test.ts'
import { alternateOf, canonicalOf, contentOn, onHost, routeDomains } from '../helpers/domains.ts'

const DE = 'example.de'
const COM = 'example.com'

// en lives on example.com, de on example.de, ru on every host; one build answers both
describe('journey: one build, two domains — prefix_except_default', () => {
  test.override({ harness: 'strategy-domains-pec' })

  test('each host has its own default, unprefixed, with its custom paths', async ({ baseURL }) => {
    // step 1: the default of each host at /, the other host's locale is a 404, prefixed form too
    expect(contentOn((await onHost(baseURL, '/', DE)).html)).toBe('de')
    expect(contentOn((await onHost(baseURL, '/', COM)).html)).toBe('en')
    for (const path of ['/en', '/en/contact', '/de', '/de/kontakt']) expect((await onHost(baseURL, path, DE)).status, path).toBe(404)
    for (const path of ['/de', '/de/kontakt', '/en', '/en/contact']) expect((await onHost(baseURL, path, COM)).status, path).toBe(404)

    // step 2: custom path of the host default, unprefixed; the other host's URL moves to it or is no page
    const contact = await onHost(baseURL, '/kontakt', DE)
    expect(contact.status).toBe(200)
    expect(contentOn(contact.html)).toBe('contact')
    expect(contact.html).toMatch(/<html[^>]*lang="de_DE"/)
    const moved = await onHost(baseURL, '/contact', DE)
    expect([moved.status, moved.location]).toEqual([302, '/kontakt'])

    // step 3: ru has no domain: prefixed on both hosts
    expect(contentOn((await onHost(baseURL, '/ru', DE)).html)).toBe('ru')
    expect(contentOn((await onHost(baseURL, '/ru/contact', COM)).html)).toBe('contact')
  })

  test('head: own URLs on the configured origin, other locales on their domains', async ({ baseURL }) => {
    const { html } = await onHost(baseURL, '/kontakt', DE)
    expect(canonicalOf(html)).toBe('https://example.de/kontakt')
    expect(alternateOf(html, 'de_DE')).toBe('https://example.de/kontakt')
    expect(alternateOf(html, 'en_EN')).toBe('https://example.com/contact')
    expect(alternateOf(html, 'ru_RU')).toBe('https://example.de/ru/contact')
    expect(alternateOf((await onHost(baseURL, '/contact', COM)).html, 'de_DE')).toBe('https://example.de/kontakt')
  })

  test('a cookie or Accept-Language cannot pick a locale of another domain', async ({ baseURL }) => {
    // step 1: a foreign preference is no preference
    const cookie = await onHost(baseURL, '/', DE, { cookie: 'user-locale=en' })
    expect([cookie.status, contentOn(cookie.html)]).toEqual([200, 'de'])
    const language = await onHost(baseURL, '/', COM, { 'accept-language': 'de' })
    expect([language.status, contentOn(language.html)]).toEqual([200, 'en'])

    // step 2: a locale the host serves still counts
    const served = await onHost(baseURL, '/', DE, { cookie: 'user-locale=ru' })
    expect([served.status, served.location]).toEqual([302, '/ru'])
  })

  test('an unknown or spoofed host gets the build config and is not reflected', async ({ baseURL }) => {
    // step 1: unknown Host: the build config, build default en, its origin
    const unknown = await onHost(baseURL, '/', 'evil.test')
    expect(contentOn(unknown.html)).toBe('en')
    expect(unknown.html).not.toContain('evil.test')
    expect(canonicalOf(unknown.html)).toBe('https://example.com/')
    expect((await onHost(baseURL, '/de/kontakt', 'evil.test')).status).toBe(200)

    // step 2: X-Forwarded-Host without trustForwardedHost changes nothing
    const spoofed = await onHost(baseURL, '/', 'evil.test', { 'x-forwarded-host': DE })
    expect(contentOn(spoofed.html)).toBe('en')
    const reflected = await onHost(baseURL, '/', 'evil.test', { 'x-forwarded-host': 'evil.example', 'x-forwarded-proto': 'http' })
    expect(reflected.html).not.toContain('evil.example')

    // step 3: case and a default port do not make another host; a request after them still gets its own
    expect(contentOn((await onHost(baseURL, '/', 'EXAMPLE.de:443')).html)).toBe('de')
    expect(contentOn((await onHost(baseURL, '/', 'example.de.evil.test')).html)).toBe('en')
  })

  test('an error page belongs to its host', async ({ baseURL }) => {
    const missing = await onHost(baseURL, '/does-not-exist', DE)
    expect(missing.status).toBe(404)
    expect(missing.html).toMatch(/<html[^>]*lang="de_DE"/)
    const foreign = await onHost(baseURL, '/en/contact', DE)
    expect(foreign.status).toBe(404)
    expect(canonicalOf(foreign.html)).toBe('https://example.de/kontakt')
    expect(foreign.html).toMatch(/<html[^>]*lang="de_DE"/)
  })

  test('browser: hydrates on each domain; links stay in the app; the switcher leaves for the other domain', async ({ page, baseURL }) => {
    await routeDomains(page, baseURL)

    // step 1: example.de hydrates (the guard fails on a mismatch) and client navigation stays relative
    await page.goto('https://example.de/')
    await expect(page.locator('#content')).toHaveText('de')
    await expect(page.locator('#contact')).toHaveAttribute('href', '/kontakt')
    await page.locator('#contact').click()
    await expect(page).toHaveURL('https://example.de/kontakt')
    await expect(page.locator('#content')).toHaveText('contact')

    // step 2: the switcher lists the other domain with an absolute link, and goes there
    await page.locator('.language-switcher').click()
    await expect(page.locator('.switcher-locale-en')).toHaveAttribute('href', 'https://example.com/contact')
    await page.locator('.switcher-locale-en').click()
    await expect(page).toHaveURL('https://example.com/contact')
    await expect(page.locator('#content')).toHaveText('contact')

    // step 3: $switchLocale to a locale of another domain navigates there
    await page.goto('https://example.com/')
    await page.locator('#switch-de').click()
    await expect(page).toHaveURL('https://example.de/')
    await expect(page.locator('#content')).toHaveText('de')

    // step 4: a locale on every host stays in the app
    await page.locator('.language-switcher').click()
    await page.locator('.switcher-locale-ru').click()
    await expect(page).toHaveURL('https://example.de/ru')
    await expect(page.locator('#content')).toHaveText('ru')
  })
})

describe('journey: one build, two domains — prefix', () => {
  test.override({ harness: 'strategy-domains-prefix' })

  test('every URL keeps its prefix; the host picks where / goes', async ({ baseURL }) => {
    const root = await onHost(baseURL, '/', DE)
    expect([root.status, root.location]).toEqual([302, '/de'])
    expect((await onHost(baseURL, '/', COM)).location).toBe('/en')
    expect((await onHost(baseURL, '/kontakt', DE)).location).toBe('/de/kontakt')

    const page = await onHost(baseURL, '/de/kontakt', DE)
    expect(contentOn(page.html)).toBe('contact')
    expect(canonicalOf(page.html)).toBe('https://example.de/de/kontakt')
    // a link lands on the page, not on a redirect
    expect(alternateOf(page.html, 'en_EN')).toBe('https://example.com/en/contact')

    expect((await onHost(baseURL, '/en', DE)).status).toBe(404)
    expect((await onHost(baseURL, '/de', COM)).status).toBe(404)
    expect((await onHost(baseURL, '/', DE, { cookie: 'user-locale=en' })).location).toBe('/de')
    expect((await onHost(baseURL, '/', 'evil.test')).location).toBe('/en')
  })
})

describe('journey: one build, two domains — prefix_and_default', () => {
  test.override({ harness: 'strategy-domains-pad' })

  test('the host default answers in both forms, its links are unprefixed', async ({ baseURL }) => {
    for (const path of ['/', '/de', '/kontakt', '/de/kontakt']) expect((await onHost(baseURL, path, DE)).status, path).toBe(200)
    const page = await onHost(baseURL, '/de/kontakt', DE)
    expect(contentOn(page.html)).toBe('contact')
    expect(canonicalOf(page.html)).toBe('https://example.de/kontakt')
    expect(canonicalOf((await onHost(baseURL, '/kontakt', DE)).html)).toBe('https://example.de/kontakt')
    expect(alternateOf((await onHost(baseURL, '/contact', COM)).html, 'de_DE')).toBe('https://example.de/kontakt')

    expect((await onHost(baseURL, '/en', DE)).status).toBe(404)
    // another host's URL is no duplicate of this one
    expect((await onHost(baseURL, '/kontakt', COM)).status).toBe(404)
    expect(contentOn((await onHost(baseURL, '/', COM)).html)).toBe('en')
  })
})

describe('journey: one build, two domains — no_prefix', () => {
  test.override({ harness: 'strategy-domains-no-prefix' })

  test('the host names the locale; a foreign preference does not', async ({ baseURL }) => {
    expect(contentOn((await onHost(baseURL, '/', DE)).html)).toBe('de')
    expect(contentOn((await onHost(baseURL, '/', COM)).html)).toBe('en')
    expect(contentOn((await onHost(baseURL, '/', DE, { cookie: 'user-locale=en' })).html)).toBe('de')
    expect(contentOn((await onHost(baseURL, '/?locale=en', DE)).html)).toBe('de')
    expect(contentOn((await onHost(baseURL, '/', COM, { 'accept-language': 'de' })).html)).toBe('en')
    expect(contentOn((await onHost(baseURL, '/', DE, { cookie: 'user-locale=ru' })).html)).toBe('ru')

    // a custom path of another domain's locale is no page here
    expect(contentOn((await onHost(baseURL, '/kontakt', DE)).html)).toBe('contact')
    expect((await onHost(baseURL, '/kontakt', COM)).status).toBe(404)
  })

  test('browser: hydrates, and the switcher leaves for the other domain', async ({ page, baseURL }) => {
    await routeDomains(page, baseURL)
    await page.goto('https://example.de/')
    await expect(page.locator('#content')).toHaveText('de')
    await expect(page.locator('.locale-value')).toHaveText('de')
    await page.locator('button[data-locale="en"]').click()
    await expect(page).toHaveURL('https://example.com/')
    await expect(page.locator('#content')).toHaveText('en')
  })
})

describe('journey: one build, two domains — trustForwardedHost', () => {
  test.override({ harness: 'strategy-domains-trust' })

  test('X-Forwarded-Host picks the domain, an unknown one is the build config', async ({ baseURL }) => {
    const forwarded = await onHost(baseURL, '/', 'internal.lan', { 'x-forwarded-host': `${DE}, proxy.lan` })
    expect(contentOn(forwarded.html)).toBe('de')
    expect(canonicalOf(forwarded.html)).toBe('https://example.de')
    const unknown = await onHost(baseURL, '/', DE, { 'x-forwarded-host': 'evil.test' })
    expect(contentOn(unknown.html)).toBe('en')
    expect(unknown.html).not.toContain('evil.test')
  })
})

describe('journey: one build, two domains — runtime overrides', () => {
  test.override({ harness: 'strategy-domains-overrides' })

  test('a domain wins over the runtime default; a disabled locale stays off everywhere', async ({ baseURL }) => {
    // step 1: example.com: its own default, not NUXT_I18N_DEFAULT_LOCALE
    expect((await onHost(baseURL, '/', COM)).location).toBe('/en')
    // step 2: an unknown host: the runtime default
    expect((await onHost(baseURL, '/', 'evil.test')).location).toBe('/ru')
    // step 3: de disabled at runtime: a 404, no hreflang, and its host falls to what it still serves
    expect((await onHost(baseURL, '/de', COM)).status).toBe(404)
    expect(alternateOf((await onHost(baseURL, '/en', COM)).html, 'de_DE')).toBeUndefined()
    expect((await onHost(baseURL, '/', DE)).location).toBe('/ru')
  })
})

describe('journey: one build, two domains — hashMode', () => {
  test.override({ harness: 'strategy-domains-hash' })

  test('the host picks the render; a link to the other domain carries the route in the hash', async ({ page, baseURL }) => {
    expect(contentOn((await onHost(baseURL, '/', DE)).html)).toBe('de')
    expect(contentOn((await onHost(baseURL, '/', COM, { cookie: 'hash-locale=de' })).html)).toBe('en')

    await routeDomains(page, baseURL)
    await page.goto('https://example.de/')
    await expect(page.locator('#content')).toHaveText('de')
    await page.locator('.language-switcher').click()
    await expect(page.locator('.switcher-locale-en')).toHaveAttribute('href', 'https://example.com/#/')
  })
})

describe('journey: one build, two domains — ssr: false', () => {
  test.override({ harness: 'strategy-domains-spa' })

  test('the browser resolves the domain from location.host', async ({ page, baseURL }) => {
    await routeDomains(page, baseURL)
    await page.goto('https://example.de/')
    await expect(page.locator('#content')).toHaveText('de')
    await expect(page.locator('html')).toHaveAttribute('lang', 'de_DE')
    await page.goto('https://example.com/contact')
    await expect(page.locator('#content')).toHaveText('contact')
    await expect(page.locator('.language-switcher')).toBeAttached()
    await expect(page.locator('.switcher-locale-de')).toHaveAttribute('href', 'https://example.de/kontakt')
  })
})

describe('journey: one build, two domains — app.baseURL', () => {
  test.override({ harness: 'strategy-domains-baseurl' })

  test('baseUrl carries app.baseURL: head and links keep it', async ({ baseURL }) => {
    const { html } = await onHost(baseURL, '/shop/kontakt', DE)
    expect(contentOn(html)).toBe('contact')
    expect(canonicalOf(html)).toBe('https://example.de/shop/kontakt')
    expect(alternateOf(html, 'en_EN')).toBe('https://example.com/shop/contact')
    expect((await onHost(baseURL, '/shop/de', DE)).status).toBe(404)
  })
})
