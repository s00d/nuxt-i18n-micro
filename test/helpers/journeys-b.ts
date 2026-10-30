import type { Page } from '@playwright/test'
import { collectConsole, collectHydrationIssues, getLocaleCookie } from 'untestutils/utils'
import { expect } from 'untestutils/vitest'

type Goto = (path: string, options?: Record<string, unknown>) => Promise<unknown>

/** Expected URLs of one strategy along the shared walk (J2). */
export interface StrategyWalkRow {
  /** Where `goto('/')` lands. */
  home: string
  /** `#contact` from `home`. */
  contact: string
  /** Page to open before the switcher (prefix_and_default: `/en`); defaults to `home`. */
  switchFrom?: string
  /** URL after the switcher's de link. */
  deHome: string
  /** `#contact` from `deHome`. */
  deContact: string
}

/**
 * Stateless SSR request: Playwright's `request` fixture keeps a cookie jar across calls
 * (a set-cookie from one detection case would leak into the next), so header-sensitive reads use fetch.
 */
export async function ssr(baseURL: string, path: string, headers: Record<string, string> = {}) {
  const res = await fetch(new URL(path, baseURL), { headers, redirect: 'manual' })
  return { status: res.status, location: res.headers.get('location'), html: await res.text() }
}

export async function walkStrategy(page: Page, goto: Goto, row: StrategyWalkRow) {
  // step 1: open / → lands on row.home, content en
  await goto('/', { waitUntil: 'hydration' })
  await expect(page).toHaveURL(row.home)
  await expect(page.locator('#content')).toHaveText('en')

  // step 2: click #contact → row.contact; back → row.home
  await page.click('#contact')
  await expect(page).toHaveURL(row.contact)
  await page.goBack()
  await expect(page).toHaveURL(row.home)

  // step 3 (prefix_and_default only): open the prefixed default home → en
  if (row.switchFrom) {
    await goto(row.switchFrom, { waitUntil: 'hydration' })
    await expect(page).toHaveURL(row.switchFrom)
    await expect(page.locator('#content')).toHaveText('en')
  }

  // step 4: switcher → de → row.deHome, content de (was: waitForTimeout(500))
  await page.click('.language-switcher')
  await page.click('a.switcher-locale-de')
  await expect(page).toHaveURL(row.deHome)
  await expect(page.locator('#content')).toHaveText('de')

  // step 5: click #contact → row.deContact
  await page.click('#contact')
  await expect(page).toHaveURL(row.deContact)
}

/**
 * The force-locale server plugin (header `x-test-force-locale`) sets `useState('i18n-locale')` and the cookie.
 * was: locale-state* › server plugin sets locale / no hydration mismatch / cookie not overwritten / no 404 custom-fallback-route
 */
export async function forcedLocale(page: Page, goto: Goto, expectedUrl: string) {
  // step 1: header ru + console collectors armed before the first goto
  await page.setExtraHTTPHeaders({ 'x-test-force-locale': 'ru' })
  const hydration = collectHydrationIssues(page)
  const cookieOverridden = collectConsole(page, (msg) => msg.text().includes('cookie') && msg.text().includes('overridden'))
  const fallback404 = collectConsole(page, (msg) => msg.text().includes('custom-fallback-route') && msg.text().includes('404'))

  // step 2: open / → expectedUrl, content ru, cookie user-locale=ru
  await goto('/', { waitUntil: 'hydration' })
  await expect(page).toHaveURL(expectedUrl)
  await expect(page.locator('#content')).toHaveText('ru')
  await expect.poll(() => getLocaleCookie(page)).toBe('ru')

  // step 3: settled page → no hydration issue, no cookie override warning, no fallback-route 404
  hydration.stop()
  cookieOverridden.stop()
  fallback404.stop()
  expect(hydration.messages).toEqual([])
  expect(cookieOverridden.messages).toEqual([])
  expect(fallback404.messages).toEqual([])
}

/** J5 pages:false — the locale comes from the cookie only. was: pages-false(-no-prefix) › default / cookie zh / invalid cookie / cleared cookie */
export async function pagesFalseCookieCases(page: Page, goto: Goto, baseURL: string) {
  // step 1: no cookie → en Hello
  await goto('/', { waitUntil: 'hydration' })
  await expect(page.locator('#locale')).toHaveText('en')
  await expect(page.locator('#greeting')).toHaveText('Hello')

  // step 2: cookie zh → zh 你好
  await page.context().clearCookies()
  await page.context().addCookies([{ name: 'user-locale', value: 'zh', url: baseURL }])
  await goto('/', { waitUntil: 'hydration' })
  await expect(page.locator('#locale')).toHaveText('zh')
  await expect(page.locator('#greeting')).toHaveText('你好')

  // step 3: cookie invalid-locale → falls back to en Hello
  await page.context().clearCookies()
  await page.context().addCookies([{ name: 'user-locale', value: 'invalid-locale', url: baseURL }])
  await goto('/', { waitUntil: 'hydration' })
  await expect(page.locator('#locale')).toHaveText('en')
  await expect(page.locator('#greeting')).toHaveText('Hello')
}
