import { afterEach, describe, expect, test, vi } from 'vitest'
import { CacheControl } from '../src/cache-control'
import { deepMergeTranslations } from '../src/deep-merge'
import { buildFallbackLocaleChain, mergeSourceTranslations } from '../src/merge-source'
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
  test('a page file wins over the root file in either read order', () => {
    const pageFirst: TranslationFileBuckets<Record<string, unknown>> = { root: {}, routes: {} }
    storeLoadedTranslationFile(pageFirst, 'pages/about/en.json', { title: 'Page' }, true)
    storeLoadedTranslationFile(pageFirst, 'en.json', { title: 'Root', other: 'O' }, true)
    const rootFirst: TranslationFileBuckets<Record<string, unknown>> = { root: {}, routes: {} }
    storeLoadedTranslationFile(rootFirst, 'en.json', { title: 'Root', other: 'O' }, true)
    storeLoadedTranslationFile(rootFirst, 'pages/about/en.json', { title: 'Page' }, true)
    expect(pageFirst.root.en).toEqual({ title: 'Page', other: 'O' })
    expect(rootFirst.root.en).toEqual({ title: 'Page', other: 'O' })
  })
})
