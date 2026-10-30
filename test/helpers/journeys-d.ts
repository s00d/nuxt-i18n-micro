import type { Page } from '@playwright/test'
import { expect } from 'untestutils/vitest'
import type { createTranslationWatcherFiles } from './translation-watcher-hmr'
import { waitForTranslationHtmlValue, waitForTranslationPayloadValue } from './translation-watcher-hmr'

type Files = ReturnType<typeof createTranslationWatcherFiles>
type Goto = (path: string, options?: { waitUntil?: 'hydration' }) => Promise<unknown>

/** [page, locale, key, pristine value] — what the payload API must serve again after a reset. */
export type PayloadValue = [string, string, string, string]

/**
 * Restore every locale file a previous test patched, then wait until the dev server serves
 * the pristine values again, so each HMR test starts from the same state in any order.
 */
export async function resetHmr(files: Files, baseURL: string, pristine: PayloadValue[]): Promise<void> {
  files.restoreAll()
  for (const [pageName, locale, key, value] of pristine) {
    await waitForTranslationPayloadValue(baseURL, pageName, locale, key, value)
  }
}

/**
 * Load a page and check one text, retried as a whole: an HMR update still in flight
 * (from a patch or a reset) can reload the document mid-load. Callers first wait for the
 * payload API to serve `text`, so the window only covers that reload; wrong text fails fast.
 */
export async function gotoSettled(page: Page, goto: Goto, baseURL: string, path: string, selector: string, text: string): Promise<void> {
  // the SSR chunk cache drops on the watcher event: a render before it would not hydrate against the live payload
  await waitForTranslationHtmlValue(new URL(path, baseURL).href, selector, text)
  await expect(async () => {
    await goto(path, { waitUntil: 'hydration' })
    await expect(page.locator(selector)).toHaveText(text, { timeout: 5_000 })
  }).toPass({ timeout: 20_000 })
}
