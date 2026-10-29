import { describe, expect, test } from 'vitest'
import { collectTranslationPaths, mergeTranslationLayers } from '../src/helpers'

describe('cyclic objects passed in by code', () => {
  test('mergeTranslationLayers and collectTranslationPaths cut a cycle instead of overflowing', () => {
    const cyclic: Record<string, unknown> = { a: 'A' }
    cyclic.self = cyclic
    expect(() => mergeTranslationLayers({ a: { b: 1 } }, cyclic)).not.toThrow()
    const paths = new Set<string>()
    collectTranslationPaths(cyclic, paths)
    expect([...paths]).toEqual(['a', 'self'])
  })

  test('a shared (non-cyclic) subtree under two keys is still walked twice', () => {
    const shared = { x: 1 }
    const paths = new Set<string>()
    collectTranslationPaths({ a: shared, b: shared }, paths)
    expect([...paths]).toEqual(['a', 'a.x', 'b', 'b.x'])
  })
})
