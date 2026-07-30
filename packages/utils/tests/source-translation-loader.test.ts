import { loadSourceTranslationsFromStorage } from '../src/source-loader'
import { describe, expect, it } from 'vitest'

describe('loadSourceTranslationsFromStorage', () => {
  it('loads and merges root/page source files from Nitro storage keys', async () => {
    const storage = {
      async getItem(key: string) {
        const files: Record<string, Record<string, unknown>> = {
          'en.json': { greeting: 'Hello' },
          'de.json': { greeting: 'Hallo' },
          'pages/contact/en.json': { title: 'Contact' },
          'pages/contact/de.json': { title: 'Kontakt' },
        }
        return files[key]
      },
    }

    const result = await loadSourceTranslationsFromStorage(storage, {
      locale: 'de',
      pageName: 'contact',
      locales: [{ code: 'en' }, { code: 'de', fallbackLocale: 'en' }],
      globalFallbackLocale: 'en',
    })

    expect(result).toEqual({
      greeting: 'Hallo',
      title: 'Kontakt',
    })
  })
})
