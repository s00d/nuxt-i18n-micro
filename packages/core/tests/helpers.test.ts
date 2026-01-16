import {
  interpolate,
  withPrefixStrategy,
  isNoPrefixStrategy,
  isPrefixStrategy,
  isPrefixExceptDefaultStrategy,
  isPrefixAndDefaultStrategy,
  compileOrInterpolate,
  createCompiledCache,
  getCompiledCacheKey,
} from '../src/helpers'
import type { MessageCompilerFunc } from '@i18n-micro/types'

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

  describe('getCompiledCacheKey', () => {
    test('should include all components', () => {
      const key = getCompiledCacheKey('en', 'about', 'title', 'Hello World')
      expect(key).toBe('en:about:title:11:Hello World')
    })

    test('should truncate long content', () => {
      const longContent = 'a'.repeat(100)
      const key = getCompiledCacheKey('en', 'page', 'key', longContent)
      expect(key).toBe(`en:page:key:100:${'a'.repeat(50)}`)
    })

    test('should handle empty content', () => {
      const key = getCompiledCacheKey('en', 'page', 'key', '')
      expect(key).toBe('en:page:key:0:')
    })
  })

  describe('createCompiledCache', () => {
    test('should create an empty Map', () => {
      const cache = createCompiledCache()
      expect(cache).toBeInstanceOf(Map)
      expect(cache.size).toBe(0)
    })
  })

  describe('compileOrInterpolate', () => {
    test('should use interpolate when no messageCompiler', () => {
      const result = compileOrInterpolate(
        'Hello, {name}!',
        'en',
        'general',
        'greeting',
        { name: 'World' },
        undefined,
        undefined,
      )
      expect(result).toBe('Hello, World!')
    })

    test('should return value as-is when no params and no compiler', () => {
      const result = compileOrInterpolate(
        'Hello!',
        'en',
        'general',
        'greeting',
        undefined,
        undefined,
        undefined,
      )
      expect(result).toBe('Hello!')
    })

    test('should use messageCompiler when provided', () => {
      const compiler: MessageCompilerFunc = msg => () => msg.toUpperCase()
      const cache = createCompiledCache()

      const result = compileOrInterpolate(
        'hello',
        'en',
        'general',
        'greeting',
        undefined,
        compiler,
        cache,
      )
      expect(result).toBe('HELLO')
    })

    test('should cache compiled messages', () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        msg => () => msg.toUpperCase(),
      )
      const cache = createCompiledCache()

      compileOrInterpolate('hello', 'en', 'general', 'key', {}, compiler, cache)
      compileOrInterpolate('hello', 'en', 'general', 'key', {}, compiler, cache)

      expect(compiler).toHaveBeenCalledTimes(1)
    })

    test('should recompile when content changes', () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        msg => () => msg.toUpperCase(),
      )
      const cache = createCompiledCache()

      compileOrInterpolate('hello', 'en', 'general', 'key', {}, compiler, cache)
      compileOrInterpolate('hi there', 'en', 'general', 'key', {}, compiler, cache)

      expect(compiler).toHaveBeenCalledTimes(2)
    })

    test('should pass params to compiled function', () => {
      const compiler: MessageCompilerFunc = msg => (params) => {
        return msg.replace(/\{(\w+)\}/g, (_, k) => String(params?.[k] ?? ''))
      }
      const cache = createCompiledCache()

      const result = compileOrInterpolate(
        'Hello, {name}!',
        'en',
        'general',
        'greeting',
        { name: 'World' },
        compiler,
        cache,
      )
      expect(result).toBe('Hello, World!')
    })

    test('should use different cache keys for different locales', () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        (_msg, locale) => () => `[${locale}]`,
      )
      const cache = createCompiledCache()

      compileOrInterpolate('hello', 'en', 'general', 'key', {}, compiler, cache)
      compileOrInterpolate('hello', 'de', 'general', 'key', {}, compiler, cache)

      expect(compiler).toHaveBeenCalledTimes(2)
    })

    test('should use different cache keys for different routes', () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        msg => () => msg,
      )
      const cache = createCompiledCache()

      compileOrInterpolate('hello', 'en', 'page1', 'key', {}, compiler, cache)
      compileOrInterpolate('hello', 'en', 'page2', 'key', {}, compiler, cache)

      expect(compiler).toHaveBeenCalledTimes(2)
    })
  })
})
