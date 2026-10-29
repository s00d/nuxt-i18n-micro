import { describe, expect, test } from 'vitest'
import { flattenKeys, isPlainTranslationObject } from '../src/core/parser'

describe('flattenKeys', () => {
  test('should flatten simple object', () => {
    const obj = {
      greeting: 'Hello',
      welcome: 'Welcome',
    }
    const keys = flattenKeys(obj)
    expect(keys).toEqual(['greeting', 'welcome'])
  })

  test('does not treat strings or arrays as key maps', () => {
    expect(flattenKeys('ab' as unknown as Record<string, unknown>)).toEqual([])
    expect(flattenKeys(['a', 'b'] as unknown as Record<string, unknown>)).toEqual([])
    expect(flattenKeys(null as unknown as Record<string, unknown>)).toEqual([])
  })
})
