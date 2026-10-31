import { describe, expect, it } from 'vitest'
import { deepMergeTranslations, deepMergeTranslationsRecursive } from '../src/deep-merge'

/** `deepMergeTranslations` is the recursive merge under its old name; both are pinned, it once stopped at two levels. */
describe('nested __proto__', () => {
  it.each([
    ['onto an empty target', {}],
    ['onto a target without the node', { other: 'x' }],
    ['onto a scalar', { n: 'x' }],
    ['onto the node', { n: { o: 1 } }],
  ])('is dropped %s', (_name, target) => {
    const merged = deepMergeTranslationsRecursive(target, JSON.parse('{"n":{"__proto__":{"evil":1},"k":"v"}}'))
    expect(Object.keys(merged.n as object)).not.toContain('__proto__')
  })
})

describe('deepMergeTranslations', () => {
  it('merges the first level of nesting', () => {
    expect(deepMergeTranslations({ nav: { about: 'About' } }, { nav: { home: 'Home' } })).toEqual({ nav: { about: 'About', home: 'Home' } })
  })

  it('merges below the second level as well', () => {
    expect(deepMergeTranslations({ a: { b: { c: '1' } } }, { a: { b: { d: '2' } } })).toEqual({ a: { b: { c: '1', d: '2' } } })
  })
})

describe('deepMergeTranslationsRecursive', () => {
  it('lets the source win, and replaces arrays rather than merging them index-wise', () => {
    expect(deepMergeTranslationsRecursive({ a: '1' }, { a: '2' })).toEqual({ a: '2' })
    expect(deepMergeTranslationsRecursive({ items: ['a', 'b'] }, { items: ['c'] })).toEqual({ items: ['c'] })
  })

  it('merges a key named constructor like any other', () => {
    expect(deepMergeTranslationsRecursive({ a: '1' }, { constructor: 'Konstruktor' })).toEqual({ a: '1', constructor: 'Konstruktor' })
  })

  // a locale file is JSON: `__proto__` arrives as an own key, at any depth, and the spread would keep it
  it('drops __proto__ at every depth, so a locale file cannot replace a prototype', () => {
    const payload = JSON.parse('{"__proto__":{"polluted":true},"b":"2","nested":{"__proto__":{"polluted":true},"c":"3"}}') as Record<string, unknown>
    const merged = deepMergeTranslationsRecursive({ a: '1', nested: { d: '4' } }, payload)

    expect(merged).toEqual({ a: '1', b: '2', nested: { c: '3', d: '4' } })
    expect(Object.getPrototypeOf(merged)).toBe(Object.prototype)
    expect(Object.getPrototypeOf(merged.nested)).toBe(Object.prototype)
    expect((merged as { polluted?: unknown }).polluted).toBeUndefined()
    expect((merged.nested as { polluted?: unknown }).polluted).toBeUndefined()
    expect(({} as { polluted?: unknown }).polluted).toBeUndefined()
  })

  it('replaces an object with a primitive and back', () => {
    expect(deepMergeTranslationsRecursive({ a: { b: '1' } }, { a: 'flat' })).toEqual({ a: 'flat' })
    expect(deepMergeTranslationsRecursive({ a: 'flat' }, { a: { b: '1' } })).toEqual({ a: { b: '1' } })
  })
})
