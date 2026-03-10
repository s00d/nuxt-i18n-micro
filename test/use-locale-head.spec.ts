import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/use-locale-head', import.meta.url)),
  },
})

test.describe('useLocaleHead manual usage', () => {
  test('populates metaObject without explicit updateMeta()', async ({ page, goto, baseURL }) => {
    await goto('/en', { waitUntil: 'domcontentloaded' })

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')

    expect(canonical).toBeTruthy()
    expect(new URL(canonical!, baseURL).pathname).toMatch(/^\/en\/?$/)
    expect(ogLocale).toBe('en-US')
  })
})
