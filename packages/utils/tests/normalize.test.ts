import { toTranslationRecord, toTranslations } from '../src/normalize'

describe('toTranslations', () => {
  it('returns empty object for falsy input', () => {
    expect(toTranslations(null)).toEqual({})
    expect(toTranslations(undefined)).toEqual({})
  })

  it('returns plain objects as translations', () => {
    const input = { greeting: 'Hello', nested: { key: 'value' } }
    expect(toTranslations(input)).toBe(input)
  })

  it('returns empty object for arrays and primitives', () => {
    expect(toTranslations([])).toEqual({})
    expect(toTranslations('hello')).toEqual({})
    expect(toTranslations(42)).toEqual({})
  })
})

describe('toTranslationRecord', () => {
  it('normalizes unknown payloads into a mutable record', () => {
    expect(toTranslationRecord({ key: 'value' })).toEqual({ key: 'value' })
    expect(toTranslationRecord(null)).toEqual({})
  })
})
