import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import type { Locale } from '@i18n-micro/types'
import { RouteGenerator } from '../src/index'

function join(...parts: string[]) {
  return path.join(...parts)
}

describe('RouteGenerator.ensureTranslationFilesExist', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(join(os.tmpdir(), 'route-strategy-i18n-'))
  })

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
    catch {
      // ignore
    }
  })

  test('creates global JSON per locale', () => {
    const locales: Locale[] = [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
    ]
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const translationDir = 'locales'
    generator.ensureTranslationFilesExist([], translationDir, tmpDir)

    expect(fs.existsSync(join(tmpDir, translationDir, 'en.json'))).toBe(true)
    expect(fs.existsSync(join(tmpDir, translationDir, 'de.json'))).toBe(true)
    expect(JSON.parse(fs.readFileSync(join(tmpDir, translationDir, 'en.json'), 'utf-8'))).toEqual({})
  })

  test('creates per-page JSON when disablePageLocales is false', () => {
    const locales: Locale[] = [{ code: 'en', iso: 'en-US' }]
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const translationDir = 'locales'
    const pagesNames = ['index', 'about', 'users-id']
    generator.ensureTranslationFilesExist(pagesNames, translationDir, tmpDir, false)

    expect(fs.existsSync(join(tmpDir, translationDir, 'en.json'))).toBe(true)
    expect(fs.existsSync(join(tmpDir, translationDir, 'pages', 'index', 'en.json'))).toBe(true)
    expect(fs.existsSync(join(tmpDir, translationDir, 'pages', 'about', 'en.json'))).toBe(true)
    expect(fs.existsSync(join(tmpDir, translationDir, 'pages', 'users-id', 'en.json'))).toBe(true)
  })

  test('does not create per-page JSON when disablePageLocales is true', () => {
    const locales: Locale[] = [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
    ]
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const translationDir = 'locales'
    generator.ensureTranslationFilesExist(['about'], translationDir, tmpDir, true)

    expect(fs.existsSync(join(tmpDir, translationDir, 'en.json'))).toBe(true)
    expect(fs.existsSync(join(tmpDir, translationDir, 'de.json'))).toBe(true)
    expect(fs.existsSync(join(tmpDir, translationDir, 'pages', 'about', 'en.json'))).toBe(false)
  })

  test('creates dirs recursively', () => {
    const locales: Locale[] = [{ code: 'en' }]
    const generator = new RouteGenerator({
      locales,
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const translationDir = 'i18n/translations'
    generator.ensureTranslationFilesExist(['nested-page'], translationDir, tmpDir)

    expect(fs.existsSync(join(tmpDir, translationDir, 'en.json'))).toBe(true)
    expect(fs.existsSync(join(tmpDir, translationDir, 'pages', 'nested-page', 'en.json'))).toBe(true)
  })

  test('uses resolved locales (disabled filtered out)', () => {
    const rawLocales: Locale[] = [
      { code: 'en', iso: 'en-US' },
      { code: 'de', disabled: true },
      { code: 'ru', iso: 'ru-RU' },
    ]
    const generator = new RouteGenerator({
      locales: rawLocales,
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    const translationDir = 'locales'
    generator.ensureTranslationFilesExist([], translationDir, tmpDir)

    expect(fs.existsSync(join(tmpDir, translationDir, 'en.json'))).toBe(true)
    expect(fs.existsSync(join(tmpDir, translationDir, 'de.json'))).toBe(false)
    expect(fs.existsSync(join(tmpDir, translationDir, 'ru.json'))).toBe(true)
  })
})
