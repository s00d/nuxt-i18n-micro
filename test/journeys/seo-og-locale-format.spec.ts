import type { Page } from '@playwright/test'
import { collectConsole } from 'untestutils/utils'
import { describe, expect, test } from 'untestutils/vitest'

// `seo-og-locale-format` fixture: prefix; en-US with og en_US, fr, ar (rtl), zh-Hans (no og mapping).
const ogAlternates = (page: Page) =>
  page.locator('meta[property="og:locale:alternate"]').evaluateAll((els) => els.map((el) => el.getAttribute('content')))

describe('J6 og:locale format', () => {
  test.override({ harness: 'seo-og-locale-format' })

  test('OG-T1: og:locale from locale.og or iso; hreflang stays BCP 47', async ({ page, goto, request }) => {
    // step 1: SSR /en, /fr, /zh → og en_US, fr_FR; zh has no og:locale but keeps hreflang zh-Hans
    // was: seo-og-locale-format › SSR: og:locale uses explicit og and iso-derived format
    const en = await request.get('/en')
    expect(en.status()).toBe(200)
    expect(await en.text()).toMatch(/<meta[^>]*property="og:locale"[^>]*content="en_US"/)
    const fr = await request.get('/fr')
    expect(fr.status()).toBe(200)
    expect(await fr.text()).toMatch(/<meta[^>]*property="og:locale"[^>]*content="fr_FR"/)
    // was: seo-og-locale-format › SSR: og:locale is omitted when iso cannot be mapped
    const zh = await request.get('/zh')
    expect(zh.status()).toBe(200)
    const zhHtml = await zh.text()
    expect(zhHtml).not.toMatch(/property="og:locale"/)
    expect(zhHtml).toContain('hreflang="zh-Hans"')
    expect(zhHtml).not.toContain('hreflang="zh"')

    // armed before the first navigation
    const warnings = collectConsole(page, (msg) => msg.type() === 'warning')

    // step 2: open /en → lang en-US, og en_US, og alternates have ar_AE, one hreflang ar-AE
    // was: seo-og-locale-format › og:locale uses locale.og; html lang and hreflang stay BCP 47 from iso
    await goto('/en', { waitUntil: 'hydration' })
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US')
    expect(await ogAlternates(page)).toContain('ar_AE')
    await expect(page.locator('link[rel="alternate"][hreflang="ar-AE"]')).toHaveCount(1)

    // step 3: open /ar → lang ar-AE, og ar_AE
    // was: seo-og-locale-format › non-default locale: og:locale uses locale.og
    await goto('/ar', { waitUntil: 'hydration' })
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar-AE')
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'ar_AE')

    // step 4: open /fr → lang fr-FR, og fr_FR derived from iso, og alternates have en_US
    // was: seo-og-locale-format › og:locale is derived from iso when og is omitted
    await goto('/fr', { waitUntil: 'hydration' })
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-FR')
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'fr_FR')
    expect(await ogAlternates(page)).toContain('en_US')

    // step 5: open /zh → no og:locale, one canonical; no og:locale warning in the prod build
    // was: seo-og-locale-format › client: og:locale is omitted for unmapped iso
    await goto('/zh', { waitUntil: 'hydration' })
    await expect(page.locator('meta[property="og:locale"]')).toHaveCount(0)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    // was: seo-og-locale-format › client: no og:locale warning in production build
    warnings.stop()
    expect(warnings.messages.filter((m) => m.text.includes('[i18n] Cannot derive og:locale'))).toEqual([])
  })
})
