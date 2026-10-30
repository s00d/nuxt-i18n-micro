import { describe, expect, test } from '../helpers/guarded-test.ts'
import { enActivity, walkActivity } from '../helpers/journeys-a.ts'

// J4 basic-prefix: the basic fixture under the prefix strategy, the default locale has a prefix too.
describe('journey: routing variants — basic under prefix', () => {
  test.override({ harness: 'basic-prefix' })

  test('global locale routes, unlocalized page, routesLocaleLinks', async ({ page, goto }) => {
    // step 1: open /page2 → redirected to /en/custom-page2-en; #unlocalized → /unlocalized; #link-page2-en → back
    // was: undefault › test redirection and link clicks in English
    await goto('/page2', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/en/custom-page2-en')
    await page.click('#unlocalized')
    await expect(page).toHaveURL('/unlocalized')
    await page.click('#link-page2-en')
    await expect(page).toHaveURL('/en/custom-page2-en')

    // step 2: the same for de
    // was: undefault › test redirection and link clicks in German
    await goto('/de/custom-page2-de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de/custom-page2-de')
    await page.click('#unlocalized')
    await expect(page).toHaveURL('/unlocalized')
    await page.click('#link-page2-de')
    await expect(page).toHaveURL('/de/custom-page2-de')

    // step 3: post section page per locale → routesLocaleLinks reads post-id translations
    // was: undefault › should correctly render post section pages with localized routes
    for (const code of ['de', 'en', 'ru']) {
      await goto(`/${code}/post/1/all/s2`, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('#name')).toHaveText(code)
      await expect(page.locator('#name-page')).toHaveText(`${code} page`)
    }
  })

  test('a routeRules redirect without a page is not localized', async ({ page, goto, request }) => {
    // step 1: GET /old-product → the rule answers, no /en/old-product in between
    const res = await request.get('/old-product', { maxRedirects: 0 })
    expect(res.status()).toBeGreaterThanOrEqual(300)
    expect(res.status()).toBeLessThan(400)
    expect(res.headers().location).toBe('/page')

    // step 2: its stub has no prefixed copies
    expect((await request.get('/en/old-product')).status()).toBe(404)
    expect((await request.get('/de/old-product')).status()).toBe(404)

    // step 3: a client navigation keeps its URL: no /en/old-product
    await goto('/en', { waitUntil: 'hydration' })
    await page.evaluate(() =>
      (window as unknown as { useNuxtApp: () => { $router: { push: (to: string) => Promise<void> } } }).useNuxtApp().$router.push('/old-product'),
    )
    await expect(page).toHaveURL('/old-product')
  })

  test('activity slug tree under /en', async ({ page, goto }) => {
    // step 1: walk the en slug tree under /en → hrefs and child pages
    // was: locale-slug-undefault › Test Locale Path (the de half is the same as basic's de walk, see basic-app)
    await walkActivity(page, goto, enActivity('/en'))
  })
})
