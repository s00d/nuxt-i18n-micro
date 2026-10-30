import type { Page } from '@playwright/test'
import { describe, expect, test } from 'untestutils/vitest'

async function switchTo(page: Page, code: string) {
  await page.click('.language-switcher')
  await page.click(`a.switcher-locale-${code}`)
  await expect(page).toHaveURL(`/${code}/fallback`)
}

// `basic-serverless` (basic, BASIC_VARIANT=serverless): global fallbackLocale en, fr falls back to de; /fallback reads root and page keys.
describe('J8 translation loading: fallbackLocale', () => {
  test.override({ harness: 'basic-serverless' })

  // was: fallback-locale › verify fallbackLocale functionality and content update when switching
  test('global and per-locale fallback chain, by switcher and by direct load', async ({ page, goto }) => {
    // step 1: open /fallback → en texts, arrays and array of objects
    await goto('/fallback', { waitUntil: 'hydration' })
    await expect(page.locator('.welcome')).toHaveText('Welcome to the page!')
    await expect(page.locator('.title')).toHaveText('Page Title!')
    await expect(page.locator('.global')).toHaveText('global en')
    await expect(page.locator('.page')).toHaveText('page en')
    await expect(page.locator('.arr')).toHaveText('[ "aaaa", "bbbb", "cccc" ]')
    await expect(page.locator('.arr_obj')).toHaveText('[ { "key1": "val" }, { "key2": "val2" } ]')

    // step 2: switch to de → de texts, title falls back to en
    await switchTo(page, 'de')
    await expect(page.locator('.welcome')).toHaveText('Willkommen auf der Seite!')
    await expect(page.locator('.title')).toHaveText('Page Title!')
    await expect(page.locator('.global')).toHaveText('global de')
    await expect(page.locator('.page')).toHaveText('page de')

    // step 3: load /de/fallback directly → same texts plus de arrays
    await goto('/de/fallback', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de/fallback')
    await expect(page.locator('.welcome')).toHaveText('Willkommen auf der Seite!')
    await expect(page.locator('.title')).toHaveText('Page Title!')
    await expect(page.locator('.arr')).toHaveText('[ "dddd" ]')
    await expect(page.locator('.arr_obj')).toHaveText('[ { "key": "vvvv" } ]')
    await expect(page.locator('.global')).toHaveText('global de')
    await expect(page.locator('.page')).toHaveText('page de')

    // step 4: switch to fr → per-locale fallback de
    await switchTo(page, 'fr')
    await expect(page.locator('.global')).toHaveText('global de')
    await expect(page.locator('.page')).toHaveText('page de')

    // step 5: load /fr/fallback directly → still de
    await goto('/fr/fallback', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/fr/fallback')
    await expect(page.locator('.global')).toHaveText('global de')
    await expect(page.locator('.page')).toHaveText('page de')
  })
})
