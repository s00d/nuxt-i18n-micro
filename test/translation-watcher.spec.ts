import { afterAll, describe, expect, test } from 'untestutils/vitest'
import {
  createTranslationWatcherFiles,
  refreshTranslationWatcherPage,
  translationWatcherFixtureRoot,
  waitForTranslationHtmlValue,
  waitForTranslationPayloadValue,
} from './helpers/translation-watcher-hmr'

// Each spec mutates ITS OWN fixture's locale files (they run in parallel).
const files = createTranslationWatcherFiles(translationWatcherFixtureRoot)

describe('translation watcher dev HMR (premerged)', () => {
  test.override({ harness: 'translation-watcher' })

  afterAll(() => {
    files.restoreAll()
  })

  test('updates page translations after a page locale file change', async ({ page, goto, baseURL }) => {
    await goto('/en/about', { waitUntil: 'hydration' })
    await expect(page.locator('#about-title')).toHaveText('About EN')

    files.patchFile('pages/about/en.json', (current) => ({
      ...current,
      aboutTitle: 'About EN HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'about', 'en', 'aboutTitle', 'About EN HMR')
    await refreshTranslationWatcherPage(goto, '/en/about')
    await expect(page.locator('#about-title')).toHaveText('About EN HMR')
  })

  test('updates root translations on index and about after a root locale file change', async ({ page, goto, baseURL }) => {
    await goto('/en', { waitUntil: 'hydration' })
    await expect(page.locator('#shared-root')).toHaveText('Shared EN')

    files.patchFile('en.json', (current) => ({
      ...current,
      sharedRoot: 'Shared EN HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'sharedRoot', 'Shared EN HMR')
    await waitForTranslationPayloadValue(baseURL!, 'about', 'en', 'sharedRoot', 'Shared EN HMR')

    await refreshTranslationWatcherPage(goto, '/en')
    await expect(page.locator('#shared-root')).toHaveText('Shared EN HMR')

    await goto('/en/about', { waitUntil: 'hydration' })
    await expect(page.locator('#shared-root')).toHaveText('Shared EN HMR')
  })

  test('applies root translation changes to SSR HTML', async ({ baseURL }) => {
    files.patchFile('en.json', (current) => ({
      ...current,
      hello: 'Hello EN SSR HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'hello', 'Hello EN SSR HMR')
    await waitForTranslationHtmlValue(`${baseURL}en`, '#hello', 'Hello EN SSR HMR')
  })

  test('applies page translation changes during client navigation', async ({ page, goto, baseURL }) => {
    await goto('/en', { waitUntil: 'hydration' })
    await expect(page.locator('#index-title')).toHaveText('Home EN')

    files.patchFile('pages/about/en.json', (current) => ({
      ...current,
      aboutTitle: 'About EN Client HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'about', 'en', 'aboutTitle', 'About EN Client HMR')

    // Patching a locale file makes the dev server push an HMR update, and it can land
    // at any point around the navigation: before the click (the link re-renders and
    // the click is lost), or after it (the destination re-mounts and the assertion
    // races the remount). Retry the whole hop from a known starting point rather than
    // assuming any single attempt survives — the thing under test is that a client
    // navigation picks up the new translation, which each attempt still exercises.
    await expect(async () => {
      await goto('/en', { waitUntil: 'hydration' })
      await page.click('#go-about')
      await page.waitForURL('**/en/about', { timeout: 5_000 })
      await expect(page.locator('#about-title')).toHaveText('About EN Client HMR', { timeout: 5_000 })
    }).toPass({ timeout: 90_000 })
  })

  test('updates German page translations after a locale file change', async ({ page, goto, baseURL }) => {
    // The preceding test leaves an HMR update in flight, and it can land on this page while
    // it is loading — the document reloads and the locator resolves against a detached
    // frame. Same retry as the client-navigation test above, for the same reason: retry from
    // a known starting point instead of assuming the first load survives.
    await expect(async () => {
      await goto('/de/about', { waitUntil: 'hydration' })
      await expect(page.locator('#about-title')).toHaveText('About DE', { timeout: 5_000 })
    }).toPass({ timeout: 90_000 })

    files.patchFile('pages/about/de.json', (current) => ({
      ...current,
      aboutTitle: 'About DE HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'about', 'de', 'aboutTitle', 'About DE HMR')
    await refreshTranslationWatcherPage(goto, '/de/about')
    await expect(page.locator('#about-title')).toHaveText('About DE HMR')
  })

  test('merges additionalTranslationDirs roots and hot-reloads them', async ({ page, goto, baseURL }) => {
    // Earlier tests in this file mutate locales/en.json; reset roots so asserts stay deterministic.
    files.patchFixtureFile('common/en.json', () => ({
      fromCommon: 'From Common EN',
      deep: { a: { x: 1, y: 2 } },
    }))
    files.patchFile('en.json', () => ({
      hello: 'Hello EN',
      sharedRoot: 'Shared EN',
      deep: { a: { y: 99, z: 3 } },
    }))

    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'fromCommon', 'From Common EN')
    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'sharedRoot', 'Shared EN')

    await goto('/en', { waitUntil: 'hydration' })
    await expect(page.locator('#from-common')).toHaveText('From Common EN')
    await expect(page.locator('#deep-x')).toHaveText('1')
    await expect(page.locator('#deep-y')).toHaveText('99')
    await expect(page.locator('#deep-z')).toHaveText('3')

    files.patchFixtureFile('common/en.json', (current) => ({
      ...current,
      fromCommon: 'From Common EN HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'fromCommon', 'From Common EN HMR')
    await waitForTranslationPayloadValue(baseURL!, 'about', 'en', 'fromCommon', 'From Common EN HMR')

    await refreshTranslationWatcherPage(goto, '/en')
    await expect(page.locator('#from-common')).toHaveText('From Common EN HMR')
    // Primary keys must survive additional-dir HMR.
    await expect(page.locator('#shared-root')).toHaveText('Shared EN')
  })

  test('primary root HMR keeps additional keys and deep-merges nested objects', async ({ page, goto, baseURL }) => {
    files.patchFixtureFile('common/en.json', () => ({
      fromCommon: 'From Common EN',
      deep: { a: { x: 1, y: 2 } },
    }))
    files.patchFile('en.json', () => ({
      hello: 'Hello EN',
      sharedRoot: 'Shared EN',
      deep: { a: { y: 99, z: 3 } },
    }))

    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'fromCommon', 'From Common EN')
    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'sharedRoot', 'Shared EN')

    files.patchFile('en.json', (current) => {
      const deep = (current.deep as Record<string, unknown>) ?? {}
      const a = (deep.a as Record<string, unknown>) ?? {}
      return {
        ...current,
        sharedRoot: 'Shared EN Nested HMR',
        deep: { a: { ...a, y: 77, z: 8 } },
      }
    })

    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'sharedRoot', 'Shared EN Nested HMR')

    const response = await fetch(new URL('_locales/index/en/data.json', baseURL!.endsWith('/') ? baseURL! : `${baseURL}/`))
    expect(response.ok).toBe(true)
    const payload = (await response.json()) as Record<string, unknown>
    const deep = payload.deep as Record<string, unknown> | undefined
    expect(payload.fromCommon).toBe('From Common EN')
    expect(deep?.a).toEqual({ x: 1, y: 77, z: 8 })

    await refreshTranslationWatcherPage(goto, '/en')
    await expect(page.locator('#from-common')).toHaveText('From Common EN')
    await expect(page.locator('#shared-root')).toHaveText('Shared EN Nested HMR')
    await expect(page.locator('#deep-x')).toHaveText('1')
    await expect(page.locator('#deep-y')).toHaveText('77')
    await expect(page.locator('#deep-z')).toHaveText('8')
  })
})

describe('additionalTranslationDirs (prod server)', () => {
  // Same fixture root as the HMR suite above; keep this describe after it so mutations are restored first.
  test.override({ harness: 'translation-watcher-prod' })

  test('merges common into UI, primary wins, ignores additional pages/', async ({ page, goto, baseURL }) => {
    const normalizedBase = baseURL!.endsWith('/') ? baseURL! : `${baseURL}/`
    const indexRes = await fetch(new URL('_locales/index/en/data.json', normalizedBase))
    expect(indexRes.ok).toBe(true)
    const index = (await indexRes.json()) as Record<string, unknown>
    expect(index).toMatchObject({
      fromCommon: 'From Common EN',
      sharedRoot: 'Shared EN',
      hello: 'Hello EN',
      deep: { a: { x: 1, y: 99, z: 3 } },
    })
    expect(index.leak).toBeUndefined()

    await goto('/en', { waitUntil: 'hydration' })
    await expect(page.locator('#from-common')).toHaveText('From Common EN')
    await expect(page.locator('#shared-root')).toHaveText('Shared EN')
    await expect(page.locator('#deep-x')).toHaveText('1')
    await expect(page.locator('#deep-y')).toHaveText('99')
    await expect(page.locator('#deep-z')).toHaveText('3')
    await expect(page.locator('#leak')).toHaveText('missing')
  })

  test('supports locale that exists only in additional dirs', async ({ page, goto, baseURL }) => {
    const normalizedBase = baseURL!.endsWith('/') ? baseURL! : `${baseURL}/`
    const indexRes = await fetch(new URL('_locales/index/fr/data.json', normalizedBase))
    expect(indexRes.ok).toBe(true)
    const index = (await indexRes.json()) as Record<string, unknown>
    // fr has no locales/fr.json — only common/fr.json (+ global fallbackLocale en).
    expect(index).toMatchObject({
      fromCommon: 'From Common FR',
      onlyCommon: 'C-fr',
      deep: { a: { x: 10, y: 20 } },
      // from fallbackLocale en:
      sharedRoot: 'Shared EN',
      hello: 'Hello EN',
    })

    await goto('/fr', { waitUntil: 'hydration' })
    await expect(page.locator('#from-common')).toHaveText('From Common FR')
    await expect(page.locator('#only-common')).toHaveText('C-fr')
  })
})
