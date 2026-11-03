import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, describe, expect, test } from 'vitest'
import { isInsideDir, resolveTranslationFile } from '@i18n-micro/utils/load-dir'

describe('devtools save path guard', () => {
  const root = mkdtempSync(join(tmpdir(), 'i18n-devtools-'))
  afterAll(() => rmSync(root, { recursive: true, force: true }))

  test('a save names an existing .json inside the locales dir, nothing else', () => {
    // step 1: isInsideDir rejects traversal, absolute paths, the dir itself and a sibling with the same prefix
    const locales = '/app/locales'
    expect(isInsideDir(resolve(locales, '../../package.json'), locales)).toBe(false)
    expect(isInsideDir(resolve(locales, '/etc/passwd'), locales)).toBe(false)
    expect(isInsideDir(resolve(locales, '.'), locales)).toBe(false)
    expect(isInsideDir(resolve(locales, '../locales-other/en.json'), locales)).toBe(false)

    // step 2: on disk: a nested file resolves; traversal, a symlink out, a missing file and the dir do not
    const dir = join(root, 'locales')
    mkdirSync(join(dir, 'pages/about'), { recursive: true })
    writeFileSync(join(dir, 'en.json'), '{}')
    writeFileSync(join(dir, 'pages/about/de.json'), '{}')
    writeFileSync(join(root, 'secret.json'), '{}')
    symlinkSync(join(root, 'secret.json'), join(dir, 'link.json'))
    expect(resolveTranslationFile(dir, 'pages/about/de.json')).toMatch(/pages[\\/]about[\\/]de\.json$/)
    expect(resolveTranslationFile(dir, '../secret.json')).toBeNull()
    expect(resolveTranslationFile(dir, 'link.json')).toBeNull()
    expect(resolveTranslationFile(dir, 'missing.json')).toBeNull()
    // a `.json` link to another kind of file inside the dir
    writeFileSync(join(dir, 'config.txt'), 'x')
    symlinkSync(join(dir, 'config.txt'), join(dir, 'alias.json'))
    expect(resolveTranslationFile(dir, 'alias.json')).toBeNull()
    expect(resolveTranslationFile(dir, '../locales')).toBeNull()
    // an absolute path out of the dir, and a directory with a `.json` name: the write would fail on it
    expect(resolveTranslationFile(dir, join(root, 'secret.json'))).toBeNull()
    mkdirSync(join(dir, 'folder.json'))
    expect(resolveTranslationFile(dir, 'folder.json')).toBeNull()
  })
})
