import {
  interpolate,
  isNoPrefixStrategy,
  isPrefixAndDefaultStrategy,
  isPrefixExceptDefaultStrategy,
  isPrefixStrategy,
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
})
