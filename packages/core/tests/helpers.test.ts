import {
  getByPath,
  hasTranslationValue,
  interpolate,
  isNoPrefixStrategy,
  isPrefixAndDefaultStrategy,
  isPrefixExceptDefaultStrategy,
  isPrefixStrategy,
  mergeTranslationChunk,
  resolveTranslation,
  translationCacheKey,
  withPrefixStrategy,
} from '../src/helpers'

describe('Helpers', () => {
  describe('interpolate', () => {
    test('should replace placeholders with params', () => {
      const template = 'Hello, {name}! Your age is {age}.'
      const params = { name: 'John', age: 30 }
      const result = interpolate(template, params)
      expect(result).toBe('Hello, John! Your age is 30.')
    })

    test('should handle missing params by leaving placeholders', () => {
      const template = 'Hello, {name}! Your age is {age}.'
      const params = { name: 'John' } // age is missing
      const result = interpolate(template, params)
      expect(result).toBe('Hello, John! Your age is {age}.')
    })

    test('should handle empty params', () => {
      const template = 'Hello, {name}!'
      const params = {}
      const result = interpolate(template, params)
      expect(result).toBe('Hello, {name}!')
    })

    test('should handle empty template', () => {
      const template = ''
      const params = { name: 'John' }
      const result = interpolate(template, params)
      expect(result).toBe('')
    })
  })

  describe('getByPath', () => {
    const data = {
      flat: 'value',
      empty: '',
      zero: 0,
      'dotted.key': 'literal',
      nested: { deep: 'nested-value', empty: '' },
    }

    test('returns flat own keys', () => {
      expect(getByPath(data, 'flat')).toBe('value')
      expect(getByPath(data, 'empty')).toBe('')
      expect(getByPath(data, 'zero')).toBe(0)
    })

    test('returns nested keys by dot path', () => {
      expect(getByPath(data, 'nested.deep')).toBe('nested-value')
      expect(getByPath(data, 'nested.empty')).toBe('')
    })

    test('prefers literal dotted key over nested traversal', () => {
      expect(getByPath(data, 'dotted.key')).toBe('literal')
    })

    test('returns undefined for missing keys', () => {
      expect(getByPath(data, 'missing')).toBeUndefined()
      expect(getByPath(data, 'nested.missing')).toBeUndefined()
      expect(getByPath(data, 'missing.deep')).toBeUndefined()
    })

    test('returns undefined for nullish root or empty path', () => {
      expect(getByPath(null, 'flat')).toBeUndefined()
      expect(getByPath(data, '')).toBeUndefined()
    })
  })

  describe('withPrefixStrategy', () => {
    test('should return true for "prefix" strategy', () => {
      expect(withPrefixStrategy('prefix')).toBe(true)
    })

    test('should return true for "prefix_and_default" strategy', () => {
      expect(withPrefixStrategy('prefix_and_default')).toBe(true)
    })

    test('should return false for other strategies', () => {
      expect(withPrefixStrategy('no_prefix')).toBe(false)
      expect(withPrefixStrategy('prefix_except_default')).toBe(false)
    })
  })

  describe('isNoPrefixStrategy', () => {
    test('should return true for "no_prefix" strategy', () => {
      expect(isNoPrefixStrategy('no_prefix')).toBe(true)
    })

    test('should return false for other strategies', () => {
      expect(isNoPrefixStrategy('prefix')).toBe(false)
      expect(isNoPrefixStrategy('prefix_and_default')).toBe(false)
      expect(isNoPrefixStrategy('prefix_except_default')).toBe(false)
    })
  })

  describe('isPrefixStrategy', () => {
    test('should return true for "prefix" strategy', () => {
      expect(isPrefixStrategy('prefix')).toBe(true)
    })

    test('should return false for other strategies', () => {
      expect(isPrefixStrategy('no_prefix')).toBe(false)
      expect(isPrefixStrategy('prefix_and_default')).toBe(false)
      expect(isPrefixStrategy('prefix_except_default')).toBe(false)
    })
  })

  describe('isPrefixExceptDefaultStrategy', () => {
    test('should return true for "prefix_except_default" strategy', () => {
      expect(isPrefixExceptDefaultStrategy('prefix_except_default')).toBe(true)
    })

    test('should return false for other strategies', () => {
      expect(isPrefixExceptDefaultStrategy('no_prefix')).toBe(false)
      expect(isPrefixExceptDefaultStrategy('prefix')).toBe(false)
      expect(isPrefixExceptDefaultStrategy('prefix_and_default')).toBe(false)
    })
  })

  describe('isPrefixAndDefaultStrategy', () => {
    test('should return true for "prefix_and_default" strategy', () => {
      expect(isPrefixAndDefaultStrategy('prefix_and_default')).toBe(true)
    })

    test('should return false for other strategies', () => {
      expect(isPrefixAndDefaultStrategy('no_prefix')).toBe(false)
      expect(isPrefixAndDefaultStrategy('prefix')).toBe(false)
      expect(isPrefixAndDefaultStrategy('prefix_except_default')).toBe(false)
    })
  })

  describe('translationCacheKey', () => {
    test('builds locale:route key with default route name', () => {
      expect(translationCacheKey('en')).toBe('en:index')
      expect(translationCacheKey('de', 'about')).toBe('de:about')
    })
  })

  describe('resolveTranslation', () => {
    const data = { flat: 'value', nested: { deep: 'nested' } }

    test('returns flat and nested values', () => {
      expect(resolveTranslation(data, 'flat')).toBe('value')
      expect(resolveTranslation(data, 'nested.deep')).toBe('nested')
    })

    test('returns null for missing keys', () => {
      expect(resolveTranslation(data, 'missing')).toBeNull()
      expect(resolveTranslation(null, 'flat')).toBeNull()
    })
  })

  describe('hasTranslationValue', () => {
    test('checks presence via resolveTranslation', () => {
      expect(hasTranslationValue({ key: 'x' }, 'key')).toBe(true)
      expect(hasTranslationValue({ key: 'x' }, 'missing')).toBe(false)
    })
  })

  describe('mergeTranslationChunk', () => {
    test('returns incoming when existing is empty', () => {
      expect(mergeTranslationChunk({}, { a: 1 })).toEqual({ a: 1 })
    })

    test('merges with incoming winning by default', () => {
      expect(mergeTranslationChunk({ a: 1, b: 1 }, { b: 2, c: 3 })).toEqual({ a: 1, b: 2, c: 3 })
    })

    test('preserves existing keys when preserveExisting is true', () => {
      expect(mergeTranslationChunk({ a: 1, b: 1 }, { b: 2, c: 3 }, { preserveExisting: true })).toEqual({ a: 1, b: 1, c: 3 })
    })
  })
})
