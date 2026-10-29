import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadTranslationBuckets } from '../src/plugin/load-messages'

const dirs: string[] = []

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe('loadTranslationBuckets (plugin-internal)', () => {
  it('skips invalid JSON objects', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'i18n-vp-bad-'))
    dirs.push(tmp)
    writeFileSync(join(tmp, 'en.json'), JSON.stringify(['nope']))
    writeFileSync(join(tmp, 'fr.json'), JSON.stringify({ ok: true }))

    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const buckets = loadTranslationBuckets({ translationDir: tmp })
    expect(buckets.root).toEqual({ fr: { ok: true } })
    expect(error).toHaveBeenCalledWith(expect.stringContaining('Skipping en.json'))
    error.mockRestore()
  })

  it('loads page-scoped routes', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'i18n-vp-pages-'))
    dirs.push(tmp)
    writeFileSync(join(tmp, 'en.json'), JSON.stringify({ root: true }))
    mkdirSync(join(tmp, 'pages/guide/demo'), { recursive: true })
    writeFileSync(join(tmp, 'pages/guide/demo/en.json'), JSON.stringify({ page: true }))

    const buckets = loadTranslationBuckets({ translationDir: tmp })
    expect(buckets.root.en).toEqual({ root: true })
    expect(buckets.routes['guide-demo']?.en).toEqual({ page: true })
  })

  it('disablePageLocales folds pages into root', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'i18n-vp-flat-'))
    dirs.push(tmp)
    mkdirSync(join(tmp, 'pages/x'), { recursive: true })
    writeFileSync(join(tmp, 'pages/x/en.json'), JSON.stringify({ fromPage: 1 }))

    const buckets = loadTranslationBuckets({ translationDir: tmp, disablePageLocales: true })
    expect(buckets.root.en).toEqual({ fromPage: 1 })
    expect(buckets.routes).toEqual({})
  })
})
