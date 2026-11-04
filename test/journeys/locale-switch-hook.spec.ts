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
