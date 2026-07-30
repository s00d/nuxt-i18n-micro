import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { hashTranslationSources } from '../src/payload-stats'

/**
 * The fingerprint replaces a build timestamp in the `?v=` of `_locales` requests.
 * Those responses are served `immutable` for a year, so the value has to move when —
 * and only when — the translations move: a timestamp made every deploy re-download
 * the whole dictionary, and a value that missed an edit would pin a stale one.
 */
describe('hashTranslationSources', () => {
  let root: string
  let dir: string

  const write = (rel: string, body: unknown) => {
    const file = join(dir, rel)
    mkdirSync(join(file, '..'), { recursive: true })
    writeFileSync(file, JSON.stringify(body))
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'i18n-hash-'))
    dir = join(root, 'locales')
    mkdirSync(dir, { recursive: true })
    write('en.json', { greeting: 'Hello' })
    write('pages/about/en.json', { title: 'About' })
  })

  afterEach(() => rmSync(root, { recursive: true, force: true }))

  it('is stable across calls', () => {
    expect(hashTranslationSources([root], 'locales')).toBe(hashTranslationSources([root], 'locales'))
  })

  it('changes when a translation value changes', () => {
    const before = hashTranslationSources([root], 'locales')
    write('en.json', { greeting: 'Hi' })
    expect(hashTranslationSources([root], 'locales')).not.toBe(before)
  })

  it('changes when a file is added, and returns to the old value once it is removed', () => {
    const before = hashTranslationSources([root], 'locales')
    write('de.json', { greeting: 'Hallo' })
    const withExtra = hashTranslationSources([root], 'locales')
    expect(withExtra).not.toBe(before)

    rmSync(join(dir, 'de.json'))
    // Content-addressed, not incremental: reverting an edit must give the old URL back.
    expect(hashTranslationSources([root], 'locales')).toBe(before)
  })

  it('distinguishes the same content under a different name', () => {
    const before = hashTranslationSources([root], 'locales')
    rmSync(join(dir, 'en.json'))
    write('fr.json', { greeting: 'Hello' })
    expect(hashTranslationSources([root], 'locales')).not.toBe(before)
  })

  it('depends on layer order, since later layers override earlier ones', () => {
    const other = mkdtempSync(join(tmpdir(), 'i18n-hash-b-'))
    mkdirSync(join(other, 'locales'), { recursive: true })
    writeFileSync(join(other, 'locales', 'en.json'), JSON.stringify({ greeting: 'Hey' }))

    try {
      const ab = hashTranslationSources([root, other], 'locales')
      const ba = hashTranslationSources([other, root], 'locales')
      expect(ab).not.toBe(ba)
    } finally {
      rmSync(other, { recursive: true, force: true })
    }
  })

  it('returns null when there is nothing to hash, so the caller can fall back', () => {
    expect(hashTranslationSources([join(root, 'nope')], 'locales')).toBeNull()
    expect(hashTranslationSources([], 'locales')).toBeNull()
  })
})
