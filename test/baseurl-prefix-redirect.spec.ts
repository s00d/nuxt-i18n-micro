import { describe, expect, setupE2E, test } from './setup/vitest-e2e'

await setupE2E({ shared: 'baseurl-prefix' })

describe('baseURL + prefix strategy redirect (#234)', () => {
  test('GET /examples redirects once to /examples/ja without loop', async ({ page, goto }) => {
    const responses: { url: string; status: number }[] = []
    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
      })
    })

    await goto('/examples', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/examples/ja')
    await expect(page.locator('#content')).toHaveText('home (ja)')

    const redirectResponses = responses.filter((r) => r.status >= 300 && r.status < 400)
    expect(redirectResponses.length).toBeLessThanOrEqual(1)
  })

  test('GET /examples/ja serves page without redirect', async ({ page, goto }) => {
    const responses: { url: string; status: number }[] = []
    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
      })
    })

    await goto('/examples/ja', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/examples/ja')
    await expect(page.locator('#content')).toHaveText('home (ja)')

    const redirectResponses = responses.filter((r) => r.status >= 300 && r.status < 400)
    expect(redirectResponses).toHaveLength(0)
  })

  test('GET /examples/en serves English locale without redirect loop', async ({ page, goto }) => {
    await goto('/examples/en', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/examples/en')
    await expect(page.locator('#content')).toHaveText('home (en)')
  })
})
