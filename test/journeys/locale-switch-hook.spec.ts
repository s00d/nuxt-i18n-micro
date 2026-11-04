import type { Page } from '@playwright/test'
import { describe, expect, test } from '../helpers/guarded-test.ts'

// strategy fixture, plugins/locale-switch-probe.client.ts: with `?switch-probe` it subscribes to i18n:beforeLocaleSwitch
// (window.__i18nSwitch.rule decides) and records what a `watch(() => $getLocale())` sees when it fires.

interface Probe {
  calls: { from: string; to: string }[]
  watched: { locale: string; text: string; lang: string }[]
  rule: { cancel?: string[]; redirect?: Record<string, string> }
}

declare const useNuxtApp: () => {
  $router: { push: (to: string) => Promise<unknown> }
  $switchLocale: (locale: string) => Promise<boolean>
  $getLocale: () => string
}
declare const window: { __i18nSwitch: Probe }

const probe = (page: Page) => page.evaluate(() => window.__i18nSwitch)
const switchTo = (page: Page, locale: string) => page.evaluate((code) => useNuxtApp().$switchLocale(code), locale)

for (const [harness, start, de] of [
  ['strategy-prefix-except-default', '/contact', '/de/kontakt'],
  ['strategy-no-prefix', '/contact', '/kontakt'],
] as const) {
  describe(`journey: watch(() => $getLocale()) (${harness})`, () => {
    test.override({ harness })

    test('fires once the new locale is applied: its dictionary answers', async ({ page, goto }) => {
      await goto(`${start}?switch-probe`, { waitUntil: 'hydration' })
      expect(await switchTo(page, 'de')).toBe(true)
      await expect(page).toHaveURL(new RegExp(`${de}(\\?|$)`))
      await expect.poll(async () => (await probe(page)).watched.at(-1)?.locale).toBe('de')
      // the dictionary of the new locale is in place when the watcher runs
      expect((await probe(page)).watched.map(({ locale, text }) => ({ locale, text }))).toEqual([{ locale: 'de', text: 'de' }])
    })
  })
}

const setRule = (page: Page, rule: Probe['rule']) =>
  page.evaluate((value) => {
    window.__i18nSwitch.rule = value
  }, rule)
const cookie = async (page: Page) => (await page.context().cookies()).find((entry) => entry.name === 'user-locale')?.value || undefined
const contentLocale = (page: Page) => page.evaluate(() => useNuxtApp().$getLocale())

for (const [harness, urls] of [
  ['strategy-prefix-except-default', { en: '/contact', de: '/de/kontakt', ru: '/ru/contact' }],
  ['strategy-no-prefix', { en: '/contact', de: '/kontakt', ru: '/contact' }],
] as const) {
  describe(`journey: i18n:beforeLocaleSwitch (${harness})`, () => {
    test.override({ harness })

    test('cancel keeps page and preference; a redirect switches to the chosen locale; no rule is a plain switch; one call each', async ({
      page,
      goto,
    }) => {
      await goto(`${urls.en}?switch-probe`, { waitUntil: 'hydration' })
      const before = await cookie(page)

      // step 1: cancel → $switchLocale resolves false, nothing moves, nothing stored
      await setRule(page, { cancel: ['de'] })
      expect(await switchTo(page, 'de')).toBe(false)
      await page.waitForTimeout(100)
      await expect(page).toHaveURL(new RegExp(`${urls.en}(\\?|$)`))
      expect(await contentLocale(page)).toBe('en')
      expect(await cookie(page)).toBe(before)
      expect((await probe(page)).calls).toEqual([{ from: 'en', to: 'de' }])

      // step 2: a redirect de → ru: the page shows ru and stores it
      await setRule(page, { redirect: { de: 'ru' } })
      // a switch happened, to the locale the hook chose: true, under every strategy
      expect(await switchTo(page, 'de')).toBe(true)
      await expect.poll(() => contentLocale(page)).toBe('ru')
      await expect(page).toHaveURL(new RegExp(`${urls.ru}(\\?|$)`))
      await expect.poll(() => cookie(page)).toBe('ru')
      // an invalid locale from a subscriber is ignored: it is a plain switch
      await setRule(page, { redirect: { en: 'xx' } })
      expect(await switchTo(page, 'en')).toBe(true)
      await expect.poll(() => contentLocale(page)).toBe('en')

      // step 3: no rule → a plain switch; each switch asked once
      await setRule(page, {})
      expect(await switchTo(page, 'de')).toBe(true)
      await expect(page).toHaveURL(new RegExp(`${urls.de}(\\?|$)`))
      expect((await probe(page)).calls).toEqual([
        { from: 'en', to: 'de' },
        { from: 'en', to: 'de' },
        { from: 'ru', to: 'en' },
        { from: 'en', to: 'de' },
      ])
    })
  })
}

describe('journey: i18n:beforeLocaleSwitch on a link (strategy-prefix-except-default)', () => {
  test.override({ harness: 'strategy-prefix-except-default' })

  test('a navigation into another locale asks too; cancel stays on the page', async ({ page, goto }) => {
    await goto('/contact?switch-probe', { waitUntil: 'hydration' })
    await setRule(page, { cancel: ['ru'] })
    await page.evaluate(() => useNuxtApp().$router.push('/ru/contact'))
    await page.waitForTimeout(100)
    await expect(page).toHaveURL(/\/contact(\?|$)/)
    // a navigation within the locale asks nothing
    await page.evaluate(() => useNuxtApp().$router.push('/page-a'))
    await expect(page).toHaveURL(/\/page-a$/)
    expect((await probe(page)).calls).toEqual([{ from: 'en', to: 'ru' }])
  })
})

describe('journey: no subscriber (strategy-prefix-except-default)', () => {
  test.override({ harness: 'strategy-prefix-except-default' })

  test('a switch without a subscriber works as before', async ({ page, goto }) => {
    await goto('/contact', { waitUntil: 'hydration' })
    expect(await switchTo(page, 'de')).toBe(true)
    await expect(page).toHaveURL('/de/kontakt')
  })
})
