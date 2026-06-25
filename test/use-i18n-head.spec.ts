import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'
import type { Page } from '@playwright/test'
import { assertI18nHeadScenario, i18nHeadScenarios, i18nHeadStaticPages } from './helpers/i18n-head-seo'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/use-i18n-head', import.meta.url)),
  },
})

async function emulateDomain(page: Page, emulatedOrigin: string, realBaseURL: string) {
  const realBase = realBaseURL.replace(/\/$/, '')
  const { hostname: fwdHost } = new URL(emulatedOrigin)

  await page.route(`${emulatedOrigin}/**`, async (route) => {
    const url = new URL(route.request().url())
    try {
      const response = await route.fetch({
        url: `${realBase}${url.pathname}${url.search}`,
        headers: {
          ...route.request().headers(),
          'x-forwarded-host': fwdHost,
          'x-forwarded-proto': url.protocol.replace(':', ''),
        },
      })
      await route.fulfill({ response })
    } catch {
      await route.abort()
    }
  })
}

function expectMeta(html: string, property: string, content: string) {
  expect(html).toMatch(new RegExp(`<meta[^>]*property="${property}"[^>]*content="${content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`))
}

function expectMetaName(html: string, name: string, content: string) {
  expect(html).toMatch(new RegExp(`<meta[^>]*name="${name}"[^>]*content="${content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`))
}

function expectAlternate(html: string, hreflang: string, href: string) {
  const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  expect(html).toMatch(new RegExp(`<link[^>]*rel="alternate"[^>]*hreflang="${hreflang}"[^>]*href="${escapedHref}"`))
}

test.describe('useI18nHead — article with per-locale slugs', () => {
  test('SSR: custom hreflang from API locales', async ({ request }) => {
    const html = await (await request.get('/post/hello-en')).text()
    expectAlternate(html, 'en', 'https://example.com/hello-en')
    expectAlternate(html, 'fr', 'https://example.com/fr/bonjour-fr')
    expect(html).not.toMatch(/hreflang="x-default"/)
  })

  test('SSR: appends og:title', async ({ request }) => {
    const html = await (await request.get('/post/hello-en')).text()
    expectMeta(html, 'og:title', 'Hello post')
  })

  test('SSR: og:locale:alternate for available locales', async ({ request }) => {
    const html = await (await request.get('/post/hello-en')).text()
    expect(html).toMatch(/<meta[^>]*property="og:locale:alternate"[^>]*content="fr_FR"/)
  })

  test('SPA: hreflang and og:title update after navigation', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    await page.getByRole('link', { name: 'Post (slugs)' }).click()
    await assertI18nHeadScenario(page, i18nHeadScenarios[0]!)
  })
})

test.describe('useI18nHead — canonical and og:url override', () => {
  test('SSR: replaces canonical and og:url from CMS', async ({ request }) => {
    const html = await (await request.get('/canonical/cms-canonical')).text()
    expect(html).toMatch(/<link[^>]*rel="canonical"[^>]*href="https:\/\/www\.example\.com\/en\/blog\/cms-canonical"/)
    expectMeta(html, 'og:url', 'https://www.example.com/en/blog/cms-canonical')
    expectAlternate(html, 'en', 'https://www.example.com/en/blog/cms-canonical')
    expectAlternate(html, 'fr', 'https://www.example.com/fr/blog/cms-canonical-fr')
  })
})

test.describe('useI18nHead — partial alternates only', () => {
  test('SSR: keeps module canonical, replaces hreflang', async ({ request }) => {
    const html = await (await request.get('/partial/partial-only')).text()
    expect(html).toMatch(/<link[^>]*rel="canonical"[^>]*href="[^"]*\/partial\/partial-only"/)
    expectAlternate(html, 'en', 'https://example.com/articles/partial-only')
    expectAlternate(html, 'fr', 'https://example.com/fr/articles/partial-only-fr')
    expect(html).not.toMatch(/hreflang="en-US"/)
  })

  test('SSR: forwarded host applies to module canonical', async ({ page, baseURL }) => {
    const emulatedOrigin = 'https://proxy.example.com'
    await emulateDomain(page, emulatedOrigin, baseURL || 'http://localhost:3000')
    await page.goto(`${emulatedOrigin}/partial/partial-only`, { waitUntil: 'domcontentloaded' })

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://proxy.example.com/partial/partial-only')
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', 'https://proxy.example.com/partial/partial-only')
  })
})

test.describe('useI18nHead — custom x-default', () => {
  test('SSR: x-default points to default translation URL', async ({ request }) => {
    const html = await (await request.get('/x-default/with-xdefault')).text()
    expectAlternate(html, 'x-default', 'https://example.com/articles/default-en')
    expectAlternate(html, 'en', 'https://example.com/articles/default-en')
    expectAlternate(html, 'fr', 'https://example.com/fr/articles/default-fr')
  })
})

test.describe('useI18nHead — full meta bundle', () => {
  test('SSR: og, twitter and description meta', async ({ request }) => {
    const html = await (await request.get('/full/full-meta')).text()
    expectMeta(html, 'og:title', 'Full meta article')
    expectMeta(html, 'og:description', 'Full article description')
    expectMeta(html, 'og:image', 'https://example.com/images/full-meta.jpg')
    expectMetaName(html, 'twitter:card', 'summary_large_image')
    expectMetaName(html, 'twitter:title', 'Full meta article')
    expect(html).toMatch(/<link[^>]*rel="canonical"[^>]*href="https:\/\/example\.com\/blog\/full-meta"/)
  })
})

test.describe('useI18nHead — shared buildArticleHead helper', () => {
  test('SSR: blog page uses shared helper', async ({ request }) => {
    const html = await (await request.get('/blog/shared-blog')).text()
    expectMeta(html, 'og:title', 'Shared helper blog post')
    expect(html).toMatch(/<link[^>]*rel="canonical"[^>]*href="https:\/\/example\.com\/blog\/shared-blog"/)
    expectAlternate(html, 'fr', 'https://example.com/fr/blog/shared-blog-fr')
  })

  test('SSR: guide page uses shared helper', async ({ request }) => {
    const html = await (await request.get('/guides/shared-guide')).text()
    expectMeta(html, 'og:title', 'Shared helper guide')
    expect(html).toMatch(/<link[^>]*rel="canonical"[^>]*href="https:\/\/example\.com\/guides\/shared-guide"/)
    expectAlternate(html, 'fr', 'https://example.com/fr/guides/shared-guide-fr')
  })
})

test.describe('useI18nHead — disable + custom alternates', () => {
  test('SSR: only custom hreflang links, rebuilt og alternates', async ({ request }) => {
    const html = await (await request.get('/custom-alternates')).text()
    expectAlternate(html, 'en', 'https://example.com/custom/en')
    expectAlternate(html, 'fr', 'https://example.com/custom/fr')
    expect(html).not.toMatch(/hreflang="x-default"/)
    expect(html).not.toMatch(/hreflang="en-US"/)
    expect(html).toMatch(/<meta[^>]*property="og:locale:alternate"[^>]*content="fr_FR"/)
    expect(html).not.toMatch(/<meta[^>]*property="og:locale:alternate"[^>]*content="en_US"/)
  })
})

test.describe('useI18nHead — landing OG only', () => {
  test('SSR: appends og tags, keeps module hreflang', async ({ request }) => {
    const html = await (await request.get('/landing')).text()
    expectMeta(html, 'og:title', 'Landing OG title')
    expectMeta(html, 'og:description', 'Landing OG description')
    expect(html).toMatch(/hreflang="en"/)
    expect(html).toMatch(/hreflang="fr"/)
    expect(html).toMatch(/hreflang="x-default"/)
  })
})

test.describe('useI18nHead — disable hreflang', () => {
  test('SSR: no alternate links, canonical remains', async ({ request }) => {
    const html = await (await request.get('/no-hreflang')).text()
    expect(html).not.toMatch(/hreflang="en"/)
    expect(html).not.toMatch(/hreflang="fr"/)
    expect(html).not.toMatch(/hreflang="x-default"/)
    expect(html).toMatch(/<link[^>]*rel="canonical"/)
    expectMeta(html, 'og:locale', 'en_US')
  })
})

test.describe('useI18nHead — reactive client load', () => {
  test('SPA: head updates after client fetch', async ({ page, goto }) => {
    await goto('/reactive', { waitUntil: 'hydration' })
    await expect(page.getByTestId('article-title')).toHaveText('Client-loaded article', { timeout: 10000 })
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Client-loaded article')
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://example.com/articles/reactive-en')
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute('href', 'https://example.com/fr/articles/reactive-fr')
  })
})

test.describe('useI18nHead — index page', () => {
  test('SSR: index appends og:title', async ({ request }) => {
    const html = await (await request.get('/')).text()
    expectMeta(html, 'og:title', 'Index page')
  })
})

test.describe('useI18nHead — navigation and reload (dev server)', () => {
  test('visits every scenario via index links and survives reload', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'domcontentloaded' })

    for (const scenario of [...i18nHeadScenarios, ...i18nHeadStaticPages]) {
      await goto('/', { waitUntil: 'domcontentloaded' })
      await page.getByRole('link', { name: scenario.linkLabel }).click()
      await page.waitForURL(`**${scenario.path}`)
      await assertI18nHeadScenario(page, scenario)

      await page.reload({ waitUntil: 'domcontentloaded' })
      await assertI18nHeadScenario(page, scenario)
    }
  })

  test('reactive page keeps head after reload', async ({ page, goto }) => {
    await goto('/reactive', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('article-title')).toHaveText('Client-loaded article', { timeout: 10000 })
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Client-loaded article')

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('article-title')).toHaveText('Client-loaded article', { timeout: 10000 })
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Client-loaded article')
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute('href', 'https://example.com/fr/articles/reactive-fr')
  })
})
