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

    const canonicalURL = new URL(canonicalHref!)
    const ogURL = new URL(ogUrlContent!)

    expect(canonicalURL.pathname).toBe('/en/contact')
    expect(canonicalURL.searchParams.get('page')).toBe('2')
    expect(canonicalURL.searchParams.get('sort')).toBeNull()
    expect(canonicalURL.searchParams.get('filter')).toBeNull()
    expect(canonicalURL.searchParams.get('search')).toBeNull()
    expect(canonicalURL.searchParams.get('q')).toBeNull()
    expect(canonicalURL.searchParams.get('query')).toBeNull()
    expect(canonicalURL.searchParams.get('tag')).toBeNull()
    expect(canonicalURL.toString()).toBe(ogURL.toString())
  })
})
