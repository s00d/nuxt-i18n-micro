import type { Page } from '@playwright/test'
import { describe, expect, test } from '../helpers/guarded-test.ts'

// strategy fixture under prefix. A new layout can finish after its page does (`layouts/slow.vue` has async work), so the
// old page outlives `page:finish`: its keys have to resolve for as long as it is on screen. Read on every animation frame.

declare global {
  interface Window {
    __frames: string[]
  }
}
declare const useNuxtApp: () => { $router: { push: (to: string) => Promise<unknown> } }

const recordFrames = (page: Page) =>
  page.evaluate(() => {
    window.__frames = []
    const read = () => {
      window.__frames.push(document.body.innerText)
      requestAnimationFrame(read)
    }
    read()
  })
const push = (page: Page, to: string) =>
  page.evaluate((path) => {
    void useNuxtApp().$router.push(path)
  }, to)
const rawKeys = (page: Page) => page.evaluate(() => window.__frames.filter((text) => /layout(Fast|Slow)\.title/.test(text)).length)

describe('journey: a layout change keeps the leaving page readable (prefix)', () => {
  test.override({ harness: 'strategy-prefix' })

  test('no frame shows a raw key while the new layout loads', async ({ page, goto }) => {
    await goto('/en/layout-fast', { waitUntil: 'hydration' })
    await recordFrames(page)
    await push(page, '/en/layout-slow')
    await expect(page.locator('#layout-slow')).toHaveText('Slow page EN')
    await expect(page.locator('#layout-fast')).toHaveCount(0)
    expect(await rawKeys(page)).toBe(0)

    await push(page, '/en/layout-fast')
    await expect(page.locator('#layout-fast')).toHaveText('Fast page EN')
    expect(await rawKeys(page)).toBe(0)
  })

  test('no frame shows a raw key during a layout transition', async ({ page, goto }) => {
    await goto('/en/layout-fast', { waitUntil: 'hydration' })
    await recordFrames(page)
    await push(page, '/en/layout-fade')
    await expect(page.locator('#slow-layout')).toBeAttached()
    await expect(page.locator('#layout-fast')).toHaveCount(0)
    expect(await rawKeys(page)).toBe(0)
  })

  test('the leaving keys stop resolving once it has gone', async ({ page, goto }) => {
    await goto('/en/layout-fast', { waitUntil: 'hydration' })
    await push(page, '/en/layout-slow')
    await expect(page.locator('#layout-fast')).toHaveCount(0)
    await page.waitForFunction(() => (useNuxtApp() as unknown as { $t: (key: string) => unknown }).$t('layoutFast.title') === 'layoutFast.title')
  })
})
