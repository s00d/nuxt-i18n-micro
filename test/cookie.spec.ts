import { getLocaleCookie } from 'untestutils/utils'
import { describe, expect, test } from 'untestutils/vitest'

describe('cookie', () => {
  test.override({ harness: 'cookie-default' })
  test('redirect to / and set default locale cookie when navigating to /de', async ({ page, goto }) => {
    await goto('/de', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/')
    expect(await getLocaleCookie(page)).toBe('en')
  })
})
