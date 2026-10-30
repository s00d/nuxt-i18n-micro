import { describe, expect, test } from 'untestutils/vitest'

// `content` fixture (pec, meta: false app-wide): /manual-head calls useLocaleHead() by hand, passes it to useHead
// and prints metaObject. The recipe is a production node server, so a render also proves Nitro traced the
// @i18n-micro/utils subpaths useLocaleHead imports (#233).
describe('J6 useLocaleHead', () => {
  test.override({ harness: 'content' })

  test('ULH-T1: manual useLocaleHead fills metaObject and the head', async ({ page, goto, baseURL }) => {
    // step 1: open /manual-head → the page renders (was: use-locale-head-production › no `Cannot find module`)
    await goto('/manual-head', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#content')).toHaveText('useLocaleHead manual usage')

    // step 2: #meta-object → html attrs, one alternate per locale + x-default, og:url of this page
    // was: use-locale-head › populates metaObject without explicit updateMeta()
    const payload = JSON.parse((await page.locator('#meta-object').textContent())!) as {
      htmlAttrs: Record<string, string>
      link: { rel: string; hreflang?: string; href: string }[]
      meta: { property?: string; content: string }[]
    }
    expect(payload.htmlAttrs).toMatchObject({ lang: 'en-US', dir: 'ltr' })
    const hreflangs = payload.link.filter((l) => l.rel === 'alternate').map((l) => l.hreflang)
    expect(hreflangs.sort()).toEqual(['cs-CZ', 'en-US', 'x-default'])
    const ogUrl = payload.meta.find((m) => m.property === 'og:url')?.content
    expect(new URL(ogUrl!, baseURL).pathname).toBe('/manual-head')

    // step 3: the same values reached the head through useHead (meta: false, so nothing else wrote them)
    // was: use-locale-head-production › og:locale en_US, canonical in the production HTML
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(new URL(canonical!, baseURL).pathname).toBe('/manual-head')
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US')
    await expect(page.locator('link[rel="alternate"][hreflang="cs-CZ"]')).toHaveAttribute('href', /\/cs\/manual-head$/)
  })
})
