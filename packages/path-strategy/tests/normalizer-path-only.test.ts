/**
 * TDD: getPathWithoutLocale must return pathWithoutLocale without query and hash,
 * otherwise getRedirect gives wrong result and redirect loop / query loss on navigation may occur.
 */
import { getPathWithoutLocale } from '../src/core/normalizer'

const localeCodes = ['en', 'de', 'ru']

describe('getPathWithoutLocale: path with query and hash', () => {
  test('path without locale prefix: pathWithoutLocale must not contain query or hash', () => {
    const result = getPathWithoutLocale('/news/2?a=b#tada', localeCodes)
    expect(result.pathWithoutLocale).toBe('/news/2')
    expect(result.localeFromPath).toBe(null)
    expect(result).toMatchSnapshot()
  })

  test('path with locale prefix: pathWithoutLocale must not contain query or hash', () => {
    const result = getPathWithoutLocale('/de/news/2?search=vue&page=1#top', localeCodes)
    expect(result.pathWithoutLocale).toBe('/news/2')
    expect(result.localeFromPath).toBe('de')
    expect(result).toMatchSnapshot()
  })
})
