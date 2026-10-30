import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createI18n, I18n, loadRootTranslations, loadTranslations } from '../src'

let dir: string
const write = (file: string, data: unknown) => {
  const full = join(dir, file)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, typeof data === 'string' ? data : JSON.stringify(data))
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'i18n-node-'))
  write('en.json', { greeting: 'Hello, {name}!', apples: 'no apples | one apple | {count} apples', nav: { home: 'Home' }, title: 'Site' })
  write('de.json', { greeting: 'Hallo, {name}!', nav: { home: 'Startseite' } })
  write('pages/about/en.json', { title: 'About us' })
  write('pages/about/de.json', { title: 'Über uns' })
  write('pages/user/profile/en.json', { title: 'Your profile' })
  write('broken.json', '{ not json')
  write('notes.txt', 'ignored')
  mkdirSync(join(dir, 'folder.json'))
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
  vi.restoreAllMocks()
})

test('an app loads its locales dir, translates per page and locale, and reloads after the files change', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const log = vi.spyOn(console, 'log').mockImplementation(() => {})
  const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', translationDir: dir, missingWarn: false })
  expect(i18n).toBeInstanceOf(I18n)
  expect(i18n.translationDir).toBe(dir)
  await i18n.loadTranslations()

  // only the unreadable file is reported; the non-json file and the `*.json` folder are skipped
  expect(error).toHaveBeenCalledTimes(1)
  expect(error.mock.calls[0]![0]).toBe(`Failed to load translation file ${join(dir, 'broken.json')}:`)

  expect(i18n.t('greeting', { name: 'Ann' })).toBe('Hello, Ann!')
  expect(i18n.tc('apples', 0)).toBe('no apples')
  expect(i18n.tc('apples', 1)).toBe('one apple')
  expect(i18n.tc('apples', 7)).toBe('7 apples')
  expect(i18n.t('title')).toBe('Site')

  i18n.setRoute('about')
  expect(i18n.t('title')).toBe('About us')
  // root keys still resolve on a page route
  expect(i18n.t('nav.home')).toBe('Home')
  expect(i18n.t('title', undefined, undefined, 'user-profile')).toBe('Your profile')

  i18n.locale = 'de'
  expect(i18n.t('title')).toBe('Über uns')
  expect(i18n.t('nav.home')).toBe('Startseite')
  // missing in de → fallback locale
  expect(i18n.tc('apples', 7)).toBe('7 apples')

  write('de.json', { greeting: 'Servus, {name}!' })
  rmSync(join(dir, 'pages/about/de.json'))
  await i18n.reload()
  expect(log).toHaveBeenCalledWith('[i18n-node] Cache cleared and translations reloaded.')
  expect(i18n.t('greeting', { name: 'Ann' })).toBe('Servus, Ann!')
  // the deleted de page file no longer answers (en page does); the old de nav is gone too
  expect(i18n.t('title')).toBe('About us')
  expect(i18n.t('nav.home')).toBe('Home')
})

test('disablePageLocales folds page files into the root bucket, page values winning', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const i18n = createI18n({ locale: 'en', translationDir: dir, disablePageLocales: true, missingWarn: false })
  await i18n.loadTranslations()
  expect(i18n.t('greeting', { name: 'Bo' })).toBe('Hello, Bo!')
  expect(['About us', 'Your profile']).toContain(i18n.t('title'))
  i18n.setRoute('about')
  i18n.locale = 'de'
  expect(i18n.t('title')).toBe('Über uns')

  // the standalone loaders return the same buckets the instance consumed
  const split = await loadTranslations(dir)
  expect(Object.keys(split.root).sort()).toEqual(['de', 'en'])
  expect(split.routes).toEqual({
    about: { en: { title: 'About us' }, de: { title: 'Über uns' } },
    'user-profile': { en: { title: 'Your profile' } },
  })
  const folded = await loadTranslations(dir, true)
  expect(folded.routes).toEqual({})
  expect(folded.root.de).toEqual({ greeting: 'Hallo, {name}!', nav: { home: 'Startseite' }, title: 'Über uns' })
  expect(await loadRootTranslations(dir)).toEqual(split.root)
  expect((await loadRootTranslations(dir, true)).de).toEqual(folded.root.de)
})

test('an explicit dir wins over translationDir; a missing dir is quiet, a bad one is reported, no dir only warns', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

  const i18n = createI18n({ locale: 'en', translationDir: join(dir, 'nope'), messages: { en: { kept: 'Kept' } }, missingWarn: false })
  await i18n.loadTranslations()
  expect(error).not.toHaveBeenCalled()
  expect(i18n.t('kept')).toBe('Kept')

  await i18n.loadTranslations(join(dir, 'pages', 'about'))
  expect(i18n.t('title')).toBe('About us')

  expect(await loadTranslations(join(dir, 'en.json'))).toEqual({ root: {}, routes: {} })
  expect(error).toHaveBeenCalledWith(`Failed to read directory ${join(dir, 'en.json')}:`, expect.objectContaining({ code: 'ENOTDIR' }))

  const bare = createI18n({ locale: 'en', messages: { en: { kept: 'Kept' } }, missingWarn: false })
  await bare.loadTranslations()
  await bare.reload()
  expect(warn.mock.calls).toEqual([['[i18n-node] No translation directory specified'], ['[i18n-node] No translation directory specified']])
  expect(bare.t('kept')).toBe('Kept')
})
