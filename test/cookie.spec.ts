import { describe, expect, setupE2E, test } from './setup/vitest-e2e'

await setupE2E({ shared: 'cookie-default' })

describe('cookie', () => {
  test('redirect to / and set default locale cookie when navigating to /de', async ({ page, goto }) => {
    // Go to the /de page directly
    await goto('/de', { waitUntil: 'hydration' })

    // Check that the URL is redirected to /
    await expect(page).toHaveURL('/')

    // Check that the cookie 'user-locale' is set to default locale after redirect
    const cookies = await page.context().cookies()
    const userLocaleCookie = cookies.find((cookie) => cookie.name === 'user-locale')

    expect(userLocaleCookie).toBeDefined()
    expect(userLocaleCookie?.value).toBe('en')
  })
})
