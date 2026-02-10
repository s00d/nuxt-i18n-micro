import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

// ── prefix strategy: redirect at runtime (SSR server) ──────────────────────
test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/strategy', import.meta.url)),
    nuxtConfig: {
      i18n: {
        strategy: 'prefix',
        localeCookie: 'user-locale',
      },
    },
  },
})

test.describe('prefix strategy — runtime redirect from /', () => {
  test('GET / returns 302 redirect to /en (no cookie)', async ({ page, goto }) => {
    await page.context().clearCookies()

    // Track HTTP responses
    const responses: { url: string; status: number }[] = []
    page.on('response', (resp) => {
      responses.push({ url: resp.url(), status: resp.status() })
    })

    await goto('/', { waitUntil: 'hydration' })

    // Should end up on /en
    await expect(page).toHaveURL('/en')
    await expect(page.locator('#content')).toHaveText('en')

    // The root `/` response should be a redirect (302), NOT a 404 or 500
    const rootResponse = responses.find((r) => new URL(r.url).pathname === '/')
    expect(rootResponse).toBeDefined()
    expect(rootResponse!.status).toBe(302)
  })

  test('GET / with cookie=de redirects to /de', async ({ page, goto, baseURL }) => {
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL! }])

    const responses: { url: string; status: number }[] = []
    page.on('response', (resp) => {
      responses.push({ url: resp.url(), status: resp.status() })
    })

    await goto('/', { waitUntil: 'hydration' })

    // Should redirect to /de
    await expect(page).toHaveURL('/de')
    await expect(page.locator('#content')).toHaveText('de')

    // Root `/` must be 302
    const rootResponse = responses.find((r) => new URL(r.url).pathname === '/')
    expect(rootResponse).toBeDefined()
    expect(rootResponse!.status).toBe(302)
  })

  test('GET /en does not redirect — stays on /en', async ({ page, goto }) => {
    await page.context().clearCookies()

    const responses: { url: string; status: number }[] = []
    page.on('response', (resp) => {
      responses.push({ url: resp.url(), status: resp.status() })
    })

    await goto('/en', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/en')
    await expect(page.locator('#content')).toHaveText('en')

    // /en should return 200, not a redirect
    const enResponse = responses.find((r) => new URL(r.url).pathname === '/en')
    expect(enResponse).toBeDefined()
    expect(enResponse!.status).toBe(200)
  })

  test('GET /de does not redirect — stays on /de', async ({ page, goto }) => {
    await page.context().clearCookies()

    await goto('/de', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/de')
    await expect(page.locator('#content')).toHaveText('de')
  })

  test('GET /en/contact stays on /en/contact (200)', async ({ page, goto }) => {
    await page.context().clearCookies()

    const responses: { url: string; status: number }[] = []
    page.on('response', (resp) => {
      responses.push({ url: resp.url(), status: resp.status() })
    })

    await goto('/en/contact', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/en/contact')

    const contactResponse = responses.find((r) => new URL(r.url).pathname === '/en/contact')
    expect(contactResponse).toBeDefined()
    expect(contactResponse!.status).toBe(200)
  })
})
