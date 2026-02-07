import { describe, expect, test } from '@jest/globals'
import { flattenKeys } from '../src/core/parser'

describe('flattenKeys', () => {
  test('should flatten simple object', () => {
    const obj = {
      greeting: 'Hello',
      welcome: 'Welcome',
    }
    const keys = flattenKeys(obj)
    expect(keys).toEqual(['greeting', 'welcome'])
  })

  test('should flatten nested object', () => {
    const obj = {
      greeting: 'Hello',
      header: {
        title: 'Welcome',
        subtitle: 'Subtitle',
      },
    }
    const keys = flattenKeys(obj)
    expect(keys.sort()).toEqual(['greeting', 'header.title', 'header.subtitle'].sort())
  })

  test('should flatten deeply nested object', () => {
    const obj = {
      errors: {
        validation: {
          required: 'Required field',
          email: 'Invalid email',
        },
        server: {
          500: 'Server error',
        },
      },
    }
    const keys = flattenKeys(obj)
    expect(keys.sort()).toEqual(['errors.validation.required', 'errors.validation.email', 'errors.server.500'].sort())
  })

  test('should handle pluralization as single key', () => {
    const obj = {
      apples: 'no apples | one apple | {count} apples',
    }
    const keys = flattenKeys(obj)
    expect(keys).toEqual(['apples'])
  })

  test('should handle arrays as single key', () => {
    const obj = {
      items: ['item1', 'item2'],
    }
    const keys = flattenKeys(obj)
    expect(keys).toEqual(['items'])
  })

  test('should handle empty object', () => {
    const obj = {}
    const keys = flattenKeys(obj)
    expect(keys).toEqual([])
  })

  test('should handle mixed types', () => {
    const obj = {
      string: 'text',
      number: 123,
      boolean: true,
      null: null,
      nested: {
        key: 'value',
      },
      array: [1, 2, 3],
    }
    const keys = flattenKeys(obj)
    expect(keys.sort()).toEqual(['string', 'number', 'boolean', 'null', 'nested.key', 'array'].sort())
  })
})
