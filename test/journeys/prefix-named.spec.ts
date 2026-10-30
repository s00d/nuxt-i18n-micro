import type { Page } from '@playwright/test'
import { describe, expect, test } from 'untestutils/vitest'

type Goto = (path: string, options?: Record<string, unknown>) => Promise<unknown>

/** Named-route links and buttons on the locale home; each hop restarts from `home`. was: named-params › links and buttons */
async function namedLinks(page: Page, goto: Goto, home: string) {
  // step 2: localeRoute / localePath with params + query
  await expect(page.locator('#localized-route-2')).toHaveText(`${home}/page/id-222?info=1111`)
  await expect(page.locator('#localized-path')).toHaveText(`${home}/page/id-222?info=1111`)

  // step 3a: #link1 (NuxtLink, name page) → page/my-id
  await page.click('#link1')
  await expect(page).toHaveURL(`${home}/page/my-id`)

  // step 3b: #link2 (NuxtLink, name test-id) → test-my-id
  await goto(home, { waitUntil: 'hydration' })
  await page.click('#link2')
  await expect(page).toHaveURL(`${home}/test-my-id`)

  // step 3c: #link3 (navigateTo, name page) → page/my-id
  await goto(home, { waitUntil: 'hydration' })
  await page.click('#link3')
  await expect(page).toHaveURL(`${home}/page/my-id`)

  // step 3d: #link4 (navigateTo, name test-id) → test-my-id
  await goto(home, { waitUntil: 'hydration' })
  await page.click('#link4')
  await expect(page).toHaveURL(`${home}/test-my-id`)

  // step 3e: #link6 (string path) → page/id-123
  await goto(home, { waitUntil: 'hydration' })
  await page.click('#link6')
  await expect(page).toHaveURL(`${home}/page/id-123`)
}

describe('J3 prefix strategy with default de (named)', () => {
  test.override({ harness: 'named' })

  // was: named-params › links and buttons (de); cookie-redirect › empty cookie
  test('T1 default-locale visitor', async ({ page, goto }) => {
    // step 1: no cookie, open / → /de
    await page.context().clearCookies()
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')

    // steps 2–3: localized routes and links under /de
    await namedLinks(page, goto, '/de')
  })

  // was: named-params › links and buttons (en); cookie-redirect › valid cookie / invalid cookie / valid non-default
  test('T2 returning English visitor', async ({ page, goto, baseURL }) => {
    // step 1: cookie en, open / → /en
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'en', url: baseURL }])
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/en')

    // steps 2–3: localized routes and links under /en
    await namedLinks(page, goto, '/en')

    // step 4: cookie fr (not a locale) → / falls back to /de
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'fr', url: baseURL }])
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
  })

  // was: transition-merge › A→B keeps A, B→A keeps B, deep merge common.fromA / common.fromB, locale switch no mixing
  test('T3 page transition keeps the outgoing page translations', async ({ page, goto }) => {
    // step 1: open /en/page-a → title, body, nested common key
    await goto('/en/page-a', { waitUntil: 'hydration' })
    await expect(page.locator('#page-a-title')).toHaveText('Page A Title EN')
    await expect(page.locator('#page-a-body')).toHaveText('Page A Body EN')
    await expect(page.locator('#page-a-common')).toHaveText('From A')

    // step 2: click #go-to-b → both pages attached mid-transition (precondition, was an `if (count > 0)` guard),
    // A still shows its translations, not raw keys; then A leaves and B is translated
    await page.click('#go-to-b')
    await expect(page).toHaveURL('/en/page-b')
    await expect(page.locator('#page-b-title')).toBeAttached()
    await expect(page.locator('#page-a-title')).toBeAttached()
    await expect(page.locator('#page-a-title')).toHaveText('Page A Title EN')
    await expect(page.locator('#page-a-common')).toHaveText('From A')
    await expect(page.locator('#page-a-title')).toHaveCount(0)
    await expect(page.locator('#page-b-title')).toHaveText('Page B Title EN')
    await expect(page.locator('#page-b-body')).toHaveText('Page B Body EN')
    await expect(page.locator('#page-b-common')).toHaveText('From B')

    // step 3: click #go-to-a → mirrored: B keeps its translations while leaving, then A is translated
    await page.click('#go-to-a')
    await expect(page).toHaveURL('/en/page-a')
    await expect(page.locator('#page-a-title')).toBeAttached()
    await expect(page.locator('#page-b-title')).toBeAttached()
    await expect(page.locator('#page-b-title')).toHaveText('Page B Title EN')
    await expect(page.locator('#page-b-common')).toHaveText('From B')
    await expect(page.locator('#page-b-title')).toHaveCount(0)
    await expect(page.locator('#page-a-title')).toHaveText('Page A Title EN')
    await expect(page.locator('#page-a-common')).toHaveText('From A')

    // step 4: open /de/page-a → de texts, shared root key in de (no cross-locale mixing)
    await goto('/de/page-a', { waitUntil: 'hydration' })
    await expect(page.locator('#page-a-title')).toHaveText('Seite A Titel DE')
    await expect(page.locator('#page-a-shared')).toHaveText('Shared DE')
  })
})
