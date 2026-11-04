import { readChunk } from '../helpers/chunk.ts'
import { describe, expect, test } from '../helpers/guarded-test.ts'

// translation-watcher fixture: en.json `linkedRoot: "@.upper:{'hello'}!"`, about/en.json `linkedPage: "@:aboutTitle / @:sharedRoot"`
for (const harness of ['translation-watcher-linked', 'translation-watcher-linked-source'] as const) {
  describe(`journey: linkedMessages (${harness})`, () => {
    test.override({ harness })

    test('links resolve in the dictionary and render: root, page to root, through the fallback', async ({ page, goto, request }) => {
      // step 1: the dictionaries hold the resolved texts
      expect(await readChunk(request, 'index', 'en')).toMatchObject({ linkedRoot: 'HELLO EN!' })
      expect(await readChunk(request, 'about', 'en')).toMatchObject({ linkedPage: 'About EN / Shared EN', linkedRoot: 'HELLO EN!' })
      // de falls back to en for the message, and links to its own `hello`
      const de = await readChunk(request, 'index', 'de')
      expect(de.linkedRoot).toBe(`${String(de.hello).toLocaleUpperCase('de-DE')}!`)

      // step 2: the pages render them, on load and after a client navigation
      await goto('/en', { waitUntil: 'hydration' })
      await expect(page.locator('#linked-root')).toHaveText('HELLO EN!')
      await page.click('#go-about')
      await expect(page.locator('#linked-page')).toHaveText('About EN / Shared EN')
    })
  })
}

describe('journey: linkedMessages off (translation-watcher-prod)', () => {
  test.override({ harness: 'translation-watcher-prod' })

  test('a link is plain text by default', async ({ request }) => {
    expect(await readChunk(request, 'index', 'en')).toMatchObject({ linkedRoot: "@.upper:{'hello'}!" })
    expect(await readChunk(request, 'about', 'en')).toMatchObject({ linkedPage: '@:aboutTitle / @:sharedRoot' })
  })
})
