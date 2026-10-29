import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, describe, expect, test } from 'vitest'
import { isInside, resolveTranslationFile } from '../../src/devtools'

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

  describe('resolveTranslationFile', () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-devtools-'))
    afterAll(() => rmSync(root, { recursive: true, force: true }))
    const dir = join(root, 'locales')
    mkdirSync(join(dir, 'pages/about'), { recursive: true })
    writeFileSync(join(dir, 'en.json'), '{}')
    writeFileSync(join(dir, 'pages/about/de.json'), '{}')
    writeFileSync(join(root, 'secret.json'), '{}')
    symlinkSync(join(root, 'secret.json'), join(dir, 'link.json'))

    test('an existing .json inside the directory', () => {
      expect(resolveTranslationFile(dir, 'pages/about/de.json')).toMatch(/pages\/about\/de\.json$/)
    })

    test('no traversal, no symlink out of the directory, no missing or non-json file', () => {
      expect(resolveTranslationFile(dir, '../secret.json')).toBeNull()
      expect(resolveTranslationFile(dir, 'link.json')).toBeNull()
      expect(resolveTranslationFile(dir, 'missing.json')).toBeNull()
      expect(resolveTranslationFile(dir, '../locales')).toBeNull()
    })
  })
})
