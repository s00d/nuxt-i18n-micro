import type { Page } from '@playwright/test'
import { describe, expect, test } from '../helpers/guarded-test.ts'

// strategy fixture under prefix. A new layout can finish after its page does (`layouts/slow.vue` has async work), so the
// old page outlives `page:finish`: its keys have to resolve for as long as it is on screen. Read on every animation frame.

declare global {
  interface Window {
    __frames: string[]
    /** Frame callbacks asked for, and observers live, by anything but the recorder. */
    __work: { frames: number; observers: number }
    __refs: { page: WeakRef<object>; element: WeakRef<object> }
  }
}
declare const useNuxtApp: () => {
  $router: { push: (to: string) => Promise<unknown>; currentRoute: { value: { matched: { instances: { default: { $el: object } } }[] } } }
  $has: (key: string) => boolean
}

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
const rawKeys = (page: Page) =>
  page.evaluate(
    () => window.__frames.filter((text) => /layout(Fast|Slow|Source)\.title|nest\.parent|nestChild\.title|keepPage\.title/.test(text)).length,
  )
const has = (page: Page, key: string) => page.evaluate((name) => useNuxtApp().$has(name), key)
/** Count what the module could leave running: frame callbacks and observers. */
const countWork = (page: Page) =>
  page.addInitScript(() => {
    window.__work = { frames: 0, observers: 0 }
    const frame = window.requestAnimationFrame
    window.requestAnimationFrame = (callback) => {
      window.__work.frames++
      return frame.call(window, callback)
    }
    const { observe, disconnect } = MutationObserver.prototype
    const live = new WeakSet<object>()
    MutationObserver.prototype.observe = function (...args) {
      if (!live.has(this)) window.__work.observers++
      live.add(this)
      return observe.apply(this, args)
    }
    MutationObserver.prototype.disconnect = function () {
      if (live.delete(this)) window.__work.observers--
      return disconnect.call(this)
    }
  })
/** Nothing left running: no frame requested over 300 ms, no observer of the module alive. */
async function expectIdle(page: Page, observers: number) {
  const before = await page.evaluate(() => ({ ...window.__work }))
  await page.waitForTimeout(300)
  const after = await page.evaluate(() => ({ ...window.__work }))
  expect(after.frames - before.frames).toBe(0)
  expect(after.observers).toBe(observers)
}

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
    await goto('/en/layout-source', { waitUntil: 'hydration' })
    await recordFrames(page)
    await push(page, '/en/layout-fade')
    await expect(page.locator('#layout-fade')).toBeAttached()
    await expect(page.locator('#layout-source')).toHaveCount(0)
    // the old page has to be seen beside the new one, or the leave never ran and this test proves nothing
    expect(await page.evaluate(() => window.__frames.some((text) => text.includes('Source page EN') && text.includes('fade')))).toBe(true)
    expect(await rawKeys(page)).toBe(0)
  })

  test('a parent stays with its keys while its child comes, and nothing keeps running', async ({ page, goto }) => {
    await countWork(page)
    await goto('/en/nest', { waitUntil: 'hydration' })
    const observers = await page.evaluate(() => window.__work.observers)
    await push(page, '/en/nest/child')
    await expect(page.locator('#nest-child')).toHaveText('Child EN')
    await expect(page.locator('#nest-parent')).toHaveText('Parent EN')
    await expectIdle(page, observers)
    await expect(page.locator('#nest-parent')).toHaveText('Parent EN')
  })

  test('a parent with an index child stays with its keys too', async ({ page, goto }) => {
    await goto('/en/nest-index', { waitUntil: 'hydration' })
    await expect(page.locator('#nest-index-home')).toHaveText('Home EN')
    await recordFrames(page)
    await push(page, '/en/nest-index/child')
    await expect(page.locator('#nest-index-child')).toHaveText('child')
    await page.waitForTimeout(100)
    await expect(page.locator('#nest-index-parent')).toHaveText('Parent EN')
    expect(await page.evaluate(() => window.__frames.filter((text) => text.includes('nestIndex.parent')).length)).toBe(0)
  })

  test('a child goes back to its parent: both read, and the child keys stop', async ({ page, goto }) => {
    await goto('/en/nest', { waitUntil: 'hydration' })
    await push(page, '/en/nest/child')
    await expect(page.locator('#nest-child')).toHaveText('Child EN')
    await recordFrames(page)
    await push(page, '/en/nest')
    await expect(page.locator('#nest-child')).toHaveCount(0)
    await expect(page.locator('#nest-parent')).toHaveText('Parent EN')
    expect(await rawKeys(page)).toBe(0)
    await expect.poll(() => has(page, 'nestChild.title')).toBe(false)
  })

  test('leaving the parent ends it all', async ({ page, goto }) => {
    await countWork(page)
    await goto('/en/nest', { waitUntil: 'hydration' })
    const observers = await page.evaluate(() => window.__work.observers)
    await push(page, '/en/nest/child')
    await expect(page.locator('#nest-child')).toHaveText('Child EN')
    await push(page, '/en/page-b')
    await expect(page.locator('#nest-parent')).toHaveCount(0)
    await expect.poll(() => has(page, 'nest.parent')).toBe(false)
    await expectIdle(page, observers)
  })

  test('a kept-alive page leaves like any other, and comes back', async ({ page, goto }) => {
    await countWork(page)
    await goto('/en/keep-page', { waitUntil: 'hydration' })
    const observers = await page.evaluate(() => window.__work.observers)
    await push(page, '/en/layout-fast')
    await expect(page.locator('#layout-fast')).toHaveText('Fast page EN')
    await expect.poll(() => has(page, 'keepPage.title')).toBe(false)
    await expectIdle(page, observers)
    await push(page, '/en/keep-page')
    await expect(page.locator('#keep-page')).toHaveText('Keep EN')
  })

  test('nothing holds a page that left', async ({ page, goto }) => {
    await goto('/en/layout-fast', { waitUntil: 'hydration' })
    await page.evaluate(() => {
      const instance = useNuxtApp().$router.currentRoute.value.matched.at(-1)!.instances.default
      window.__refs = { page: new WeakRef(instance), element: new WeakRef(instance.$el) }
    })
    await push(page, '/en/page-b')
    await expect(page.locator('#layout-fast')).toHaveCount(0)
    await page.waitForTimeout(100)
    await page.requestGC()
    expect(await page.evaluate(() => [window.__refs.page.deref() === undefined, window.__refs.element.deref() === undefined])).toEqual([true, true])
  })

  test('the leaving keys stop resolving once it has gone', async ({ page, goto }) => {
    await goto('/en/layout-fast', { waitUntil: 'hydration' })
    await push(page, '/en/layout-slow')
    await expect(page.locator('#layout-fast')).toHaveCount(0)
    await page.waitForFunction(() => (useNuxtApp() as unknown as { $t: (key: string) => unknown }).$t('layoutFast.title') === 'layoutFast.title')
  })
})
