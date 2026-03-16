import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/canonical-whitelist', import.meta.url)),
    nuxtConfig: {
      i18n: {
        canonicalQueryWhitelist: ['page'],
      },
    },
  },
})

test.describe('canonicalQueryWhitelist override', () => {
  test('replaces defaults instead of merging arrays', async ({ page, goto }) => {
    await goto('/en/contact?sort=latest&search=boots&page=2&q=hello&query=test&tag=sale', { waitUntil: 'domcontentloaded' })

    const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
    const ogUrlContent = await page.locator('meta[property="og:url"]').getAttribute('content')
    const alternateEnHref = await page.locator('link#i18n-alternate-en').getAttribute('href')
    const alternateDeHref = await page.locator('link#i18n-alternate-de').getAttribute('href')
    const xDefaultHref = await page.locator('link#i18n-xd').getAttribute('href')

    const canonicalURL = new URL(canonicalHref!)
    const ogURL = new URL(ogUrlContent!)
    const alternateEnURL = new URL(alternateEnHref!)
    const alternateDeURL = new URL(alternateDeHref!)
    const xDefaultURL = new URL(xDefaultHref!)

    expect(canonicalURL.pathname).toBe('/en/contact')
    expect(canonicalURL.searchParams.get('page')).toBe('2')
    expect(canonicalURL.searchParams.get('sort')).toBeNull()
    expect(canonicalURL.searchParams.get('filter')).toBeNull()
    expect(canonicalURL.searchParams.get('search')).toBeNull()
    expect(canonicalURL.searchParams.get('q')).toBeNull()
    expect(canonicalURL.searchParams.get('query')).toBeNull()
    expect(canonicalURL.searchParams.get('tag')).toBeNull()
    expect(canonicalURL.toString()).toBe(ogURL.toString())

    expect(alternateEnURL.pathname).toBe('/en/contact')
    expect(alternateDeURL.pathname).toBe('/de/contact')
    expect(xDefaultURL.pathname).toBe('/en/contact')

    expect(alternateEnURL.searchParams.get('page')).toBe('2')
    expect(alternateDeURL.searchParams.get('page')).toBe('2')
    expect(xDefaultURL.searchParams.get('page')).toBe('2')

    expect(alternateEnURL.searchParams.get('sort')).toBeNull()
    expect(alternateEnURL.searchParams.get('search')).toBeNull()
    expect(alternateEnURL.searchParams.get('q')).toBeNull()
    expect(alternateEnURL.searchParams.get('query')).toBeNull()
    expect(alternateEnURL.searchParams.get('tag')).toBeNull()

    expect(alternateDeURL.searchParams.get('sort')).toBeNull()
    expect(alternateDeURL.searchParams.get('search')).toBeNull()
    expect(alternateDeURL.searchParams.get('q')).toBeNull()
    expect(alternateDeURL.searchParams.get('query')).toBeNull()
    expect(alternateDeURL.searchParams.get('tag')).toBeNull()

    expect(xDefaultURL.searchParams.get('sort')).toBeNull()
    expect(xDefaultURL.searchParams.get('search')).toBeNull()
    expect(xDefaultURL.searchParams.get('q')).toBeNull()
    expect(xDefaultURL.searchParams.get('query')).toBeNull()
    expect(xDefaultURL.searchParams.get('tag')).toBeNull()
  })
})
