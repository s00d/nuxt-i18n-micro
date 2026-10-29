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
})

describe('deepMergeTranslationsRecursive', () => {
  it('replaces an object with a primitive and back', () => {
    expect(deepMergeTranslationsRecursive({ a: { b: '1' } }, { a: 'flat' })).toEqual({ a: 'flat' })
    expect(deepMergeTranslationsRecursive({ a: 'flat' }, { a: { b: '1' } })).toEqual({ a: { b: '1' } })
  })
})
