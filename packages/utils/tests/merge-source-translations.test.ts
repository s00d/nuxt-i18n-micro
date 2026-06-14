import { buildFallbackLocaleChain, buildSourcePagePath, buildSourceRootPath, mergeSourceTranslations, toSourceStorageKey } from '../src/merge-source'

describe('buildFallbackLocaleChain', () => {
  const locales = [{ code: 'en' }, { code: 'de', fallbackLocale: 'en' }, { code: 'fr', fallbackLocale: 'en' }]

  it('builds unique fallback chain for locale', () => {
    expect(buildFallbackLocaleChain('de', locales, 'en')).toEqual(['en', 'de'])
    expect(buildFallbackLocaleChain('fr', locales, 'en')).toEqual(['en', 'fr'])
  })
})

describe('source translation paths', () => {
  it('maps source files to Nitro storage keys', () => {
    expect(buildSourceRootPath('en')).toBe('en.json')
    expect(buildSourcePagePath('contact', 'de')).toBe('pages/contact/de.json')
    expect(toSourceStorageKey('pages/contact/de.json')).toBe('assets:i18n:pages:contact:de.json')
  })
})

describe('mergeSourceTranslations', () => {
  it('merges root and page translations with fallback chain at runtime', async () => {
    const files: Record<string, Record<string, unknown>> = {
      'en.json': { greeting: 'Hello', common: { save: 'Save' } },
      'de.json': { greeting: 'Hallo' },
      'pages/contact/en.json': { title: 'Contact' },
      'pages/contact/de.json': { title: 'Kontakt', common: { save: 'Speichern' } },
    }

    const result = await mergeSourceTranslations({
      locale: 'de',
      pageName: 'contact',
      locales: [{ code: 'en' }, { code: 'de', fallbackLocale: 'en' }],
      globalFallbackLocale: 'en',
      readLocaleFile: (relativePath) => files[relativePath] ?? {},
    })

    expect(result).toEqual({
      greeting: 'Hallo',
      title: 'Kontakt',
      common: { save: 'Speichern' },
    })
  })

  it('uses index page when disablePageLocales is true', async () => {
    const readLocaleFile = jest.fn((relativePath: string) => {
      if (relativePath === 'en.json') return { greeting: 'Hello' }
      if (relativePath === 'pages/index/en.json') return { page: 'Index' }
      return {}
    })

    await mergeSourceTranslations({
      locale: 'en',
      pageName: 'contact',
      locales: [{ code: 'en' }],
      disablePageLocales: true,
      readLocaleFile,
    })

    expect(readLocaleFile).toHaveBeenCalledWith('pages/index/en.json')
    expect(readLocaleFile).not.toHaveBeenCalledWith('pages/contact/en.json')
  })
})
