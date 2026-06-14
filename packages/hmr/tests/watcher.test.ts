import { handleTranslationWatchChange, parseTranslationWatchRelativePath } from '../src/watcher'

describe('parseTranslationWatchRelativePath', () => {
  it('parses page locale files', () => {
    expect(parseTranslationWatchRelativePath('pages/contact/en.json')).toEqual({
      type: 'page',
      pageName: 'contact',
      locale: 'en',
    })
  })

  it('parses root locale files', () => {
    expect(parseTranslationWatchRelativePath('de.json')).toEqual({ type: 'root', locale: 'de' })
  })

  it('ignores invalid paths', () => {
    expect(parseTranslationWatchRelativePath('pages/contact.json')).toEqual({ type: 'ignore' })
    expect(parseTranslationWatchRelativePath('readme.txt')).toEqual({ type: 'ignore' })
  })
})

describe('handleTranslationWatchChange', () => {
  it('updates cache for page file changes', async () => {
    const cache = new Map<string, { data: Record<string, unknown>; json: string }>()
    const serverCache = {
      set: (key: string, value: { data: Record<string, unknown>; json: string }) => cache.set(key, value),
      delete: (key: string) => cache.delete(key),
    }

    const result = await handleTranslationWatchChange({
      relativePath: 'pages/contact/en.json',
      configuredLocales: new Set(['en']),
      listPageNames: () => ['contact'],
      serverCache,
      mergeInput: {
        readLocaleFile: (path) => {
          if (path === 'en.json') return { shared: 'Root' }
          if (path === 'pages/contact/en.json') return { title: 'Contact' }
          return {}
        },
      },
    })

    expect(result).toBe('page')
    expect(cache.get('en:contact')?.data).toEqual({ shared: 'Root', title: 'Contact' })
  })

  it('re-merges all pages when root locale file changes', async () => {
    const cache = new Map<string, { data: Record<string, unknown>; json: string }>()
    const serverCache = {
      set: (key: string, value: { data: Record<string, unknown>; json: string }) => cache.set(key, value),
      delete: (key: string) => cache.delete(key),
    }

    const result = await handleTranslationWatchChange({
      relativePath: 'en.json',
      configuredLocales: new Set(['en']),
      listPageNames: () => ['contact'],
      serverCache,
      mergeInput: {
        readLocaleFile: (path) => {
          if (path === 'en.json') return { shared: 'Root' }
          if (path === 'pages/contact/en.json') return { title: 'Contact' }
          if (path === 'pages/index/en.json') return { page: 'Index' }
          return {}
        },
      },
    })

    expect(result).toBe('root')
    expect(cache.has('en:contact')).toBe(true)
    expect(cache.has('en:index')).toBe(true)
  })
})
