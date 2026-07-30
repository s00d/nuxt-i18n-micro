import { describe, expect, it } from 'vitest'
import { deepMergeTranslations, deepMergeTranslationsRecursive } from '../src/deep-merge'

/**
 * Two merges ship here and they are not interchangeable, which is the whole point of
 * these assertions: `deepMergeTranslations` descends exactly one level and then replaces,
 * `deepMergeTranslationsRecursive` descends all the way. Swapping one for the other loses
 * translations without failing anything, so the difference is pinned rather than implied.
 */
describe('deepMergeTranslations', () => {
  it('merges the first level of nesting', () => {
    expect(deepMergeTranslations({ nav: { about: 'About' } }, { nav: { home: 'Home' } })).toEqual({ nav: { about: 'About', home: 'Home' } })
  })

  it('replaces below the first level — use the recursive variant for real locale trees', () => {
    expect(deepMergeTranslations({ page: { index: { title: 'T', sub: 'S' } } }, { page: { index: { extra: 'E' } } })).toEqual({
      page: { index: { extra: 'E' } },
    })
  })

  it('lets the source win on a conflict', () => {
    expect(deepMergeTranslations({ a: '1' }, { a: '2' })).toEqual({ a: '2' })
  })

  it('ignores keys that would reach the prototype chain', () => {
    const merged = deepMergeTranslations({ a: '1' }, JSON.parse('{"__proto__":{"polluted":true},"b":"2"}') as Record<string, unknown>)
    expect(merged).toEqual({ a: '1', b: '2' })
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })
})

describe('deepMergeTranslationsRecursive', () => {
  it('merges at every depth', () => {
    expect(deepMergeTranslationsRecursive({ page: { index: { title: 'T', sub: 'S' } } }, { page: { index: { extra: 'E' } } })).toEqual({
      page: { index: { title: 'T', sub: 'S', extra: 'E' } },
    })
  })

  it('replaces an array rather than merging it', () => {
    // Locale values are occasionally arrays (plural forms); merging them index-wise would
    // produce a form nobody wrote.
    expect(deepMergeTranslationsRecursive({ items: ['a', 'b'] }, { items: ['c'] })).toEqual({ items: ['c'] })
  })

  it('replaces an object with a primitive and back', () => {
    expect(deepMergeTranslationsRecursive({ a: { b: '1' } }, { a: 'flat' })).toEqual({ a: 'flat' })
    expect(deepMergeTranslationsRecursive({ a: 'flat' }, { a: { b: '1' } })).toEqual({ a: { b: '1' } })
  })

  it('copies the source when the target is empty', () => {
    expect(deepMergeTranslationsRecursive({}, { a: '1' })).toEqual({ a: '1' })
  })

  it('ignores keys that would reach the prototype chain', () => {
    const merged = deepMergeTranslationsRecursive({ a: '1' }, JSON.parse('{"__proto__":{"polluted":true},"b":"2"}') as Record<string, unknown>)
    expect(merged).toEqual({ a: '1', b: '2' })
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })
})
