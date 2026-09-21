import { setLocaleCookie, clearCookies } from 'untestutils/utils'
import { describe, expect, test } from 'untestutils/vitest'

// Tests for 'prefix' strategy (fixtures/named has strategy: 'prefix', defaultLocale: 'de')

describe('cookie-based redirect - prefix strategy', () => {
  test.override({ harness: 'named' })

  test('redirect to cookie locale when valid', async ({ page, goto, baseURL }) => {
    await setLocaleCookie(page, baseURL!, 'en')
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/en')
  })

  test('fallback to defaultLocale when cookie has invalid locale', async ({ page, goto, baseURL }) => {
    // 'fr' is not in locales: ['de', 'en']
    await setLocaleCookie(page, baseURL!, 'fr')
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
  })

  test('fallback to defaultLocale when cookie is empty', async ({ page, goto }) => {
    await clearCookies(page)
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
  })

  test('cookie with valid non-default locale works', async ({ page, goto, baseURL }) => {
    await setLocaleCookie(page, baseURL!, 'en')
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/en')
    await expect(page.locator('#localized-route-2')).toHaveText('/en/page/id-222?info=1111')
  })
})
