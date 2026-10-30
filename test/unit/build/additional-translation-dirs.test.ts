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
})
