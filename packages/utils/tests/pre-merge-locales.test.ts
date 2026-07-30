import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { preMergeLocales } from '../src/build'

describe('preMergeLocales', () => {
  const dirs: string[] = []

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('emits only locales passed in (skips translation files for omitted codes)', async () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-premerge-'))
    dirs.push(root)
    const translationDir = join(root, 'locales')
    mkdirSync(join(translationDir, 'pages', 'index'), { recursive: true })
    writeFileSync(join(translationDir, 'en.json'), JSON.stringify({ hello: 'Hello' }))
    writeFileSync(join(translationDir, 'fr.json'), JSON.stringify({ hello: 'Bonjour' }))
    writeFileSync(join(translationDir, 'pages', 'index', 'en.json'), JSON.stringify({ page: 'Home' }))
    writeFileSync(join(translationDir, 'pages', 'index', 'fr.json'), JSON.stringify({ page: 'Accueil' }))

    const outputDir = join(root, 'out')
    await preMergeLocales([root], 'locales', outputDir, [{ code: 'en' }])

    expect(JSON.parse(readFileSync(join(outputDir, 'index', 'en', 'data.json'), 'utf-8'))).toMatchObject({
      hello: 'Hello',
      page: 'Home',
    })
    expect(() => readFileSync(join(outputDir, 'index', 'fr', 'data.json'))).toThrow()
  })
})
