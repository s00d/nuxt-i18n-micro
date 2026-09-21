import {
  createTranslationWatcherFiles,
  refreshTranslationWatcherPage,
  translationWatcherSourceFixtureRoot,
  waitForTranslationPayloadValue,
} from './helpers/translation-watcher-hmr'
import { afterAll, describe, expect, test } from 'untestutils/vitest'

// Each spec mutates ITS OWN fixture's locale files (they run in parallel).
const files = createTranslationWatcherFiles(translationWatcherSourceFixtureRoot)

afterAll(() => {
  files.restoreAll()
})

describe('translation watcher dev HMR (source mode)', () => {
  test.override({ harness: 'translation-watcher-source' })

  test('merges updated page translations at runtime through the API route', async ({ page, goto, baseURL }) => {
    await goto('/en/about', { waitUntil: 'hydration' })
    await expect(page.locator('#about-title')).toHaveText('About EN')

    files.patchFile('pages/about/en.json', (current) => ({
      ...current,
      aboutTitle: 'About EN Source HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'about', 'en', 'aboutTitle', 'About EN Source HMR')
    await refreshTranslationWatcherPage(goto, '/en/about')
    await expect(page.locator('#about-title')).toHaveText('About EN Source HMR')
  })

  test('applies fallback chain when refreshing German payloads after a root locale change', async ({ baseURL }) => {
    files.patchFile('de.json', (current) => ({
      ...current,
      hello: 'Hallo DE Source HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'about', 'de', 'hello', 'Hallo DE Source HMR')
    await waitForTranslationPayloadValue(baseURL!, 'about', 'de', 'aboutTitle', 'About DE')
  })
})
