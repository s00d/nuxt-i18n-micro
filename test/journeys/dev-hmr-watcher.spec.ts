import { afterAll, describe, expect, test } from '../helpers/guarded-test.ts'
import { gotoSettled, resetHmr, type PayloadValue } from '../helpers/journeys-d'
import { createTranslationWatcherFiles, waitForTranslationHtmlValue, waitForTranslationPayloadValue } from '../helpers/translation-watcher-hmr'
import { translationWatcherTmpRoots } from '../recipes.ts'

// Patches only the temp copy behind `translation-watcher-tmp`; the repo fixture is never written.
const files = createTranslationWatcherFiles(translationWatcherTmpRoots.watcher)

const PRISTINE: PayloadValue[] = [
  ['index', 'en', 'hello', 'Hello EN'],
  ['index', 'en', 'sharedRoot', 'Shared EN'],
  ['index', 'en', 'fromCommon', 'From Common EN'],
  ['index', 'en', 'fromVendor', 'From Vendor EN'],
  ['about', 'en', 'aboutTitle', 'About EN'],
  ['about', 'de', 'aboutTitle', 'About DE'],
]

// above the 60 s of one HMR poll: a stuck step fails with its own message, not the test's timeout
describe('J10 dev HMR: translation watcher (premerged)', { timeout: 240_000 }, () => {
  // a dictionary fetch an HMR reload cuts off is a cut-off fetch for the guard: let through with evidence, not by pattern
  test.override({ harness: 'translation-watcher-tmp' })

  afterAll(() => {
    files.restoreAll()
  })

  test('edit locale files while browsing', async ({ page, goto, baseURL }) => {
    // step 0: restore the pristine files (order-independent) → payload serves them
    await resetHmr(files, baseURL!, PRISTINE)

    // step 1: open /en/about → About EN; mark the window to detect a reload
    await gotoSettled(page, goto, baseURL!, '/en/about', '#about-title', 'About EN')
    await page.evaluate(() => {
      ;(window as { __noReload?: boolean }).__noReload = true
    })

    // step 2: patch pages/about/en.json → text updates in place, no reload, payload serves it
    // was: translation-watcher › applies a page locale edit in place; › updates page translations after a page locale file change
    // macOS FSEvents can deliver a file event seconds late or drop it, so Vite never calls hotUpdate: write again until
    // the page has it. A broken HMR path still fails: no write updates the page, and a reload clears __noReload.
    await expect(async () => {
      files.patchFile('pages/about/en.json', (current) => ({ ...current, aboutTitle: 'About EN live' }))
      await expect(page.locator('#about-title')).toHaveText('About EN live', { timeout: 2_000 })
    }).toPass({ timeout: 30_000 })
    expect(await page.evaluate(() => (window as { __noReload?: boolean }).__noReload)).toBe(true)
    await waitForTranslationPayloadValue(baseURL!, 'about', 'en', 'aboutTitle', 'About EN live')
    await gotoSettled(page, goto, baseURL!, '/en/about', '#about-title', 'About EN live')

    // step 3: patch root en.json sharedRoot → payload index + about → /en and /en/about show it
    // was: translation-watcher › updates root translations on index and about after a root locale file change
    files.patchFile('en.json', (current) => ({ ...current, sharedRoot: 'Shared EN HMR' }))
    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'sharedRoot', 'Shared EN HMR')
    await waitForTranslationPayloadValue(baseURL!, 'about', 'en', 'sharedRoot', 'Shared EN HMR')
    await gotoSettled(page, goto, baseURL!, '/en', '#shared-root', 'Shared EN HMR')
    await gotoSettled(page, goto, baseURL!, '/en/about', '#shared-root', 'Shared EN HMR')

    // step 4: patch root hello → SSR HTML of /en has it
    // was: translation-watcher › applies root translation changes to SSR HTML
    files.patchFile('en.json', (current) => ({ ...current, hello: 'Hello EN SSR HMR' }))
    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'hello', 'Hello EN SSR HMR')
    await waitForTranslationHtmlValue(`${baseURL}en`, '#hello', 'Hello EN SSR HMR')

    // step 5: patch about en again → a client navigation /en → #go-about picks it up
    // was: translation-watcher › applies page translation changes during client navigation
    files.patchFile('pages/about/en.json', (current) => ({ ...current, aboutTitle: 'About EN Client HMR' }))
    await waitForTranslationPayloadValue(baseURL!, 'about', 'en', 'aboutTitle', 'About EN Client HMR')
    // the HMR push can land before the click (lost click) or after it (remount): retry the whole hop
    await expect(async () => {
      await goto('/en', { waitUntil: 'hydration' })
      await expect(page.locator('#index-title')).toHaveText('Home EN', { timeout: 5_000 })
      await page.click('#go-about')
      await page.waitForURL('**/en/about', { timeout: 5_000 })
      await expect(page.locator('#about-title')).toHaveText('About EN Client HMR', { timeout: 5_000 })
    }).toPass({ timeout: 90_000 })

    // step 6: /de/about → About DE; patch de → payload → reload shows it
    // was: translation-watcher › updates German page translations after a locale file change
    await gotoSettled(page, goto, baseURL!, '/de/about', '#about-title', 'About DE')
    files.patchFile('pages/about/de.json', (current) => ({ ...current, aboutTitle: 'About DE HMR' }))
    await waitForTranslationPayloadValue(baseURL!, 'about', 'de', 'aboutTitle', 'About DE HMR')
    await gotoSettled(page, goto, baseURL!, '/de/about', '#about-title', 'About DE HMR')
  })

  test('additionalTranslationDirs merge and hot-reload', async ({ page, goto, baseURL }) => {
    // step 0: restore the pristine files (order-independent) → payload serves them
    await resetHmr(files, baseURL!, PRISTINE)

    // step 1: open /en → from common, deep merge x/y/z = 1/99/3
    // was: translation-watcher › merges additionalTranslationDirs roots and hot-reloads them
    await gotoSettled(page, goto, baseURL!, '/en', '#from-common', 'From Common EN')
    await expect(page.locator('#deep-x')).toHaveText('1')
    await expect(page.locator('#deep-y')).toHaveText('99')
    await expect(page.locator('#deep-z')).toHaveText('3')

    // step 2: patch common/en.json → payload index + about → /en shows it, primary key kept
    files.patchFixtureFile('common/en.json', (current) => ({ ...current, fromCommon: 'From Common EN HMR' }))
    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'fromCommon', 'From Common EN HMR')
    await waitForTranslationPayloadValue(baseURL!, 'about', 'en', 'fromCommon', 'From Common EN HMR')
    await gotoSettled(page, goto, baseURL!, '/en', '#from-common', 'From Common EN HMR')
    await expect(page.locator('#shared-root')).toHaveText('Shared EN')

    // step 3: patch root deep.a + sharedRoot → payload deep-merged, additional key kept → /en shows it
    // was: translation-watcher › primary root HMR keeps additional keys and deep-merges nested objects
    files.patchFile('en.json', (current) => {
      const deep = current.deep as { a: Record<string, unknown> }
      return { ...current, sharedRoot: 'Shared EN Nested HMR', deep: { a: { ...deep.a, y: 77, z: 8 } } }
    })
    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'sharedRoot', 'Shared EN Nested HMR')
    const response = await fetch(new URL('_locales/index/en/data.json', baseURL!.endsWith('/') ? baseURL! : `${baseURL}/`))
    expect(response.ok).toBe(true)
    const payload = (await response.json()) as { fromCommon: string; deep: { a: unknown } }
    expect(payload.fromCommon).toBe('From Common EN HMR')
    expect(payload.deep.a).toEqual({ x: 1, y: 77, z: 8 })
    await gotoSettled(page, goto, baseURL!, '/en', '#shared-root', 'Shared EN Nested HMR')
    await expect(page.locator('#from-common')).toHaveText('From Common EN HMR')
    await expect(page.locator('#deep-x')).toHaveText('1')
    await expect(page.locator('#deep-y')).toHaveText('77')
    await expect(page.locator('#deep-z')).toHaveText('8')

    // step 4: the absolute folder a module listed after i18n added: merged, and hot-reloaded like `common`
    await expect(page.locator('#from-vendor')).toHaveText('From Vendor EN')
    files.patchFixtureFile('vendor/locales/en.json', (current) => ({ ...current, fromVendor: 'From Vendor EN HMR' }))
    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'fromVendor', 'From Vendor EN HMR')
    await gotoSettled(page, goto, baseURL!, '/en', '#from-vendor', 'From Vendor EN HMR')
  })
})
