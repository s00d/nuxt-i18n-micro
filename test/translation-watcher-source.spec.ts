import { expect, test } from '@nuxt/test-utils/playwright'
import {
  patchTranslationWatcherFile,
  restoreTranslationWatcherFiles,
  translationWatcherFixtureRoot,
  waitForTranslationPayloadValue,
} from './helpers/translation-watcher-hmr'

test.describe.configure({ mode: 'serial', timeout: 120_000 })

test.use({
  nuxt: {
    rootDir: translationWatcherFixtureRoot,
    dev: true,
    setupTimeout: 180_000,
    nuxtConfig: {
      i18n: {
        translationPayloads: { mode: 'source' },
      },
    },
  },
})

test.afterAll(() => {
  restoreTranslationWatcherFiles()
})

test.describe('translation watcher dev HMR (source mode)', () => {
  test('merges updated page translations at runtime through the API route', async ({ page, goto, baseURL }) => {
    await goto('/en/about', { waitUntil: 'hydration' })
    await expect(page.locator('#about-title')).toHaveText('About EN')

    patchTranslationWatcherFile('pages/about/en.json', (current) => ({
      ...current,
      aboutTitle: 'About EN Source HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'about', 'en', 'aboutTitle', 'About EN Source HMR')
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('#about-title')).toHaveText('About EN Source HMR')
  })

  test('applies fallback chain when refreshing German payloads after a root locale change', async ({ baseURL }) => {
    patchTranslationWatcherFile('de.json', (current) => ({
      ...current,
      hello: 'Hallo DE Source HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'about', 'de', 'hello', 'Hallo DE Source HMR')
    await waitForTranslationPayloadValue(baseURL!, 'about', 'de', 'aboutTitle', 'About DE')
  })
})
