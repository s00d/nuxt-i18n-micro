import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, describe, expect, test } from 'vitest'
import { isInside, resolveTranslationFile } from '../../src/devtools'

describe('devtools save path guard', () => {
  const root = mkdtempSync(join(tmpdir(), 'i18n-devtools-'))
  afterAll(() => rmSync(root, { recursive: true, force: true }))

  test('a save names an existing .json inside the locales dir, nothing else', () => {
    // step 1: isInside rejects traversal, absolute paths, the dir itself and a sibling with the same prefix
    const locales = '/app/locales'
    expect(isInside(locales, resolve(locales, '../../package.json'))).toBe(false)
    expect(isInside(locales, resolve(locales, '/etc/passwd'))).toBe(false)
    expect(isInside(locales, resolve(locales, '.'))).toBe(false)
    expect(isInside(locales, resolve(locales, '../locales-other/en.json'))).toBe(false)

    // step 2: on disk: a nested file resolves; traversal, a symlink out, a missing file and the dir do not
    const dir = join(root, 'locales')
    mkdirSync(join(dir, 'pages/about'), { recursive: true })
    writeFileSync(join(dir, 'en.json'), '{}')
    writeFileSync(join(dir, 'pages/about/de.json'), '{}')
    writeFileSync(join(root, 'secret.json'), '{}')
    symlinkSync(join(root, 'secret.json'), join(dir, 'link.json'))
    expect(resolveTranslationFile(dir, 'pages/about/de.json')).toMatch(/pages\/about\/de\.json$/)
    expect(resolveTranslationFile(dir, '../secret.json')).toBeNull()
    expect(resolveTranslationFile(dir, 'link.json')).toBeNull()
    expect(resolveTranslationFile(dir, 'missing.json')).toBeNull()
    // a `.json` link to another kind of file inside the dir
    writeFileSync(join(dir, 'config.txt'), 'x')
    symlinkSync(join(dir, 'config.txt'), join(dir, 'alias.json'))
    expect(resolveTranslationFile(dir, 'alias.json')).toBeNull()
    expect(resolveTranslationFile(dir, '../locales')).toBeNull()
  })
})
