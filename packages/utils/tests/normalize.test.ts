import { toTranslationRecord, toTranslations } from '../src/normalize'
import { describe, expect, it } from 'vitest'

describe('toTranslations', () => {
  it('returns empty object for arrays and non-object primitives', () => {
    expect(toTranslations([])).toEqual({})
    expect(toTranslations('hello')).toEqual({})
    expect(toTranslations(42)).toEqual({})
  })
})
