import type { Page } from '@playwright/test'
import { ssr } from '../helpers/journeys-b.ts'
import { describe, expect, test } from '../helpers/guarded-test.ts'

// strategy fixture under prefix. A navigation takes effect when it commits: whatever is cancelled, abandoned or left
// behind must not reach the page on screen. Requests are held with page.route, so every race is deterministic.

declare const useNuxtApp: () => {
  $router: { push: (to: string) => Promise<unknown>; beforeResolve: (guard: (to: { path: string }) => boolean | void) => void }
  $switchLocalePath: (locale: string) => string
  $t: (key: string) => unknown
  $switchRoute: (to: string, locale: string) => Promise<void>
}

async function hold(page: Page, pattern: string) {
  const held: { fallback: () => Promise<void> }[] = []
  let holding = true
  await page.route(pattern, (route) => (holding ? void held.push(route) : route.fallback()))
  return async () => {
    holding = false
    await Promise.all(held.splice(0).map((route) => route.fallback()))
  }
}

const push = (page: Page, to: string) =>
  page.evaluate((path) => {
    void useNuxtApp().$router.push(path)
  }, to)
const switchPath = (page: Page) => page.evaluate(() => useNuxtApp().$switchLocalePath('de'))
const ogTitles = (page: Page) => page.locator('meta[property="og:title"]').evaluateAll((tags) => tags.map((tag) => tag.getAttribute('content')))
const customAlternates = (page: Page) => page.locator('link[rel="alternate"][href*="x.test"]').count()
const cookie = async (page: Page) => (await page.context().cookies()).find((entry) => entry.name === 'user-locale')?.value

describe('journey: a navigation takes effect when it commits (prefix)', () => {
  test.override({ harness: 'strategy-prefix' })

  test('a cancelled switch applies nothing', async ({ page, goto }) => {
    // step 1: click de while its chunk is slow, then back to en, which the router drops as a duplicate; the chunk arrives
    await goto('/en/page-a', { waitUntil: 'hydration' })
    const release = await hold(page, '**/_locales/**/de/**')
    await page.click('button[data-locale="de"]')
    await page.waitForTimeout(100)
    await page.click('button[data-locale="en"]')
    await release()
    await page.waitForTimeout(300)
    await expect(page).toHaveURL('/en/page-a')
    await expect(page.locator('html')).toHaveAttribute('lang', /^en/)
    await expect(page.locator('.locale-value')).toHaveText('en')
    await expect(page.locator('#page-a-title')).toHaveText('Page A Title EN')
    expect(await cookie(page)).toBe('en')

    // step 2: the same with a push to the page on screen, which leaves the stored locale to the switch
    const again = await hold(page, '**/_locales/**/de/**')
    await page.click('button[data-locale="de"]')
    await push(page, '/en/page-a')
    await again()
    await page.waitForTimeout(300)
    await expect(page.locator('#page-a-title')).toHaveText('Page A Title EN')
    expect(await cookie(page)).toBe('en')
  })

  test('a cancelled navigation in one locale leaves the page its dictionary', async ({ page, goto }) => {
    // on page a: to b with its chunk slow, then to a, which the router drops; b's chunk must not replace a's
    await goto('/en/page-a', { waitUntil: 'hydration' })
    const release = await hold(page, '**/_locales/page-b/**')
    await push(page, '/en/page-b')
    await page.waitForTimeout(100)
    await push(page, '/en/page-a')
    await release()
    await page.waitForTimeout(300)
    await expect(page.locator('#page-a-title')).toHaveText('Page A Title EN')
    expect(await page.evaluate(() => useNuxtApp().$t('pageB.title'))).toBe('pageB.title')
  })

  test('a navigation blocked after the guard changes nothing', async ({ page, goto }) => {
    // step 1: a beforeResolve blocks the next page: params, head and dictionary of this one stay
    await goto('/en/slug/1', { waitUntil: 'hydration' })
    await page.evaluate(() => useNuxtApp().$router.beforeResolve((to) => !to.path.endsWith('/page-b')))
    await push(page, '/en/page-b')
    await page.waitForTimeout(300)
    await expect(page).toHaveURL('/en/slug/1')
    expect(await switchPath(page)).toBe('/de/slug/1-eins')
    expect(await ogTitles(page)).toEqual(['SLUG-1'])

    // step 2: a blocked switch leaves the stored locale on the page's
    await page.evaluate(() => useNuxtApp().$router.beforeResolve((to) => !to.path.startsWith('/de')))
    await page.locator('button[data-locale="de"]').click()
    await page.waitForTimeout(300)
    await expect(page.locator('.locale-value')).toHaveText('en')
    expect(await cookie(page)).toBe('en')
  })

  for (const form of ['getter', 'plain']) {
    test(`useI18nHead of a left page stays off the next one: ${form}`, async ({ page, goto }) => {
      // step 1: same locale, the next page is async, so this one stays mounted through the dictionary change
      await goto(`/en/page-head/${form}`, { waitUntil: 'hydration' })
      expect(await ogTitles(page)).toHaveLength(1)
      const release = await hold(page, '**/api/slug/2')
      await push(page, '/en/slug-late/2')
      await page.waitForTimeout(150)
      await release()
      await expect(page.locator('#slug-late-page')).toHaveText('slug-late-2')
      await page.waitForTimeout(150)
      expect(await ogTitles(page)).toEqual([])
      expect(await customAlternates(page)).toBe(0)

      // step 2: the navigation also changes the locale
      await goto(`/en/page-head/${form}`, { waitUntil: 'hydration' })
      await page.evaluate(() => useNuxtApp().$switchRoute('/slug-late/1', 'de'))
      await expect(page.locator('#slug-late-page')).toHaveText('slug-late-1')
      await page.waitForTimeout(150)
      expect(await ogTitles(page)).toEqual([])
      expect(await customAlternates(page)).toBe(0)
    })
  }

  test('a head getter follows a switch on its own page', async ({ page, goto }) => {
    await goto('/en/page-head/getter', { waitUntil: 'hydration' })
    const [before] = await ogTitles(page)
    await page.click('button[data-locale="de"]')
    await expect(page).toHaveURL('/de/page-head/getter')
    await expect.poll(() => ogTitles(page)).not.toEqual([before])
    expect(await ogTitles(page)).toHaveLength(1)
  })

  test('translated slugs with a switcher in the layout', async ({ page, goto, baseURL }) => {
    // step 1: the server HTML has the page's slugs, though the switcher renders before the page's async setup
    const landing = await ssr(baseURL, '/en/slug/1')
    expect(landing.html).toContain('href="/de/slug/1-eins"')
    expect(landing.html).toContain('href="/ru/slug/1-odin"')
    expect(landing.html).not.toContain('class="switcher-locale-de" href="/de/slug/1"')
    expect(landing.html).toContain('href="/en/slug/1-one"')

    // step 2: another locale's slug does not leak into the links
    const german = await ssr(baseURL, '/de/slug/2-zwei')
    expect(german.html).toContain('href="/en/slug/2-two"')
    expect(german.html).not.toContain('href="/ru/slug/2-zwei"')

    // step 3: hydration agrees with it (the guard fails the test on a mismatch), and the DOM keeps the right href
    await goto('/en/slug/1', { waitUntil: 'hydration' })
    await expect(page.locator('.switcher-locale-de').first()).toHaveAttribute('href', '/de/slug/1-eins')
    // a plain link to this page keeps its URL: only the switcher's own link gets the slug
    await expect(page.locator('#slug-first')).toHaveAttribute('href', '/en/slug/1')
    await expect(page.locator('.switcher-locale-en').first()).toHaveAttribute('href', '/en/slug/1-one')
    // a hand-written link in the page itself renders after the params: nothing to rewrite, nothing to mismatch
    await expect(page.locator('#slug-own-switch')).toHaveAttribute('href', '/de/slug/1-eins')

    // step 4: a client navigation gets the next page's slugs
    await push(page, '/en/slug/2')
    await expect(page.locator('#slug-page')).toHaveText('slug-2')
    await expect(page.locator('.switcher-locale-de').first()).toHaveAttribute('href', '/de/slug/2-zwei')
  })

  test('a slug from the URL is text in the server HTML', async ({ page, goto, baseURL, guard }) => {
    // step 1: `$&` in a slug must not paste the match into the attribute, with the app's JS off too
    guard.allow(/Failed to load resource/)
    const xss = '/en/echo/a$&b?/autofocus/onfocus=alert(1)//'
    const fired: string[] = []
    page.on('dialog', async (dialog) => {
      fired.push(dialog.message())
      await dialog.dismiss()
    })
    await page.route('**/_nuxt/**', (route) => route.abort())
    await page.goto(xss)
    await page.waitForTimeout(150)
    expect(
      await page
        .locator('.switcher-locale-de')
        .first()
        .evaluate((link) => link.getAttributeNames()),
    ).toEqual(['class', 'href', 'hreflang', 'lang', 'style'])
    expect(fired).toEqual([])
    await page.unroute('**/_nuxt/**')

    // step 2: the client builds the same link, so hydration has nothing to say (the guard fails the test on a warning)
    await goto(xss, { waitUntil: 'hydration' })
    expect(fired).toEqual([])

    // step 3: `$` patterns mean nothing, in the one place a replacement string would read them
    for (const slug of ['a$$b', 'a$`b', "a$'b", 'a$&b']) {
      const { html } = await ssr(baseURL, `/en/echo/${encodeURI(slug)}`)
      expect(html.match(/<div id="__nuxt"/g)).toHaveLength(1)
      const href = /class="switcher-locale-de" href="([^"]*)"/.exec(html)![1]!
      expect(decodeURI(href).replaceAll('&amp;', '&').replaceAll('&#39;', "'")).toBe(`/de/echo/${slug}`)
    }
  })

  test('a literal link to this page in another locale keeps its URL', async ({ baseURL }) => {
    const { html } = await ssr(baseURL, '/en/slug/1')
    expect(html).toContain('id="slug-literal" href="/de/slug/1"')
  })

  test('a layout is not left by a navigation: useI18nHead and $setI18nRouteParams keep working in it', async ({ page, goto }) => {
    const head = page.locator('meta[name="layout-head"]')
    await goto('/en/layout-page/1', { waitUntil: 'hydration' })
    await expect(head).toHaveAttribute('content', 'My App')

    // step 1: same chunk, another page: the head stays, and the layout's params reach the switcher
    await push(page, '/en/layout-page/2')
    await expect(page.locator('#layout-page')).toHaveText('layout-2')
    await expect(head).toHaveAttribute('content', 'My App')
    await expect(page.locator('.switcher-locale-de').first()).toHaveAttribute('href', '/de/layout-page/layout-2')

    // step 2: another locale: the getter follows
    await push(page, '/de/layout-page/2')
    await expect(page.locator('#layout-page')).toHaveText('layout-2')
    await expect(head).toHaveAttribute('content', 'Meine App')

    // step 3: a page of another layout: that layout's head goes with it
    await push(page, '/de/page-a')
    await expect(page).toHaveURL('/de/page-a')
    await expect(head).toHaveCount(0)
  })

  test('a redirected link adds its history entry', async ({ page, goto }) => {
    // /de/page-a, then b, then an unprefixed push the middleware redirects: Back goes to b, not past it
    await goto('/de/page-a', { waitUntil: 'hydration' })
    await push(page, '/de/page-b')
    await expect(page).toHaveURL('/de/page-b')
    await push(page, '/contact')
    await expect(page).toHaveURL('/de/kontakt')
    await page.goBack()
    await expect(page).toHaveURL('/de/page-b')
  })

  test('a late answer of an abandoned page stays off the shown one', async ({ page, goto }) => {
    await goto('/en/page-a', { waitUntil: 'hydration' })
    const release = await hold(page, '**/api/slug/2')
    await push(page, '/en/slug-late/2')
    await page.waitForTimeout(150)
    await push(page, '/en/slug/1')
    await expect(page.locator('#slug-page')).toHaveText('slug-1')
    expect(await switchPath(page)).toBe('/de/slug/1-eins')
    await release()
    await page.waitForTimeout(300)
    expect(await switchPath(page)).toBe('/de/slug/1-eins')
  })

  test('a navigation during hydration leaves no server head tags', async ({ page, goto }) => {
    await goto('/en/leave-on-mount/1', { waitUntil: 'hydration' })
    await expect(page.locator('#leave-page')).toHaveText('leave-2')
    await expect.poll(() => ogTitles(page)).toEqual([])
  })

  test('keepalive: a page returned to has its params and head', async ({ page, goto }) => {
    await goto('/en/slug/1', { waitUntil: 'hydration' })
    await push(page, '/en/slug/2')
    await expect(page.locator('#slug-page')).toHaveText('slug-2')
    await expect.poll(() => ogTitles(page)).toEqual(['SLUG-2'])
    await page.goBack()
    await expect(page.locator('#slug-page')).toHaveText('slug-1')
    await expect.poll(() => switchPath(page)).toBe('/de/slug/1-eins')
    await expect.poll(() => ogTitles(page)).toEqual(['SLUG-1'])
  })
})

// The client's first render has the params from the payload: the server's links must be the same, on every strategy.
const SWITCHERS = [
  { harness: 'strategy-no-prefix', path: '/slug/1', en: '/slug/1-one', de: '/slug/1-eins', ru: '/slug/1-odin' },
  { harness: 'strategy-prefix-except-default', path: '/slug/1', en: '/slug/1-one', de: '/de/slug/1-eins', ru: '/ru/slug/1-odin' },
  { harness: 'strategy-prefix-and-default', path: '/en/slug/1', en: '/en/slug/1-one', de: '/de/slug/1-eins', ru: '/ru/slug/1-odin' },
] as const

for (const { harness, path, ...links } of SWITCHERS) {
  describe(`journey: translated slugs with a switcher in the layout (${harness})`, () => {
    test.override({ harness })

    test('each switcher link is its locale, a plain link is the page, hydration is clean', async ({ page, goto, baseURL }) => {
      const { html } = await ssr(baseURL, path)
      for (const [code, href] of Object.entries(links)) expect(html).toContain(`class="switcher-locale-${code}" href="${href}"`)
      expect(html).toMatch(new RegExp(`href="${path}"[^>]*id="slug-first"`))

      // the guard fails the test on a hydration warning
      await goto(path, { waitUntil: 'hydration' })
      for (const [code, href] of Object.entries(links)) await expect(page.locator(`.switcher-locale-${code}`).first()).toHaveAttribute('href', href)
      await expect(page.locator('#slug-first')).toHaveAttribute('href', path)
    })
  })
}

describe('journey: server components take the locale as a prop (prefix)', () => {
  test.override({ harness: 'strategy-islands' })

  for (const kind of ['server', 'nuxt-island']) {
    test(`${kind}: the URL's locale, and a switch`, async ({ page, goto }) => {
      await goto(`/de/island/${kind}`, { waitUntil: 'hydration' })
      await expect(page.locator('#island')).toHaveText(/\|de$/)
      await page.click('button[data-locale="ru"]')
      await expect(page).toHaveURL(`/ru/island/${kind}`)
      await expect(page.locator('#island')).toHaveText(/\|ru$/)
    })
  }
})
