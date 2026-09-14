import { fileURLToPath } from 'node:url'
import { describe, expect, setupE2E, test } from './setup/vitest-e2e'

await setupE2E({
  rootDir: fileURLToPath(new URL('./fixtures/seo', import.meta.url)),
  nuxtConfig: {
    i18n: {
      trailingSlash: 'append',
    },
  },
})

describe('SEO trailing slash (i18n.trailingSlash: append)', () => {
  test('canonical, og:url and hreflang keep NuxtLink trailing slashes', async ({ page, goto }) => {
    // Route table is slashless; helpers still emit append-style URLs for SEO/links.
    await goto('/en/about', { waitUntil: 'domcontentloaded' })

    const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
    const ogUrlContent = await page.locator('meta[property="og:url"]').getAttribute('content')
    const alternateEn = await page.locator('link[rel="alternate"][hreflang="en_EN"]').getAttribute('href')
    const alternateDe = await page.locator('link[rel="alternate"][hreflang="de_DE"]').getAttribute('href')

    expect(new URL(canonicalHref!).pathname).toBe('/en/about/')
    expect(new URL(ogUrlContent!).pathname).toBe('/en/about/')
    expect(new URL(alternateEn!).pathname).toBe('/en/about/')
    expect(new URL(alternateDe!).pathname).toMatch(/\/a-propos\/$/)
  })

  test('$localePath / i18n-link honor trailingSlash append', async ({ page, goto }) => {
    await goto('/en', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('#contact')).toHaveAttribute('href', '/en/contact/')
    await expect(page.locator('#about')).toHaveAttribute('href', '/en/about/')
  })

  test('locale home canonical/og:url keep trailing slash after absolute join', async ({ page, goto }) => {
    await goto('/en', { waitUntil: 'domcontentloaded' })

    const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
    const ogUrlContent = await page.locator('meta[property="og:url"]').getAttribute('content')
    const alternateEn = await page.locator('link[rel="alternate"][hreflang="en_EN"]').getAttribute('href')
    const xDefault = await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute('href')

    expect(new URL(canonicalHref!).pathname).toBe('/en/')
    expect(new URL(ogUrlContent!).pathname).toBe('/en/')
    expect(new URL(alternateEn!).pathname).toBe('/en/')
    expect(new URL(xDefault!).pathname).toBe('/en/')
  })
})
