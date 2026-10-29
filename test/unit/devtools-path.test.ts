import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { isInside } from '../../src/devtools'

describe('devtools save path guard', () => {
  const locales = '/app/locales'
  test('accepts files inside the translation directory', () => {
    expect(isInside(locales, resolve(locales, 'en.json'))).toBe(true)
    expect(isInside(locales, resolve(locales, 'pages/about/de.json'))).toBe(true)
  })

  test('rejects traversal, absolute paths and the directory itself', () => {
    expect(isInside(locales, resolve(locales, '../../package.json'))).toBe(false)
    expect(isInside(locales, resolve(locales, '/etc/passwd'))).toBe(false)
    expect(isInside(locales, resolve(locales, '.'))).toBe(false)
    expect(isInside(locales, resolve(locales, '../locales-other/en.json'))).toBe(false)
  })
})
