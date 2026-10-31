import type { Page } from '@playwright/test'
import { describe, expect, test } from '../helpers/guarded-test.ts'

// strategy fixture, pec. A `$localeRoute` object goes through the router: its URL has to be the one a reload reads back.
// `.path` alone hides the bug this pins, as the path was right and the router built another URL from name and params.

declare const useNuxtApp: () => {
  $router: { push: (to: unknown) => Promise<unknown>; currentRoute: { value: { path: string; fullPath: string; params: Record<string, unknown> } } }
  $localeRoute: (to: unknown, locale?: string) => { path: string; fullPath: string }
  $switchRoute: (to: unknown, locale?: string) => Promise<void>
}

const VALUES: [string, string][] = [
  ['a b', 'a%20b'],
  ['a/b', 'a%2Fb'],
  ['a?b', 'a%3Fb'],
  ['a#b', 'a%23b'],
  ['a%b', 'a%25b'],
  ['новости', '%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%B8'],
]

const push = (page: Page, id: string, extra = {}) =>
  page.evaluate(
    ([value, more]) => useNuxtApp().$router.push(useNuxtApp().$localeRoute({ name: 'echo-id', params: { id: value }, ...(more as object) }, 'de')),
    [id, extra] as const,
  )
const current = (page: Page) =>
  page.evaluate(() => {
    const { path, fullPath, params } = useNuxtApp().$router.currentRoute.value
    return { path, fullPath, id: params.id }
  })

describe('journey: a route object keeps its encoding (prefix_except_default)', () => {
  test.override({ harness: 'strategy-prefix-except-default' })

  test('router.push gives the URL of its path, and a reload lands on the same page', async ({ page, goto }) => {
    for (const [id, encoded] of VALUES) {
      await goto('/de', { waitUntil: 'hydration' })
      await push(page, id)
      await expect(page.locator('#echo')).toHaveText(id)
      const pushed = await current(page)
      expect(pushed).toEqual({ path: `/de/echo/${encoded}`, fullPath: `/de/echo/${encoded}`, id })
      expect(await page.evaluate(() => location.pathname)).toBe(pushed.path)

      // Nitro decodes the path and Nuxt 4.5 encodes it again for SSR: on any app `%25` comes back as `%2525` and `%3F` as a query
      if (/[%?]/.test(id)) continue
      await page.reload()
      await page.waitForFunction(() => useNuxtApp().$router.currentRoute.value.path.length > 0)
      await expect(page.locator('#echo')).toHaveText(id)
      expect(await current(page)).toEqual(pushed)
    }
  })

  test('query and hash stay on the way through the router', async ({ page, goto }) => {
    await goto('/de', { waitUntil: 'hydration' })
    await push(page, 'a/b', { query: { q: 'x y' }, hash: '#top' })
    await expect(page.locator('#echo')).toHaveText('a/b')
    expect(await page.evaluate(() => location.pathname + location.search + location.hash)).toBe('/de/echo/a%2Fb?q=x+y#top')
  })

  test.for([
    ['plain', 'plain', 'localized-echo-id'],
    ['a b', 'a%20b', 'path form'],
    ['a/b', 'a%2Fb', 'path form'],
    ['новости', '%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%B8', 'path form'],
  ] as const)('kept in state, it renders on both sides and leads to one URL: %s', async ([id, encoded, form], { page, goto }) => {
    const url = `/de/echo/${encoded}`
    const at = `/de/route-object?id=${encodeURIComponent(id)}`

    // step 1: server rendered, then hydrated: the guard fails this test on a 500 or a hydration warning
    const res = await page.request.get(at)
    expect(res.status()).toBe(200)
    await goto(at, { waitUntil: 'hydration' })
    await expect(page.locator('#ro-held')).toHaveText(url)
    await expect(page.locator('#ro-state')).toHaveText(`${form}|${url}`)
    for (const link of ['ro-i18n-link', 'ro-ref', 'ro-reactive', 'ro-spread', 'ro-json', 'ro-usestate']) {
      await expect(page.locator(`#${link}`)).toHaveAttribute('href', url)
      await page.locator(`#${link}`).click()
      await expect(page.locator('#echo')).toHaveText(id)
      expect(await current(page)).toEqual({ path: url, fullPath: url, id })
      await page.goBack()
      await expect(page.locator('#ro-held')).toHaveText(url)
    }

    // step 2: navigateTo
    await page.locator('#ro-navigate').click()
    await expect(page.locator('#echo')).toHaveText(id)
    expect(await current(page)).toEqual({ path: url, fullPath: url, id })

    // step 3: reached by client navigation, with no server render of it
    await page.evaluate((to) => useNuxtApp().$router.push(to), at)
    await expect(page.locator('#ro-state')).toHaveText(`${form}|${url}`)
  })

  test('a spread with a new query keeps it through $switchRoute', async ({ page, goto }) => {
    for (const [id, encoded] of [
      ['plain', 'plain'],
      ['a b', 'a%20b'],
    ] as const) {
      await goto('/de', { waitUntil: 'hydration' })
      await page.evaluate(
        (value) => useNuxtApp().$switchRoute({ ...useNuxtApp().$localeRoute({ name: 'echo-id', params: { id: value } }), query: { x: '1' } }, 'ru'),
        id,
      )
      await expect(page.locator('#echo')).toHaveText(id)
      expect(await page.evaluate(() => location.pathname + location.search)).toBe(`/ru/echo/${encoded}?x=1`)
    }
  })

  test('a NuxtLink renders it and follows it', async ({ page, goto }) => {
    await goto('/de/named', { waitUntil: 'hydration' })
    const link = page.locator('#link-encoded')
    await expect(link).toHaveAttribute('href', '/de/echo/a%20b%2Fc')
    await link.click()
    await expect(page.locator('#echo')).toHaveText('a b/c')
    expect(await page.evaluate(() => location.pathname)).toBe('/de/echo/a%20b%2Fc')
  })
})
