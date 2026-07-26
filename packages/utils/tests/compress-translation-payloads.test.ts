import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { brotliDecompressSync, gunzipSync } from 'node:zlib'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { compressTranslationPayloads } from '../src/payload-stats'

/**
 * Nitro compresses public assets before the hook that copies translation payloads
 * into the public directory, so `compressPublicAssets` never reaches them. This
 * applies the user's setting to those files — it must not compress on its own.
 */
describe('compressTranslationPayloads', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'i18n-gz-'))
    writeFileSync(join(dir, 'en.json'), JSON.stringify({ greeting: 'Hello'.repeat(200) }))
    mkdirSync(join(dir, 'pages', 'about'), { recursive: true })
    writeFileSync(join(dir, 'pages', 'about', 'en.json'), JSON.stringify({ title: 'About' }))
    writeFileSync(join(dir, 'notes.txt'), 'not a payload')
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('writes gzip and brotli siblings for every JSON, recursively', () => {
    expect(compressTranslationPayloads(dir, true)).toBe(2)

    for (const rel of ['en.json', join('pages', 'about', 'en.json')]) {
      const source = readFileSync(join(dir, rel))
      expect(gunzipSync(readFileSync(`${join(dir, rel)}.gz`))).toEqual(source)
      expect(brotliDecompressSync(readFileSync(`${join(dir, rel)}.br`))).toEqual(source)
    }
  })

  it('leaves non-JSON files alone', () => {
    compressTranslationPayloads(dir, true)
    expect(existsSync(join(dir, 'notes.txt.gz'))).toBe(false)
  })

  it("does nothing when compression is off — the setting is the user's call", () => {
    expect(compressTranslationPayloads(dir, undefined)).toBe(0)
    expect(compressTranslationPayloads(dir, false)).toBe(0)
    expect(existsSync(join(dir, 'en.json.gz'))).toBe(false)
  })

  it('honours a per-encoding selection', () => {
    compressTranslationPayloads(dir, { gzip: true, brotli: false })
    expect(existsSync(join(dir, 'en.json.gz'))).toBe(true)
    expect(existsSync(join(dir, 'en.json.br'))).toBe(false)
  })

  it('tolerates a missing directory', () => {
    expect(compressTranslationPayloads(join(dir, 'nope'), true)).toBe(0)
  })

  it('actually shrinks a repetitive payload', () => {
    compressTranslationPayloads(dir, true)
    const raw = readFileSync(join(dir, 'en.json')).length
    expect(readFileSync(join(dir, 'en.json.gz')).length).toBeLessThan(raw)
  })
})
