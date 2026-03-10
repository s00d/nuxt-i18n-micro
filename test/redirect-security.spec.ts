import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/redirect-security', import.meta.url)),
  },
})

test.describe('redirect with render:response hook', () => {
  test('GET / redirects to /en without server header mutation error', async ({ page, goto }) => {
    const responses: { url: string; status: number }[] = []
    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
      })
    })

    await goto('/', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/en')
    await expect(page.locator('#content')).toHaveText('en')

    const rootResponse = responses.find((response) => new URL(response.url).pathname === '/')
    expect(rootResponse).toBeDefined()
    expect(rootResponse!.status).toBe(302)
  })
})
