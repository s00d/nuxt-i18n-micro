import { isIndexRouteName } from '../src/resolver'

const localeCodes = ['en', 'de', 'ru', 'en-US']

describe('isIndexRouteName', () => {
  describe('base name (index or empty)', () => {
    test('returns true for "index"', () => {
      const result = { noOpts: isIndexRouteName('index'), withLocaleCodes: isIndexRouteName('index', { localeCodes }) }
      expect(result).toMatchSnapshot()
    })

    test('returns true for empty string', () => {
      const result = { noOpts: isIndexRouteName(''), withLocaleCodes: isIndexRouteName('', { localeCodes }) }
      expect(result).toMatchSnapshot()
    })

    test('returns false for null/undefined', () => {
      const result = { null: isIndexRouteName(null), undefined: isIndexRouteName(undefined) }
      expect(result).toMatchSnapshot()
    })
  })

  describe('localized index name (localized-index-{locale})', () => {
    test('returns true for localized-index-{locale} when locale in localeCodes', () => {
      const result = {
        en: isIndexRouteName('localized-index-en', { localeCodes }),
        de: isIndexRouteName('localized-index-de', { localeCodes }),
        ru: isIndexRouteName('localized-index-ru', { localeCodes }),
        enUS: isIndexRouteName('localized-index-en-US', { localeCodes }),
      }
      expect(result).toMatchSnapshot()
    })

    test('returns false for localized-index-{locale} when locale not in localeCodes', () => {
      const result = { fr: isIndexRouteName('localized-index-fr', { localeCodes }), xx: isIndexRouteName('localized-index-xx', { localeCodes }) }
      expect(result).toMatchSnapshot()
    })

    test('with empty localeCodes: accepts any 2+ char suffix as locale', () => {
      const result = {
        de: isIndexRouteName('localized-index-de', { localeCodes: [] }),
        en: isIndexRouteName('localized-index-en', { localeCodes: [] }),
        x: isIndexRouteName('localized-index-x', { localeCodes: [] }),
      }
      expect(result).toMatchSnapshot()
    })

    test('custom prefix', () => {
      const result = {
        i18nIndexDe: isIndexRouteName('i18n-index-de', { localizedRouteNamePrefix: 'i18n-', localeCodes: ['de'] }),
        localizedIndexDe: isIndexRouteName('localized-index-de', { localizedRouteNamePrefix: 'i18n-', localeCodes: ['de'] }),
      }
      expect(result).toMatchSnapshot()
    })
  })

  describe('non-index names (must return false)', () => {
    test('other base names', () => {
      const result = {
        page: isIndexRouteName('page'),
        about: isIndexRouteName('about'),
        localizedPageDe: isIndexRouteName('localized-page-de', { localeCodes }),
        localizedAboutEn: isIndexRouteName('localized-about-en', { localeCodes }),
      }
      expect(result).toMatchSnapshot()
    })

    test('names ending with -index but not index route', () => {
      const result = {
        pageIndex: isIndexRouteName('page-index'),
        localizedPageIndexDe: isIndexRouteName('localized-page-index-de', { localeCodes }),
      }
      expect(result).toMatchSnapshot()
    })

    test('localized-index- with wrong prefix', () => {
      const result = { wrongPrefix: isIndexRouteName('xlocalized-index-de', { localeCodes }) }
      expect(result).toMatchSnapshot()
    })
  })
})

describe('snapshots (documentation: how isIndexRouteName works)', () => {
  test('isIndexRouteName: result for set of names', () => {
    const names = ['', 'index', 'localized-index-en', 'localized-index-de', 'localized-page-de', 'about', 'page-index']
    const out: Record<string, boolean> = {}
    for (const name of names) {
      out[name] = isIndexRouteName(name, { localeCodes })
    }
    expect(out).toMatchSnapshot()
  })
})
