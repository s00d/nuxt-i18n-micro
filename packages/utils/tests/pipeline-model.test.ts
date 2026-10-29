import { afterEach, describe, expect, test, vi } from 'vitest'
import { CacheControl } from '../src/cache-control'
import { buildFallbackLocaleChain } from '../src/merge-source'
import { storeLoadedTranslationFile, type TranslationFileBuckets } from '../src/parse-path'

afterEach(() => vi.useRealTimers())

describe('CacheControl TTL', () => {
  test('counts from when an entry was stored: a hot entry still expires', () => {
    vi.useFakeTimers()
    const cache = new CacheControl<string>({ ttl: 1 })
    cache.set('k', 'v')
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(400)
      cache.get('k')
    }
    expect(cache.get('k')).toBeUndefined()
  })
})

describe('buildFallbackLocaleChain', () => {
  const locales = [{ code: 'en' }, { code: 'de', fallbackLocale: 'en' }, { code: 'fr', fallbackLocale: 'de' }, { code: 'it', fallbackLocale: 'it' }]

  test('follows fallbackLocale links to their end, weakest first', () => {
    expect(buildFallbackLocaleChain('fr', locales)).toEqual(['en', 'de', 'fr'])
    expect(buildFallbackLocaleChain('de', locales)).toEqual(['en', 'de'])
  })

  test('puts the global fallback first, once; stops on cycles and unknown codes', () => {
    expect(buildFallbackLocaleChain('it', locales, 'en')).toEqual(['en', 'it'])
    expect(buildFallbackLocaleChain('fr', locales, 'en')).toEqual(['en', 'de', 'fr'])
    expect(buildFallbackLocaleChain('xx', locales, 'en')).toEqual(['en'])
  })
})

describe('storeLoadedTranslationFile', () => {
  test('under disablePageLocales a page file merges into the root bucket instead of replacing it', () => {
    const buckets: TranslationFileBuckets<Record<string, unknown>> = { root: {}, routes: {} }
    storeLoadedTranslationFile(buckets, 'en.json', { greeting: 'Hi' }, true)
    storeLoadedTranslationFile(buckets, 'pages/about/en.json', { about: 'About' }, true)
    expect(buckets.root.en).toEqual({ greeting: 'Hi', about: 'About' })
  })
})
