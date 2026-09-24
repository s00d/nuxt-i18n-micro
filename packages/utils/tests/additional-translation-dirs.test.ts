import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildTranslationSourceLayers, mergeAdditionalRootLocaleFiles, preMergeLocales } from '../src/build'

describe('additionalTranslationDirs', () => {
  const dirs: string[] = []

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('mergeAdditionalRootLocaleFiles: additional first, primary wins', () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-add-merge-'))
    dirs.push(root)
    mkdirSync(join(root, 'common'), { recursive: true })
    mkdirSync(join(root, 'frontend'), { recursive: true })
    writeFileSync(join(root, 'common', 'en.json'), JSON.stringify({ shared: 'from-common', title: 'common-title' }))
    writeFileSync(join(root, 'frontend', 'en.json'), JSON.stringify({ title: 'frontend-title', app: 'frontend' }))

    const merged = mergeAdditionalRootLocaleFiles([root], ['common'], 'en', JSON.parse(readFileSync(join(root, 'frontend', 'en.json'), 'utf-8')))
    expect(merged).toEqual({
      shared: 'from-common',
      title: 'frontend-title',
      app: 'frontend',
    })
  })

  it('preMergeLocales merges additional root into page payloads', async () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-premerge-add-'))
    dirs.push(root)
    mkdirSync(join(root, 'common'), { recursive: true })
    mkdirSync(join(root, 'frontend', 'pages', 'home'), { recursive: true })
    writeFileSync(join(root, 'common', 'en.json'), JSON.stringify({ shared: 'S', title: 'C' }))
    writeFileSync(join(root, 'frontend', 'en.json'), JSON.stringify({ title: 'F', app: 'A' }))
    writeFileSync(join(root, 'frontend', 'pages', 'home', 'en.json'), JSON.stringify({ page: 'Home' }))

    const outputDir = join(root, 'out')
    await preMergeLocales([root], 'frontend', outputDir, [{ code: 'en' }], undefined, false, ['common'])

    expect(JSON.parse(readFileSync(join(outputDir, 'home', 'en', 'data.json'), 'utf-8'))).toEqual({
      shared: 'S',
      title: 'F',
      app: 'A',
      page: 'Home',
    })
  })

  it('preMergeLocales supports locale that exists only in additional dir', async () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-premerge-add-only-'))
    dirs.push(root)
    mkdirSync(join(root, 'common'), { recursive: true })
    mkdirSync(join(root, 'frontend'), { recursive: true })
    writeFileSync(join(root, 'common', 'en.json'), JSON.stringify({ only: 'common' }))
    // no frontend/en.json

    const outputDir = join(root, 'out')
    await preMergeLocales([root], 'frontend', outputDir, [{ code: 'en' }], undefined, true, ['common'])

    expect(JSON.parse(readFileSync(join(outputDir, 'index', 'en', 'data.json'), 'utf-8'))).toEqual({
      only: 'common',
    })
  })

  it('buildTranslationSourceLayers merges additional into root locale files', async () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-source-add-'))
    dirs.push(root)
    mkdirSync(join(root, 'common'), { recursive: true })
    mkdirSync(join(root, 'frontend'), { recursive: true })
    writeFileSync(join(root, 'common', 'en.json'), JSON.stringify({ shared: 'S', title: 'C' }))
    writeFileSync(join(root, 'frontend', 'en.json'), JSON.stringify({ title: 'F' }))

    const outputDir = join(root, 'out')
    await buildTranslationSourceLayers([root], 'frontend', outputDir, ['common'])

    expect(JSON.parse(readFileSync(join(outputDir, 'en.json'), 'utf-8'))).toEqual({
      shared: 'S',
      title: 'F',
    })
  })

  it('ignores pages/ under additional dirs', async () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-add-ignore-pages-'))
    dirs.push(root)
    mkdirSync(join(root, 'common', 'pages', 'x'), { recursive: true })
    mkdirSync(join(root, 'frontend', 'pages', 'home'), { recursive: true })
    writeFileSync(join(root, 'common', 'en.json'), JSON.stringify({ shared: 'S' }))
    writeFileSync(join(root, 'common', 'pages', 'x', 'en.json'), JSON.stringify({ leak: true }))
    writeFileSync(join(root, 'frontend', 'en.json'), JSON.stringify({ app: 'A' }))
    writeFileSync(join(root, 'frontend', 'pages', 'home', 'en.json'), JSON.stringify({ page: 'Home' }))

    const outputDir = join(root, 'out')
    await preMergeLocales([root], 'frontend', outputDir, [{ code: 'en' }], undefined, false, ['common'])

    const payload = JSON.parse(readFileSync(join(outputDir, 'home', 'en', 'data.json'), 'utf-8'))
    expect(payload).toEqual({ shared: 'S', app: 'A', page: 'Home' })
    expect(payload.leak).toBeUndefined()
  })
})
