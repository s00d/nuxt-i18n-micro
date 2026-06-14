import {
  classifyTranslationRelativePath,
  mergeRouteTranslationsWithRoot,
  pagePathSegmentsToRouteName,
  parseTranslationRelativePath,
  storeLoadedTranslationFile,
  type TranslationFileBuckets,
} from '../src/parse-path'

describe('parseTranslationRelativePath', () => {
  it('parses root locale files', () => {
    expect(parseTranslationRelativePath('en.json')).toEqual({ type: 'root', locale: 'en' })
  })

  it('parses flat page locale files', () => {
    expect(parseTranslationRelativePath('pages/about/en.json')).toEqual({ type: 'page', pageName: 'about', locale: 'en' })
  })

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

describe('classifyTranslationRelativePath', () => {
  it('treats page files as root when page locales are disabled', () => {
    expect(classifyTranslationRelativePath('pages/about/en.json', true)).toEqual({ type: 'root', locale: 'en' })
  })
})

describe('pagePathSegmentsToRouteName', () => {
  it('joins nested segments with dashes', () => {
    expect(pagePathSegmentsToRouteName(['user', 'profile'])).toBe('user-profile')
  })

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

  it('stores page files in root when page locales are disabled', () => {
    const buckets: TranslationFileBuckets<{ title?: string }> = { root: {}, routes: {} }

    storeLoadedTranslationFile(buckets, 'pages/about/en.json', { title: 'About' }, true)

    expect(buckets.root.en).toEqual({ title: 'About' })
    expect(buckets.routes).toEqual({})
  })
})

describe('mergeRouteTranslationsWithRoot', () => {
  it('deep merges route translations over root translations', () => {
    const merged = mergeRouteTranslationsWithRoot({ common: 'root', page: { a: 1 } }, { page: { b: 2 }, extra: true })

    expect(merged).toEqual({
      common: 'root',
      page: { a: 1, b: 2 },
      extra: true,
    })
  })
})
