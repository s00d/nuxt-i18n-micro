/**
 * Unit tests for path utils: parentKeyFromSlashKey, lastPathSegment, nameKeyFirstSlash, nameKeyLastSlash.
 */
import {
  buildUrl,
  getParentPath,
  joinUrl,
  lastPathSegment,
  nameKeyFirstSlash,
  nameKeyLastSlash,
  normalizePath,
  parentKeyFromSlashKey,
  parseQuery,
  transformNameKeyToPath,
} from '../src/path'
import { describe, expect, test } from 'vitest'

describe('parentKeyFromSlashKey', () => {
  test('activity-locale/hiking -> activity-locale', () => {
    expect(parentKeyFromSlashKey('activity-locale/hiking')).toBe('activity-locale')
  })
  test('activity-locale/skiing -> activity-locale', () => {
    expect(parentKeyFromSlashKey('activity-locale/skiing')).toBe('activity-locale')
  })
  test('a/b/c -> a-b', () => {
    expect(parentKeyFromSlashKey('a/b/c')).toBe('a-b')
  })
  test('single segment -> empty string', () => {
    expect(parentKeyFromSlashKey('activity')).toBe('')
    expect(parentKeyFromSlashKey('activity-locale')).toBe('')
  })
  test('empty string -> empty string', () => {
    expect(parentKeyFromSlashKey('')).toBe('')
  })
})

describe('lastPathSegment', () => {
  test('/change-activity/hiking -> hiking', () => {
    expect(lastPathSegment('/change-activity/hiking')).toBe('hiking')
  })
  test('/a/b/c -> c', () => {
    expect(lastPathSegment('/a/b/c')).toBe('c')
  })
  test('/ -> empty', () => {
    expect(lastPathSegment('/')).toBe('')
  })
  test('single segment', () => {
    expect(lastPathSegment('/about')).toBe('about')
  })
  test('empty string -> empty', () => {
    expect(lastPathSegment('')).toBe('')
  })
})

describe('nameKeyFirstSlash / nameKeyLastSlash (nested key derivation)', () => {
  test('activity-locale-hiking: keyLast = activity-locale/hiking, keyFirst = activity/locale-hiking', () => {
    expect(nameKeyLastSlash('activity-locale-hiking')).toBe('activity-locale/hiking')
    expect(nameKeyFirstSlash('activity-locale-hiking')).toBe('activity/locale-hiking')
  })
  test('activity-locale-skiing: keyLast = activity-locale/skiing', () => {
    expect(nameKeyLastSlash('activity-locale-skiing')).toBe('activity-locale/skiing')
  })
  test('parentKeyFromSlashKey(keyLast) for activity-locale-hiking = activity-locale', () => {
    const keyLast = nameKeyLastSlash('activity-locale-hiking')
    expect(parentKeyFromSlashKey(keyLast)).toBe('activity-locale')
  })
})

describe('joinUrl + lastPathSegment (nested path building)', () => {
  test('joinUrl(parentPath, lastPathSegment(pathWithoutLocale))', () => {
    const pathWithoutLocale = '/change-activity/hiking'
    const parentPath = '/change-buchen'
    const segment = lastPathSegment(pathWithoutLocale)
    expect(segment).toBe('hiking')
    expect(normalizePath(joinUrl(parentPath, segment))).toBe('/change-buchen/hiking')
  })
})

describe('getParentPath', () => {
  test('/a/b/c -> /a/b', () => {
    expect(getParentPath('/a/b/c')).toBe('/a/b')
  })

  test('/a -> /', () => {
    expect(getParentPath('/a')).toBe('/')
  })

  test('/ -> null', () => {
    expect(getParentPath('/')).toBeNull()
  })

  test('empty string -> null', () => {
    expect(getParentPath('')).toBeNull()
  })

  test('/a/b -> /a', () => {
    expect(getParentPath('/a/b')).toBe('/a')
  })

  test('/deep/nested/path/here -> /deep/nested/path', () => {
    expect(getParentPath('/deep/nested/path/here')).toBe('/deep/nested/path')
  })
})

describe('transformNameKeyToPath', () => {
  test('activity-skiing-locale -> activity/skiing/locale', () => {
    expect(transformNameKeyToPath('activity-skiing-locale')).toBe('activity/skiing/locale')
  })

  test('simple-name -> simple/name', () => {
    expect(transformNameKeyToPath('simple-name')).toBe('simple/name')
  })

  test('single -> single', () => {
    expect(transformNameKeyToPath('single')).toBe('single')
  })

  test('empty string -> empty string', () => {
    expect(transformNameKeyToPath('')).toBe('')
  })

  test('a-b-c-d -> a/b/c/d', () => {
    expect(transformNameKeyToPath('a-b-c-d')).toBe('a/b/c/d')
  })
})

describe('parseQuery / buildUrl round-trip', () => {
  test('basic pairs', () => {
    expect(parseQuery('a=1&b=2')).toEqual({ a: '1', b: '2' })
    expect(buildUrl('/p', parseQuery('a=1&b=2'))).toBe('/p?a=1&b=2')
  })

  test('leading ? is tolerated', () => {
    expect(parseQuery('?a=1')).toEqual({ a: '1' })
  })

  test('repeated keys collect into an array and round-trip', () => {
    expect(parseQuery('tag=a&tag=b')).toEqual({ tag: ['a', 'b'] })
    expect(buildUrl('/p', parseQuery('tag=a&tag=b'))).toBe('/p?tag=a&tag=b')
  })

  test('a key without = maps to an empty string', () => {
    expect(parseQuery('flag')).toEqual({ flag: '' })
    expect(buildUrl('/p', parseQuery('flag'))).toBe('/p?flag=')
    expect(buildUrl('/p', parseQuery('flag&a=1'))).toBe('/p?flag=&a=1')
    expect(parseQuery('flag&flag=x')).toEqual({ flag: ['', 'x'] })
  })

  test('+ means space, encoded values are decoded', () => {
    expect(parseQuery('q=hello+world')).toEqual({ q: 'hello world' })
    expect(parseQuery('redirect=%2Fdash%3Ftab%3D1')).toEqual({ redirect: '/dash?tab=1' })
  })

  // parseQuery stores keys on a null-prototype object. On a plain object,
  // a key like 'toString' reads the inherited function as a prior value,
  // and '__proto__' does not create an own property.
  test('prototype names land as own properties', () => {
    expect(parseQuery('toString=x')).toEqual({ toString: 'x' })
    expect(parseQuery('constructor=y')).toEqual({ constructor: 'y' })
    // A literal { __proto__: 'z' } would set the prototype, so assert by access.
    expect(parseQuery('__proto__=z')['__proto__']).toBe('z')
  })

  test('encoded delimiters in keys stay unambiguous through buildUrl', () => {
    expect(parseQuery('a%3Db=1')).toEqual({ 'a=b': '1' })
    expect(buildUrl('/p', parseQuery('a%3Db=1'))).toBe('/p?a%3Db=1')
  })

  test('empty and ?-only inputs give an empty object', () => {
    expect(parseQuery('')).toEqual({})
    expect(parseQuery('?')).toEqual({})
  })
})
