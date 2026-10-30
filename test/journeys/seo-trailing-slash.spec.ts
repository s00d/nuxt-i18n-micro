import { describe, expect, test } from 'untestutils/vitest'

// `seo` fixture rebuilt with `i18n.trailingSlash: 'append'` (trailingSlash is global, so a second recipe).
const pathOf = async (locator: { getAttribute: (name: string) => Promise<string | null> }, attr: string) =>
  new URL((await locator.getAttribute(attr))!).pathname

describe('J6 seo trailing slash', () => {
  test.override({ harness: 'seo-trailing-slash' })

  test('TS-T1: links and head keep the appended slash', async ({ page, goto }) => {
    // step 1: open /en → i18n-link hrefs end in /; canonical, og:url, alternate en and x-default are /en/
    // was: seo-trailing-slash › $localePath / i18n-link honor trailingSlash append
    await goto('/en', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#contact')).toHaveAttribute('href', '/en/contact/')
    await expect(page.locator('#about')).toHaveAttribute('href', '/en/about/')
    // was: seo-trailing-slash › locale home canonical/og:url keep trailing slash after absolute join
    expect(await pathOf(page.locator('link[rel="canonical"]'), 'href')).toBe('/en/')
    expect(await pathOf(page.locator('meta[property="og:url"]'), 'content')).toBe('/en/')
    expect(await pathOf(page.locator('link[rel="alternate"][hreflang="en_EN"]'), 'href')).toBe('/en/')
    expect(await pathOf(page.locator('link[rel="alternate"][hreflang="x-default"]'), 'href')).toBe('/en/')

    // step 2: open /en/about → canonical, og:url and alternate en are /en/about/; alternate de ends in /a-propos/
    // was: seo-trailing-slash › canonical, og:url and hreflang keep NuxtLink trailing slashes
    await goto('/en/about', { waitUntil: 'domcontentloaded' })
    expect(await pathOf(page.locator('link[rel="canonical"]'), 'href')).toBe('/en/about/')
    expect(await pathOf(page.locator('meta[property="og:url"]'), 'content')).toBe('/en/about/')
    expect(await pathOf(page.locator('link[rel="alternate"][hreflang="en_EN"]'), 'href')).toBe('/en/about/')
    expect(await pathOf(page.locator('link[rel="alternate"][hreflang="de_DE"]'), 'href')).toMatch(/\/a-propos\/$/)
  })
})
