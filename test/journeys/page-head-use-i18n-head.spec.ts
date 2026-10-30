import { emulateDomain } from 'untestutils/utils'
import { describe, expect, test } from 'untestutils/vitest'
import { assertI18nHeadScenario, i18nHeadScenarios, i18nHeadStaticPages } from '../helpers/i18n-head-seo'

// seo fixture, SEO_VARIANT=use-i18n-head: pec, en (en-US) / fr (fr-FR); every page overrides parts of the head with useI18nHead().
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const meta = (property: string, content: string) => new RegExp(`<meta[^>]*property="${property}"[^>]*content="${esc(content)}"`)
const metaName = (name: string, content: string) => new RegExp(`<meta[^>]*name="${name}"[^>]*content="${esc(content)}"`)
const alt = (hreflang: string, href: string) => new RegExp(`<link[^>]*rel="alternate"[^>]*hreflang="${hreflang}"[^>]*href="${esc(href)}"`)
const canonical = (href: string) => new RegExp(`<link[^>]*rel="canonical"[^>]*href="${esc(href)}"`)

interface SsrCase {
  path: string
  was: string
  match: RegExp[]
  notMatch?: RegExp[]
  hreflangs?: { contain: string[]; exclude: string[] }
}

// One SSR request per page; each entry folds the old per-describe tests for that page.
const ssrCases: SsrCase[] = [
  {
    path: '/post/hello-en',
    was: 'custom hreflang from API locales; appends og:title; og:locale:alternate for available locales',
    match: [
      alt('en', 'https://example.com/hello-en'),
      alt('fr', 'https://example.com/fr/bonjour-fr'),
      meta('og:title', 'Hello post'),
      meta('og:locale:alternate', 'fr_FR'),
    ],
    notMatch: [/hreflang="x-default"/],
  },
  {
    path: '/canonical/cms-canonical',
    was: 'replaces canonical and og:url from CMS',
    match: [
      canonical('https://www.example.com/en/blog/cms-canonical'),
      meta('og:url', 'https://www.example.com/en/blog/cms-canonical'),
      alt('en', 'https://www.example.com/en/blog/cms-canonical'),
      alt('fr', 'https://www.example.com/fr/blog/cms-canonical-fr'),
    ],
  },
  {
    path: '/partial/partial-only',
    was: 'keeps module canonical, replaces hreflang',
    match: [
      /<link[^>]*rel="canonical"[^>]*href="[^"]*\/partial\/partial-only"/,
      alt('en', 'https://example.com/articles/partial-only'),
      alt('fr', 'https://example.com/fr/articles/partial-only-fr'),
    ],
    notMatch: [/hreflang="en-US"/],
  },
  {
    path: '/x-default/with-xdefault',
    was: 'x-default points to default translation URL',
    match: [
      alt('x-default', 'https://example.com/articles/default-en'),
      alt('en', 'https://example.com/articles/default-en'),
      alt('fr', 'https://example.com/fr/articles/default-fr'),
    ],
  },
  {
    path: '/full/full-meta',
    was: 'og, twitter and description meta',
    match: [
      meta('og:title', 'Full meta article'),
      meta('og:description', 'Full article description'),
      meta('og:image', 'https://example.com/images/full-meta.jpg'),
      metaName('twitter:card', 'summary_large_image'),
      metaName('twitter:title', 'Full meta article'),
      canonical('https://example.com/blog/full-meta'),
    ],
  },
  {
    path: '/blog/shared-blog',
    was: 'blog page uses shared helper',
    match: [
      meta('og:title', 'Shared helper blog post'),
      canonical('https://example.com/blog/shared-blog'),
      alt('fr', 'https://example.com/fr/blog/shared-blog-fr'),
    ],
  },
  {
    path: '/guides/shared-guide',
    was: 'guide page uses shared helper',
    match: [
      meta('og:title', 'Shared helper guide'),
      canonical('https://example.com/guides/shared-guide'),
      alt('fr', 'https://example.com/fr/guides/shared-guide-fr'),
    ],
  },
  {
    path: '/custom-alternates',
    was: 'only custom hreflang links, rebuilt og alternates',
    match: [alt('en', 'https://example.com/custom/en'), alt('fr', 'https://example.com/custom/fr'), meta('og:locale:alternate', 'fr_FR')],
    notMatch: [/hreflang="x-default"/, /hreflang="en-US"/, meta('og:locale:alternate', 'en_US')],
  },
  {
    path: '/landing',
    was: 'appends og tags, keeps module hreflang',
    match: [meta('og:title', 'Landing OG title'), meta('og:description', 'Landing OG description')],
    hreflangs: { contain: ['en-US', 'fr-FR', 'x-default'], exclude: ['en', 'fr'] },
  },
  {
    path: '/no-hreflang',
    was: 'no alternate links, canonical remains',
    match: [/<link[^>]*rel="canonical"/, meta('og:locale', 'en_US')],
    notMatch: [/hreflang="en-US"/, /hreflang="fr-FR"/, /hreflang="en"/, /hreflang="fr"/, /hreflang="x-default"/],
  },
  { path: '/', was: 'index appends og:title', match: [meta('og:title', 'Index page')] },
]

describe('J7 useI18nHead page head', () => {
  test.override({ harness: 'seo-use-i18n-head' })

  test('U-T1: SSR head of every useI18nHead scenario', async ({ request }) => {
    for (const c of ssrCases) {
      // step: GET <path> → the scenario's tags are in the HTML
      // was: use-i18n-head › SSR: <c.was>
      const res = await request.get(c.path)
      expect(res.status(), c.path).toBe(200)
      const html = await res.text()
      for (const re of c.match) expect(html, `${c.path} ${c.was}`).toMatch(re)
      for (const re of c.notMatch ?? []) expect(html, `${c.path} ${c.was}`).not.toMatch(re)
      if (!c.hreflangs) continue
      const hreflangs = [...html.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1])
      expect(hreflangs).toEqual(expect.arrayContaining(c.hreflangs.contain))
      for (const code of c.hreflangs.exclude) expect(hreflangs).not.toContain(code)
    }
  })

  test('U-T2: SPA navigation to every scenario, then reload', async ({ page, goto }) => {
    // was: use-i18n-head › visits every scenario via index links and survives reload
    // was: use-i18n-head › SPA: hreflang and og:title update after navigation (D: first loop entry)
    for (const scenario of [...i18nHeadScenarios, ...i18nHeadStaticPages]) {
      // step 1: open / → hydrated index
      await goto('/', { waitUntil: 'hydration' })
      // step 2: click the scenario link → URL changes, head matches the scenario
      await page.getByRole('link', { name: scenario.linkLabel }).click()
      await expect(page).toHaveURL(new RegExp(`${esc(scenario.path)}$`))
      await assertI18nHeadScenario(page, scenario)
      // step 3: reload → the SSR head matches the scenario too
      await page.reload({ waitUntil: 'domcontentloaded' })
      await assertI18nHeadScenario(page, scenario)
    }
  })

  test('U-T3: client-fetched head survives reload; forwarded host reaches the module canonical', async ({ page, goto, baseURL }) => {
    // step 1: open /reactive → client fetch fills title, og:title, alternates en and fr
    // was: use-i18n-head › SPA: head updates after client fetch
    await goto('/reactive', { waitUntil: 'hydration' })
    await expect(page.getByTestId('article-title')).toHaveText('Client-loaded article', { timeout: 10000 })
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Client-loaded article')
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://example.com/articles/reactive-en')
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute('href', 'https://example.com/fr/articles/reactive-fr')

    // step 2: reload → same title, og:title and fr alternate
    // was: use-i18n-head › reactive page keeps head after reload
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('article-title')).toHaveText('Client-loaded article', { timeout: 10000 })
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Client-loaded article')
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute('href', 'https://example.com/fr/articles/reactive-fr')

    // step 3: emulate proxy.example.com, open /partial/partial-only → canonical and og:url on the proxy host
    // was: use-i18n-head › SSR: forwarded host applies to module canonical
    const domain = 'https://proxy.example.com'
    await emulateDomain(page, domain, baseURL!)
    await page.goto(`${domain}/partial/partial-only`, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${domain}/partial/partial-only`)
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${domain}/partial/partial-only`)
    // in-flight emulated requests would reject with "Route is already handled" when the page closes
    await page.unrouteAll({ behavior: 'ignoreErrors' })
  })

  test('U-T4: route rules are localized once on the server build (#218)', async ({ request }) => {
    // step 1: the prerender rule's fr copy serves the fr page; the double-localized path does not exist
    // was: generate-issue-218 › builds without /fr/fr prerender errors
    const fr = await request.get('/fr/prerendered')
    expect(fr.status()).toBe(200)
    expect(await fr.text()).toContain('Page prérendue')
    expect((await request.get('/fr/fr/prerendered', { maxRedirects: 0 })).status()).toBe(404)

    // step 2: the isr rule's fr copy serves a dynamic page
    const product = await request.get('/fr/products/7')
    expect(product.status()).toBe(200)
    expect(await product.text()).toMatch(/id="product"[^>]*>\s*Produit 7\s*</)
  })
})
