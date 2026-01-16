import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { translate, clearCompiledCache, type I18nState } from '../src/client/core'
import type { MessageCompilerFunc } from '@i18n-micro/types'

// Clear compiled cache before each test to ensure isolation
beforeEach(() => {
  clearCompiledCache()
})

describe('translate (client/core)', () => {
  describe('messageCompiler', () => {
    test('should use messageCompiler when provided', () => {
      const compiler = jest.fn<MessageCompilerFunc>((msg: string) => () => msg.toUpperCase())
      const state: I18nState = {
        locale: 'en',
        fallbackLocale: 'en',
        currentRoute: 'general',
        messageCompiler: compiler,
        translations: {
          general: {
            greeting: 'hello world',
          },
        },
      }

      const result = translate(state, 'greeting')
      expect(result).toBe('HELLO WORLD')
      expect(compiler).toHaveBeenCalledWith('hello world', 'en', 'greeting')
    })

    test('should cache compiled messages', () => {
      const compiler = jest.fn<MessageCompilerFunc>((msg: string) => () => msg.toUpperCase())
      const state: I18nState = {
        locale: 'en',
        fallbackLocale: 'en',
        currentRoute: 'general',
        messageCompiler: compiler,
        translations: {
          general: {
            greeting: 'hello',
          },
        },
      }

      translate(state, 'greeting')
      translate(state, 'greeting')
      translate(state, 'greeting')

      // Compiler should be called only once due to caching
      expect(compiler).toHaveBeenCalledTimes(1)
    })

    test('should use different cache keys for different messages', () => {
      const compiler = jest.fn<MessageCompilerFunc>((msg: string) => () => msg.toUpperCase())
      const state: I18nState = {
        locale: 'en',
        fallbackLocale: 'en',
        currentRoute: 'general',
        messageCompiler: compiler,
        translations: {
          general: {
            greeting: 'hello',
            farewell: 'goodbye',
          },
        },
      }

      translate(state, 'greeting')
      translate(state, 'farewell')

      // Compiler should be called twice (different messages)
      expect(compiler).toHaveBeenCalledTimes(2)
    })

    test('should use different cache keys for different locales', () => {
      const compiler = jest.fn<MessageCompilerFunc>((msg: string, locale: string) => () => `[${locale}]${msg}`)
      const stateEn: I18nState = {
        locale: 'en',
        fallbackLocale: 'en',
        currentRoute: 'general',
        messageCompiler: compiler,
        translations: {
          general: {
            greeting: 'hello',
          },
        },
      }
      const stateDe: I18nState = {
        locale: 'de',
        fallbackLocale: 'de',
        currentRoute: 'general',
        messageCompiler: compiler,
        translations: {
          general: {
            greeting: 'hello',
          },
        },
      }

      translate(stateEn, 'greeting')
      translate(stateDe, 'greeting')

      // Compiler should be called twice (different locales)
      expect(compiler).toHaveBeenCalledTimes(2)
      expect(compiler).toHaveBeenCalledWith('hello', 'en', 'greeting')
      expect(compiler).toHaveBeenCalledWith('hello', 'de', 'greeting')
    })

    test('should use different cache keys for different routes', () => {
      const compiler = jest.fn<MessageCompilerFunc>((msg: string) => () => msg.toUpperCase())
      const state: I18nState = {
        locale: 'en',
        fallbackLocale: 'en',
        currentRoute: 'home',
        messageCompiler: compiler,
        translations: {
          general: {
            title: 'General Title',
          },
          home: {
            title: 'Home Title',
          },
        },
      }

      translate(state, 'title') // Uses home route
      translate(state, 'title', undefined, undefined, 'general') // Uses general route

      // Compiler should be called twice (different routes)
      expect(compiler).toHaveBeenCalledTimes(2)
    })

    test('should fallback to interpolation when messageCompiler throws', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      const compiler = jest.fn<MessageCompilerFunc>(() => {
        throw new Error('Compiler error')
      })
      const state: I18nState = {
        locale: 'en',
        fallbackLocale: 'en',
        currentRoute: 'general',
        messageCompiler: compiler,
        translations: {
          general: {
            greeting: 'Hello, {name}!',
          },
        },
      }

      const result = translate(state, 'greeting', { name: 'John' })
      expect(result).toBe('Hello, John!')
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })

    test('should use full content in cache key (not truncated)', () => {
      const compiler = jest.fn<MessageCompilerFunc>((msg: string) => () => msg)
      const longMessage = 'a'.repeat(100) + 'b'.repeat(100)
      const state: I18nState = {
        locale: 'en',
        fallbackLocale: 'en',
        currentRoute: 'general',
        messageCompiler: compiler,
        translations: {
          general: {
            long: longMessage,
          },
        },
      }

      translate(state, 'long')
      // Change message after first 50 chars but keep same length
      const modifiedMessage = 'a'.repeat(50) + 'X' + 'a'.repeat(49) + 'b'.repeat(100)
      state.translations.general.long = modifiedMessage
      translate(state, 'long')

      // Compiler should be called twice because full content is different
      expect(compiler).toHaveBeenCalledTimes(2)
    })
  })
})
