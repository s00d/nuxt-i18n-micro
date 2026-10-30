import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { listTranslationFiles, loadTranslationDir, loadTranslationDirAsync } from '../src/load-dir'

let dir: string
const write = (file: string, data: string) => {
  const full = join(dir, file)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, data)
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'i18n-load-dir-'))
})
afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
  vi.restoreAllMocks()
})

describe('the sync and async readers agree', () => {
  test('on every odd file a locales directory can hold', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    write('en.json', '{"hello":"Hello"}')
    write('de.json', '﻿{"hello":"Hallo"}')
    write('array.json', '[1]')
    write('null.json', 'null')
    write('scalar.json', '"x"')
    write('broken.json', '{')
    write('notes.txt', 'ignored')
    write('pages/about/en.json', '{"title":"About"}')
    write('pages/user/profile/de.json', '{"title":"Profil"}')
    write('real/fr.json', '{"hello":"Salut"}')
    symlinkSync(join(dir, 'real/fr.json'), join(dir, 'fr.json'))
    symlinkSync(join(dir, 'nowhere.json'), join(dir, 'dangling.json'))
    mkdirSync(join(dir, 'folder.json'))

    const expected = {
      root: { de: { hello: 'Hallo' }, en: { hello: 'Hello' }, fr: { hello: 'Salut' } },
      routes: { about: { en: { title: 'About' } }, 'user-profile': { de: { title: 'Profil' } } },
    }
    expect(loadTranslationDir(dir)).toEqual(expected)
    expect(error).toHaveBeenCalledTimes(4)
    expect(await loadTranslationDirAsync(dir)).toEqual(expected)
    expect(error).toHaveBeenCalledTimes(8)
  })

  test('disablePageLocales folds page files into the root', async () => {
    write('en.json', '{"a":"root"}')
    write('pages/x/en.json', '{"a":"page","b":"page"}')
    const expected = { root: { en: { a: 'page', b: 'page' } }, routes: {} }
    expect(loadTranslationDir(dir, true)).toEqual(expected)
    expect(await loadTranslationDirAsync(dir, true)).toEqual(expected)
  })

  test('a missing directory warns and reads as empty', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(loadTranslationDir(join(dir, 'nope'))).toEqual({ root: {}, routes: {} })
    expect(await loadTranslationDirAsync(join(dir, 'nope'))).toEqual({ root: {}, routes: {} })
    expect(warn).toHaveBeenCalledTimes(2)
    expect(warn.mock.calls[0]![0]).toBe(`[i18n] Translation directory not found: ${join(dir, 'nope')}`)
  })

  test('a file in place of the directory is reported', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    write('en.json', '{}')
    expect(listTranslationFiles(join(dir, 'en.json'))).toEqual([])
    expect(error.mock.calls[0]![1]).toMatchObject({ code: 'ENOTDIR' })
  })
})

describe('listTranslationFiles', () => {
  test('is sorted, with `/` paths relative to the directory', () => {
    write('z.json', '{}')
    write('pages/b/en.json', '{}')
    write('a.json', '{}')
    expect(listTranslationFiles(dir).map((file) => file.relativePath)).toEqual(['a.json', 'pages/b/en.json', 'z.json'])
    expect(listTranslationFiles(dir)[0]!.absolutePath).toBe(join(dir, 'a.json'))
  })

  test('a symlink back up the tree ends', () => {
    write('sub/en.json', '{}')
    symlinkSync(dir, join(dir, 'sub', 'up'))
    expect(listTranslationFiles(dir).map((file) => file.relativePath)).toEqual(['sub/en.json'])
  })

  test('a symlinked directory is followed once', () => {
    write('real/en.json', '{}')
    symlinkSync(join(dir, 'real'), join(dir, 'alias'))
    expect(listTranslationFiles(dir)).toHaveLength(1)
  })
})
