import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { loadMessages, loadTranslationBuckets } from '../src/load-messages'

let tmp = ''

afterEach(() => {
  if (tmp) {
    rmSync(tmp, { recursive: true, force: true })
    tmp = ''
  }
})

describe('loadMessages', () => {
  it('loads root locale JSON files', () => {
    tmp = mkdtempSync(join(tmpdir(), 'i18n-vp-'))
    writeFileSync(join(tmp, 'en.json'), JSON.stringify({ hello: 'Hello' }))
    writeFileSync(join(tmp, 'fr.json'), JSON.stringify({ hello: 'Bonjour' }))

    const messages = loadMessages({ translationDir: tmp })
    expect(messages.en).toEqual({ hello: 'Hello' })
    expect(messages.fr).toEqual({ hello: 'Bonjour' })
  })

  it('returns empty object for missing dir', () => {
    expect(loadMessages({ translationDir: join(tmpdir(), 'i18n-vp-missing-' + Date.now()) })).toEqual({})
  })

  it('skips non-object JSON values', () => {
    tmp = mkdtempSync(join(tmpdir(), 'i18n-vp-'))
    writeFileSync(join(tmp, 'en.json'), JSON.stringify({ hello: 'Hello' }))
    writeFileSync(join(tmp, 'fr.json'), JSON.stringify(['not', 'an', 'object']))
    const messages = loadMessages({ translationDir: tmp })
    expect(messages.en).toEqual({ hello: 'Hello' })
    expect(messages.fr).toBeUndefined()
  })
})

describe('loadTranslationBuckets', () => {
  it('loads page-scoped dictionaries', () => {
    tmp = mkdtempSync(join(tmpdir(), 'i18n-vp-'))
    mkdirSync(join(tmp, 'pages', 'guide', 'demo'), { recursive: true })
    writeFileSync(join(tmp, 'en.json'), JSON.stringify({ root: 'R' }))
    writeFileSync(join(tmp, 'pages', 'guide', 'demo', 'en.json'), JSON.stringify({ page: 'P' }))

    const buckets = loadTranslationBuckets({ translationDir: tmp })
    expect(buckets.root.en).toEqual({ root: 'R' })
    expect(buckets.routes['guide-demo']?.en).toEqual({ page: 'P' })
  })

  it('merges page files into root when disablePageLocales', () => {
    tmp = mkdtempSync(join(tmpdir(), 'i18n-vp-'))
    mkdirSync(join(tmp, 'pages', 'a'), { recursive: true })
    mkdirSync(join(tmp, 'pages', 'b'), { recursive: true })
    writeFileSync(join(tmp, 'en.json'), JSON.stringify({ root: 'R' }))
    writeFileSync(join(tmp, 'pages', 'a', 'en.json'), JSON.stringify({ a: 'A' }))
    writeFileSync(join(tmp, 'pages', 'b', 'en.json'), JSON.stringify({ b: 'B' }))

    const buckets = loadTranslationBuckets({ translationDir: tmp, disablePageLocales: true })
    expect(buckets.root.en).toEqual({ root: 'R', a: 'A', b: 'B' })
    expect(buckets.routes).toEqual({})
  })
})
