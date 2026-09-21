import { getLocaleCookie } from 'untestutils/utils'
import { describe, expect, test } from 'untestutils/vitest'

describe('cookie-replace', () => {
  test.override({ harness: 'cookie-custom-name' })
  test('redirect to / and set custom locale cookie when navigating to /de', async ({ page, goto }) => {
    await goto('/de', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/')
    expect(await getLocaleCookie(page, 'user-change-cookie')).toBe('en')
  })
})
