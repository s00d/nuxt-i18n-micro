import { describe, expect, test } from 'untestutils/vitest'

// `use-locale-head` fixture: prefix, meta false; the page calls useLocaleHead() by hand and prints metaObject.
describe('J6 useLocaleHead', () => {
  test.override({ harness: 'use-locale-head' })

  test('ULH-T1: manual useLocaleHead fills metaObject and the head', async ({ page, goto, baseURL }) => {
    // step 1: open /en → #meta-object JSON has htmlAttrs.lang en-US and meta/link arrays
    // was: use-locale-head › populates metaObject without explicit updateMeta()
    await goto('/en', { waitUntil: 'domcontentloaded' })
    const payload = JSON.parse((await page.locator('#meta-object').textContent())!)
    expect(payload.htmlAttrs.lang).toBe('en-US')
    expect(Array.isArray(payload.meta)).toBe(true)
    expect(Array.isArray(payload.link)).toBe(true)

    // step 2: same page → canonical path /en, og:locale en_US
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(new URL(canonical!, baseURL).pathname).toMatch(/^\/en\/?$/)
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US')
  })
})
