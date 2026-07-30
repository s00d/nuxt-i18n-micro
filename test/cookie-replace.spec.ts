import { describe, expect, setupE2E, test } from './setup/vitest-e2e'

await setupE2E({ shared: 'cookie-custom-name' })

describe('cookie-replace', () => {
  test('redirect to / and set custom locale cookie when navigating to /de', async ({ page, goto }) => {
    // Go to the /de page directly
    await goto('/de', { waitUntil: 'hydration' })

    // Check that the URL is redirected to /
    await expect(page).toHaveURL('/')

    // Check that the custom cookie is set to default locale after redirect
    const cookies = await page.context().cookies()
    const userLocaleCookie = cookies.find((cookie) => cookie.name === 'user-change-cookie')

    expect(userLocaleCookie).toBeDefined()
    expect(userLocaleCookie?.value).toBe('en')
  })
})
