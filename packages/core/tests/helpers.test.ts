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
  setTranslationAtKey,
  translationCacheKey,
  withPrefixStrategy,
} from '../src/helpers'
import { describe, expect, test } from 'vitest'

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

    // Flat objects pass under a plain `Object.assign` too, so the assertions that matter are
    // the nested ones: this is the shape a locale file actually has.
    test('keeps siblings at every depth', () => {
      expect(mergeTranslationChunk({ page: { index: { title: 'T', sub: 'S' } } }, { page: { index: { extra: 'E' }, about: 'A' } })).toEqual({
        page: { index: { title: 'T', sub: 'S', extra: 'E' }, about: 'A' },
      })
    })

    test('keeps nested existing values when preserveExisting is true', () => {
      expect(mergeTranslationChunk({ nav: { about: 'Overridden' } }, { nav: { about: 'About', home: 'Home' } }, { preserveExisting: true })).toEqual({
        nav: { about: 'Overridden', home: 'Home' },
      })
    })

    test('replaces arrays and type changes rather than merging them', () => {
      expect(mergeTranslationChunk({ items: ['a', 'b'] }, { items: ['c'] })).toEqual({ items: ['c'] })
      expect(mergeTranslationChunk({ a: { b: '1' } }, { a: 'flat' })).toEqual({ a: 'flat' })
    })

    test('merges a key named constructor like any other', () => {
      expect(mergeTranslationChunk({ a: '1' }, { constructor: 'Konstruktor' })).toEqual({ a: '1', constructor: 'Konstruktor' })
    })

    test('ignores a key that would reach the prototype chain', () => {
      const merged = mergeTranslationChunk({ a: '1' }, JSON.parse('{"__proto__":{"polluted":true},"b":"2"}') as Record<string, unknown>)
      expect(merged).toEqual({ a: '1', b: '2' })
      expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    })

    test('ignores inherited members of the incoming object', () => {
      const inherited = Object.create({ leaked: 'no' }) as Record<string, unknown>
      inherited.own = 'yes'
      expect(mergeTranslationChunk({ a: '1' }, inherited)).toEqual({ a: '1', own: 'yes' })
    })
  })

  describe('setTranslationAtKey', () => {
    test('replaces top-level object, string, and number', () => {
      const tree = { aaa: { bbb: 'ccc' }, ddd: 1111 }
      expect(setTranslationAtKey(tree, 'aaa', { fff: 'ggg' })).toEqual({ aaa: { fff: 'ggg' }, ddd: 1111 })
      expect(setTranslationAtKey(tree, 'aaa', 'text')).toEqual({ aaa: 'text', ddd: 1111 })
      expect(setTranslationAtKey(tree, 'ddd', 2222)).toEqual({ aaa: { bbb: 'ccc' }, ddd: 2222 })
    })

    test('creates and replaces nested values by dotted path', () => {
      const tree = { nested: { deep: 'old' } }
      expect(setTranslationAtKey(tree, 'nested.deep', 'new')).toEqual({ nested: { deep: 'new' } })
      expect(setTranslationAtKey({}, 'new.branch', 'value')).toEqual({ new: { branch: 'value' } })
    })

    test('prefers literal dotted key over nested traversal', () => {
      const tree = { 'dotted.key': 'literal', dotted: { key: 'nested' } }
      expect(setTranslationAtKey(tree, 'dotted.key', 'updated')).toEqual({
        'dotted.key': 'updated',
        dotted: { key: 'nested' },
      })
    })

    test('replaces a string parent with an object when setting a nested path', () => {
      const tree = { a: 'flat' }
      expect(setTranslationAtKey(tree, 'a.b', 1)).toEqual({ a: { b: 1 } })
    })

    test('does not mutate the original tree', () => {
      const tree = { aaa: { bbb: 'ccc' } }
      const next = setTranslationAtKey(tree, 'aaa.bbb', 'updated')
      expect(tree.aaa).toEqual({ bbb: 'ccc' })
      expect(next).toEqual({ aaa: { bbb: 'updated' } })
    })

    test('ignores unsafe or invalid paths', () => {
      const tree = { a: '1' }
      expect(setTranslationAtKey(tree, '__proto__', 'x')).toBe(tree)
      expect(setTranslationAtKey(tree, '', 'x')).toBe(tree)
    })

    test('updates a flat dotted key when the path contains empty segments', () => {
      const tree = { 'a..b': 'old' }
      expect(setTranslationAtKey(tree, 'a..b', 'new')).toEqual({ 'a..b': 'new' })
    })
  })
})
