import { afterAll, describe, test } from '../helpers/guarded-test.ts'
import { gotoSettled, resetHmr } from '../helpers/journeys-d'
import { createTranslationWatcherFiles, waitForTranslationPayloadValue } from '../helpers/translation-watcher-hmr'
import { translationWatcherTmpRoots } from '../recipes.ts'

// Patches only the temp copy behind `translation-watcher-source-tmp`; the repo fixture is never written.
const files = createTranslationWatcherFiles(translationWatcherTmpRoots.source)

describe('J10 dev HMR: translation watcher (payload mode source)', () => {
  test.override({ harness: 'translation-watcher-source-tmp' })

  afterAll(() => {
    files.restoreAll()
  })

  test('page edit at runtime, de fallback chain after a root edit', async ({ page, goto, baseURL }) => {
    // step 0: restore the pristine files (order-independent) → payload serves them
    await resetHmr(files, baseURL!, [
      ['about', 'en', 'aboutTitle', 'About EN'],
      ['about', 'de', 'hello', 'Hallo DE'],
    ])

    // step 1: open /en/about → About EN
    await gotoSettled(page, goto, baseURL!, '/en/about', '#about-title', 'About EN')

    // step 2: patch pages/about/en.json → API route merges it → reload shows it
    // was: translation-watcher-source › merges updated page translations at runtime through the API route
    files.patchFile('pages/about/en.json', (current) => ({ ...current, aboutTitle: 'About EN Source HMR' }))
    await waitForTranslationPayloadValue(baseURL!, 'about', 'en', 'aboutTitle', 'About EN Source HMR')
    await gotoSettled(page, goto, baseURL!, '/en/about', '#about-title', 'About EN Source HMR')

    // step 3: patch root de.json hello → de about payload has it and keeps its page key
    // was: translation-watcher-source › applies fallback chain when refreshing German payloads after a root locale change
    files.patchFile('de.json', (current) => ({ ...current, hello: 'Hallo DE Source HMR' }))
    await waitForTranslationPayloadValue(baseURL!, 'about', 'de', 'hello', 'Hallo DE Source HMR')
    await waitForTranslationPayloadValue(baseURL!, 'about', 'de', 'aboutTitle', 'About DE')
  })
})
