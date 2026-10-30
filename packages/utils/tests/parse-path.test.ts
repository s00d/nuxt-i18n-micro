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
})
