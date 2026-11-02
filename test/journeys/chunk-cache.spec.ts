import { describe, expect, test } from '../helpers/guarded-test.ts'

declare const useNuxtApp: () => { $clearCache: () => void }
declare const fetchCalls: { url: string; cache?: string }[]

/** Dictionary requests of a page, as they leave. */
function watchChunks(page: import('@playwright/test').Page) {
  const urls: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/_locales/')) urls.push(new URL(request.url()).pathname)
  })
  return urls
}

describe('dictionaries: the cases Nuxt covers for its payload', () => {
  test.override({ harness: 'strategy-prefix' })

  // a guess at what is clicked next costs more than the one request a navigation makes
  test('a link in view loads no dictionary until it is followed', async ({ page, goto }) => {
    const urls = watchChunks(page)
    await goto('/en', { waitUntil: 'hydration' })
    await page.waitForLoadState('networkidle')
    expect(urls.filter((url) => url.includes('/about/'))).toEqual([])

    await page.locator('#about').click()
    await expect(page).toHaveURL(/\/en\/about/)
    expect(urls.filter((url) => url === '/_locales/about/en/data.json')).toHaveLength(1)
  })

  test('a failed fetch is tried again before it is a failed load', async ({ page, goto, guard }) => {
    guard.allow(/Failed to load resource.*\/_locales\//)
    let failures = 1
    await page.route('**/_locales/index/de/**', (route) => (failures-- > 0 ? route.fulfill({ status: 503, body: 'busy' }) : route.fallback()))
    await goto('/en', { waitUntil: 'hydration' })
    await page.locator('#switch-de').click()
    await expect(page.locator('#locale')).toHaveText('de')
    await expect(page.locator('.page-welcome')).not.toHaveText('page.welcome')
    expect(failures).toBeLessThan(0)
  })

  // a `max-age` would answer the refetch from the browser's copy, and the clear is for what changed behind it
  test('$clearCache revalidates what it loads', async ({ page, goto }) => {
    await page.addInitScript(() => {
      const calls: { url: string; cache?: string }[] = []
      Object.assign(window, { fetchCalls: calls })
      const original = window.fetch
      window.fetch = (input, init) => {
        calls.push({ url: String(input instanceof Request ? input.url : input), cache: init?.cache })
        return original(input, init)
      }
    })
    await goto('/en', { waitUntil: 'hydration' })
    await page.evaluate(() => useNuxtApp().$clearCache())
    await expect.poll(() => page.evaluate(() => fetchCalls.filter((call) => call.cache === 'no-cache').length)).toBeGreaterThan(0)
    await expect(page.locator('#content')).not.toHaveText('key0')
  })
})

describe('dictionaries: a page with no scripts', () => {
  test.override({ harness: 'strategy-no-scripts' })

  test('gets no hint for a file nothing reads', async ({ request }) => {
    const hint = /<link[^>]*_locales[^>]*>/
    expect(await (await request.get('/en')).text()).toMatch(hint)
    expect(await (await request.get('/en/about')).text()).not.toMatch(hint)
  })
})

describe('dictionaries: features.noScripts', () => {
  test.override({ harness: 'strategy-no-scripts-all' })

  test('no page gets a hint', async ({ request }) => {
    expect(await (await request.get('/en')).text()).not.toMatch(/<link[^>]*_locales[^>]*>/)
  })
})

describe('dictionaries: app.cdnURL', () => {
  test.override({ harness: 'strategy-cdn' })

  test('files come from the CDN, as the hint says', async ({ page, request, baseURL }) => {
    expect(await (await request.get('/en')).text()).toMatch(/<link[^>]*href="https:\/\/cdn\.test\/_locales\/index\/en\/data\.json/)
    const seen: string[] = []
    await page.route('https://cdn.test/**', async (route) => {
      const { pathname, search } = new URL(route.request().url())
      seen.push(pathname)
      const response = await route.fetch({ url: `${baseURL}${pathname.slice(1)}${search}` })
      await route.fulfill({ response, headers: { ...response.headers(), 'access-control-allow-origin': '*' } })
    })
    await page.goto(`${baseURL}en`)
    await expect(page.locator('#content')).not.toHaveText('key0')
    await expect.poll(() => seen.some((path) => path.startsWith('/_locales/index/en/'))).toBe(true)
    // a handler still answering when the test ends rejects after it, on a page that is gone
    await page.unrouteAll({ behavior: 'wait' })
  })
})
