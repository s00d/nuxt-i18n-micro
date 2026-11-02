import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { preMergeLocales } from '../../../src/build/build'

describe('additionalTranslationDirs', () => {
  const dirs: string[] = []

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('preMergeLocales emits only the locales it is given: a disabled one has no public payload', async () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-premerge-'))
    dirs.push(root)
    mkdirSync(join(root, 'locales', 'pages', 'index'), { recursive: true })
    writeFileSync(join(root, 'locales', 'en.json'), JSON.stringify({ hello: 'Hello' }))
    writeFileSync(join(root, 'locales', 'fr.json'), JSON.stringify({ hello: 'Bonjour' }))
    writeFileSync(join(root, 'locales', 'pages', 'index', 'en.json'), JSON.stringify({ page: 'Home' }))
    writeFileSync(join(root, 'locales', 'pages', 'index', 'fr.json'), JSON.stringify({ page: 'Accueil' }))

    const outputDir = join(root, 'out')
    await preMergeLocales({ rootDirs: [root], translationDirName: 'locales', outputDir, locales: [{ code: 'en' }] })

    expect(JSON.parse(readFileSync(join(outputDir, 'index', 'en', 'data.json'), 'utf-8'))).toMatchObject({ hello: 'Hello', page: 'Home' })
    expect(() => readFileSync(join(outputDir, 'index', 'fr', 'data.json'))).toThrow()
  })

  it('preMergeLocales emits a route with no folder: a static host has no server route to answer it', async () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-premerge-routes-'))
    dirs.push(root)
    mkdirSync(join(root, 'locales', 'pages', 'parent'), { recursive: true })
    writeFileSync(join(root, 'locales', 'en.json'), JSON.stringify({ hello: 'Hello' }))
    writeFileSync(join(root, 'locales', 'pages', 'parent', 'en.json'), JSON.stringify({ page: 'Parent' }))

    const outputDir = join(root, 'out')
    await preMergeLocales({
      rootDirs: [root],
      translationDirName: 'locales',
      outputDir,
      locales: [{ code: 'en' }],
      routeNames: ['parent', 'parent-id'],
    })

    expect(JSON.parse(readFileSync(join(outputDir, 'parent', 'en', 'data.json'), 'utf-8'))).toEqual({ hello: 'Hello', page: 'Parent' })
    expect(JSON.parse(readFileSync(join(outputDir, 'parent-id', 'en', 'data.json'), 'utf-8'))).toEqual({ hello: 'Hello' })

    const disabled = join(root, 'disabled')
    await preMergeLocales({
      rootDirs: [root],
      translationDirName: 'locales',
      outputDir: disabled,
      locales: [{ code: 'en' }],
      disablePageLocales: true,
      routeNames: ['parent-id'],
    })
    expect(() => readFileSync(join(disabled, 'parent-id', 'en', 'data.json'))).toThrow()
  })

  it('preMergeLocales supports locale that exists only in additional dir', async () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-premerge-add-only-'))
    dirs.push(root)
    mkdirSync(join(root, 'common'), { recursive: true })
    mkdirSync(join(root, 'frontend'), { recursive: true })
    writeFileSync(join(root, 'common', 'en.json'), JSON.stringify({ only: 'common' }))
    // no frontend/en.json

    const outputDir = join(root, 'out')
    await preMergeLocales({
      rootDirs: [root],
      translationDirName: 'frontend',
      outputDir,
      locales: [{ code: 'en' }],
      disablePageLocales: true,
      additionalTranslationDirs: ['common'],
    })

    expect(JSON.parse(readFileSync(join(outputDir, 'index', 'en', 'data.json'), 'utf-8'))).toEqual({
      only: 'common',
    })
  })
})
