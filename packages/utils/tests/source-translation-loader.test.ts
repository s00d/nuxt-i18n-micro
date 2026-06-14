import { loadSourceTranslationsFromStorage } from '../src/source-loader'

describe('loadSourceTranslationsFromStorage', () => {
  it('loads and merges root/page source files from Nitro storage keys', async () => {
    const storage = {
      async getItem(key: string) {
        const files: Record<string, Record<string, unknown>> = {
          'assets:i18n:en.json': { greeting: 'Hello' },
          'assets:i18n:de.json': { greeting: 'Hallo' },
          'assets:i18n:pages:contact:en.json': { title: 'Contact' },
          'assets:i18n:pages:contact:de.json': { title: 'Kontakt' },
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
