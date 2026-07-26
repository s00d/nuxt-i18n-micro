import { afterAll, describe, expect, setupE2E, test } from './setup/vitest-e2e'
import {
  createTranslationWatcherFiles,
  refreshTranslationWatcherPage,
  translationWatcherFixtureRoot,
  waitForTranslationHtmlValue,
  waitForTranslationPayloadValue,
} from './helpers/translation-watcher-hmr'

await setupE2E({
  rootDir: translationWatcherFixtureRoot,
  dev: true,
  setupTimeout: 180_000,
})

// Each spec mutates ITS OWN fixture's locale files (they run in parallel).
const files = createTranslationWatcherFiles(translationWatcherFixtureRoot)

describe('translation watcher dev HMR (premerged)', () => {
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

    // Patching a locale file makes the dev server push an HMR update, which can
    // re-render the link between the click and the navigation — the click is then
    // lost and a bare `waitForURL` sits there until it times out. Retry the click
    // instead of assuming the first one survives.
    await expect(async () => {
      await page.click('#go-about')
      await page.waitForURL('**/en/about', { timeout: 5_000 })
    }).toPass({ timeout: 60_000 })

    await expect(page.locator('#about-title')).toHaveText('About EN Client HMR')
  })

  test('updates German page translations after a locale file change', async ({ page, goto, baseURL }) => {
    await goto('/de/about', { waitUntil: 'hydration' })
    await expect(page.locator('#about-title')).toHaveText('About DE')

    files.patchFile('pages/about/de.json', (current) => ({
      ...current,
      aboutTitle: 'About DE HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'about', 'de', 'aboutTitle', 'About DE HMR')
    await refreshTranslationWatcherPage(goto, '/de/about')
    await expect(page.locator('#about-title')).toHaveText('About DE HMR')
  })
})
