import {
  classifyTranslationRelativePath,
  pagePathSegmentsToRouteName,
  parseTranslationRelativePath,
  storeLoadedTranslationFile,
  type TranslationFileBuckets,
} from '../src/parse-path'
import { describe, expect, it } from 'vitest'

describe('parseTranslationRelativePath', () => {
  it('parses nested page locale files', () => {
    expect(parseTranslationRelativePath('pages/user/profile/en.json')).toEqual({
      type: 'page',
      pageName: 'user-profile',
      locale: 'en',
    })
  })

  it('ignores invalid paths', () => {
    expect(parseTranslationRelativePath('pages/en.json')).toEqual({ type: 'ignore' })
    expect(parseTranslationRelativePath('readme.txt')).toEqual({ type: 'ignore' })
  })
})

describe('pagePathSegmentsToRouteName', () => {
  it('returns null for empty segments', () => {
    expect(pagePathSegmentsToRouteName([])).toBeNull()
  })
})

describe('storeLoadedTranslationFile', () => {
  it('stores root and route translations separately', () => {
    const buckets: TranslationFileBuckets<{ hello?: string; title?: string }> = { root: {}, routes: {} }

    storeLoadedTranslationFile(buckets, 'en.json', { hello: 'world' })
    storeLoadedTranslationFile(buckets, 'pages/about/en.json', { title: 'About' })

    expect(buckets.root.en).toEqual({ hello: 'world' })
    expect(buckets.routes.about?.en).toEqual({ title: 'About' })
  })

  it('keeps pages and locales named after Object.prototype members', () => {
    const buckets: TranslationFileBuckets<{ title?: string }> = { root: {}, routes: {} }

    for (const path of ['constructor.json', 'pages/constructor/en.json', 'pages/toString/valueOf.json', '__proto__.json', 'pages/__proto__/en.json', 'pages/about/__proto__.json']) {
      storeLoadedTranslationFile(buckets, path, { title: path })
    }

    expect(Object.hasOwn(buckets.root, 'constructor')).toBe(true)
    expect(buckets.root.constructor).toEqual({ title: 'constructor.json' })
    expect(Object.hasOwn(buckets.routes, 'constructor')).toBe(true)
    expect(buckets.routes.constructor?.en).toEqual({ title: 'pages/constructor/en.json' })
    expect(buckets.routes.toString?.valueOf).toEqual({ title: 'pages/toString/valueOf.json' })
    expect(Object.keys(buckets.root)).toEqual(['constructor'])
    expect(Object.getPrototypeOf(buckets.routes)).toBe(Object.prototype)
    expect((Object as unknown as Record<string, unknown>).en).toBeUndefined()
    expect(({} as Record<string, unknown>).en).toBeUndefined()
  })
})
