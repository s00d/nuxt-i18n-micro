import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadMessages, loadTranslationBuckets } from '../src/load-messages'

const tmp = join(import.meta.dirname, '.tmp-locales')

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true })
})

describe('loadMessages', () => {
  it('loads root locale JSON files', () => {
    mkdirSync(tmp, { recursive: true })
    writeFileSync(join(tmp, 'en.json'), JSON.stringify({ hello: 'Hello' }))
    writeFileSync(join(tmp, 'fr.json'), JSON.stringify({ hello: 'Bonjour' }))

    const messages = loadMessages({ translationDir: tmp })
    expect(messages.en).toEqual({ hello: 'Hello' })
    expect(messages.fr).toEqual({ hello: 'Bonjour' })
  })

  it('returns empty object for missing dir', () => {
    expect(loadMessages({ translationDir: join(tmp, 'missing') })).toEqual({})
  })
})

describe('loadTranslationBuckets', () => {
  it('loads page-scoped dictionaries', () => {
    mkdirSync(join(tmp, 'pages', 'guide', 'demo'), { recursive: true })
    writeFileSync(join(tmp, 'en.json'), JSON.stringify({ root: 'R' }))
    writeFileSync(join(tmp, 'pages', 'guide', 'demo', 'en.json'), JSON.stringify({ page: 'P' }))

    const buckets = loadTranslationBuckets({ translationDir: tmp })
    expect(buckets.root.en).toEqual({ root: 'R' })
    expect(buckets.routes['guide-demo']?.en).toEqual({ page: 'P' })
  })
})
