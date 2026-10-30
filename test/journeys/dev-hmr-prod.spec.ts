import { describe, expect, test } from '../helpers/guarded-test.ts'

// Production build of the pristine repo fixture; nothing edits it (the HMR journeys patch tmp copies).
describe('J10 additionalTranslationDirs (prod server)', () => {
  test.override({ harness: 'translation-watcher-prod' })

  test('additional dirs merged, primary wins, pages/ ignored, additional-only locale', async ({ page, goto, request }) => {
    // step 1: GET _locales/index/en → merged, primary wins, no leak from additional pages/
    // was: translation-watcher › additionalTranslationDirs (prod server) › merges common into UI, primary wins, ignores additional pages/
    const en = await request.get('/_locales/index/en/data.json')
    expect(en.ok()).toBe(true)
    const enIndex = (await en.json()) as Record<string, unknown>
    expect(enIndex).toMatchObject({
      fromCommon: 'From Common EN',
      sharedRoot: 'Shared EN',
      hello: 'Hello EN',
      deep: { a: { x: 1, y: 99, z: 3 } },
    })
    expect(enIndex.leak).toBeUndefined()

    // step 2: open /en → the merged texts render, leak falls back to its default
    await goto('/en', { waitUntil: 'hydration' })
    await expect(page.locator('#from-common')).toHaveText('From Common EN')
    await expect(page.locator('#shared-root')).toHaveText('Shared EN')
    await expect(page.locator('#deep-x')).toHaveText('1')
    await expect(page.locator('#deep-y')).toHaveText('99')
    await expect(page.locator('#deep-z')).toHaveText('3')
    await expect(page.locator('#leak')).toHaveText('missing')

    // step 3: GET _locales/index/fr → only common/fr.json + global fallback en
    // was: translation-watcher › additionalTranslationDirs (prod server) › supports locale that exists only in additional dirs
    const fr = await request.get('/_locales/index/fr/data.json')
    expect(fr.ok()).toBe(true)
    expect(await fr.json()).toMatchObject({
      fromCommon: 'From Common FR',
      onlyCommon: 'C-fr',
      deep: { a: { x: 10, y: 20 } },
      sharedRoot: 'Shared EN',
      hello: 'Hello EN',
    })

    // step 4: open /fr → the additional-only texts render
    await goto('/fr', { waitUntil: 'hydration' })
    await expect(page.locator('#from-common')).toHaveText('From Common FR')
    await expect(page.locator('#only-common')).toHaveText('C-fr')
  })
})
