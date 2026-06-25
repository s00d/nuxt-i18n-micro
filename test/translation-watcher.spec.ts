import { expect, test } from '@nuxt/test-utils/playwright'
import {
  patchTranslationWatcherFile,
  refreshTranslationWatcherPage,
  restoreTranslationWatcherFiles,
  translationWatcherFixtureRoot,
  waitForTranslationHtmlValue,
  waitForTranslationPayloadValue,
} from './helpers/translation-watcher-hmr'

test.describe.configure({ mode: 'serial', timeout: 120_000 })

test.use({
  nuxt: {
    rootDir: translationWatcherFixtureRoot,
    dev: true,
    setupTimeout: 180_000,
  },
})

test.afterAll(() => {
  restoreTranslationWatcherFiles()
})

test.describe('translation watcher dev HMR (premerged)', () => {
  test('updates page translations after a page locale file change', async ({ page, goto, baseURL }) => {
    await goto('/en/about', { waitUntil: 'hydration' })
    await expect(page.locator('#about-title')).toHaveText('About EN')

    patchTranslationWatcherFile('pages/about/en.json', (current) => ({
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

    patchTranslationWatcherFile('en.json', (current) => ({
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
    patchTranslationWatcherFile('en.json', (current) => ({
      ...current,
      hello: 'Hello EN SSR HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'index', 'en', 'hello', 'Hello EN SSR HMR')
    await waitForTranslationHtmlValue(`${baseURL}en`, '#hello', 'Hello EN SSR HMR')
  })

  test('applies page translation changes during client navigation', async ({ page, goto, baseURL }) => {
    await goto('/en', { waitUntil: 'hydration' })
    await expect(page.locator('#index-title')).toHaveText('Home EN')

    patchTranslationWatcherFile('pages/about/en.json', (current) => ({
      ...current,
      aboutTitle: 'About EN Client HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'about', 'en', 'aboutTitle', 'About EN Client HMR')
    await page.click('#go-about')
    await page.waitForURL('**/en/about')
    await expect(page.locator('#about-title')).toHaveText('About EN Client HMR')
  })

  test('updates German page translations after a locale file change', async ({ page, goto, baseURL }) => {
    await goto('/de/about', { waitUntil: 'hydration' })
    await expect(page.locator('#about-title')).toHaveText('About DE')

    patchTranslationWatcherFile('pages/about/de.json', (current) => ({
      ...current,
      aboutTitle: 'About DE HMR',
    }))

    await waitForTranslationPayloadValue(baseURL!, 'about', 'de', 'aboutTitle', 'About DE HMR')
    await refreshTranslationWatcherPage(goto, '/de/about')
    await expect(page.locator('#about-title')).toHaveText('About DE HMR')
  })
})
