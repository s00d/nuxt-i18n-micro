import { getLocaleCookie } from 'untestutils/utils'
import { describe, expect, test } from 'untestutils/vitest'

describe('J5 detection: default cookie (cookie-default, pec, no detection)', () => {
  test.override({ harness: 'cookie-default' })

  // was: cookie › /de → / + cookie en
  test('C-T1 /de redirects to / and writes the default cookie', async ({ page, goto }) => {
    // step 1: open /de → /, cookie user-locale=en
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/')
    await expect.poll(() => getLocaleCookie(page)).toBe('en')
  })
})
