import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/cookie', import.meta.url)),
    nuxtConfig: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      i18n: {
        localeCookie: 'user-change-cookie',
        autoDetectPath: '*',
      },
    },
  },
})
test.describe('cookie-replace', () => {
  test('redirect to / and set custom locale cookie when navigating to /de', async ({ page, goto }) => {
    // Go to the /de page directly
    await goto('/de', { waitUntil: 'hydration' })

    // Check that the URL is redirected to /
    await expect(page).toHaveURL('/')

    // Check that the cookie 'user-change-cookie' is set to 'de'
    const cookies = await page.context().cookies()
    const userLocaleCookie = cookies.find(cookie => cookie.name === 'user-change-cookie')

    expect(userLocaleCookie).toBeDefined() // Ensure the cookie exists
    expect(userLocaleCookie?.value).toBe('en') // Ensure the cookie value is 'de'
  })
})
