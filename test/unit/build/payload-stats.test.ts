import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { brotliDecompressSync, gunzipSync } from 'node:zlib'
import { afterAll, describe, expect, test } from 'vitest'
import { compressTranslationPayloads, hashTranslationSources, scanTranslationPayloadDirectory } from '../../../src/build/payload-stats'

const root = mkdtempSync(join(tmpdir(), 'i18n-payload-stats-'))
afterAll(() => rmSync(root, { recursive: true, force: true }))
const write = (rel: string, body: unknown) => {
  mkdirSync(dirname(join(root, rel)), { recursive: true })
  writeFileSync(join(root, rel), typeof body === 'string' ? body : JSON.stringify(body))
}

describe('translation payload files after the build', () => {
  /**
   * The fingerprint replaces a build timestamp in the `?v=` of `_locales` requests. Those
   * responses are `immutable` for a year, so it has to move when — and only when — the
   * translations move: a timestamp re-downloads every dictionary per deploy, a missed edit pins a stale one.
   */
  test('source fingerprint follows the translations, content-addressed', () => {
    write('locales/en.json', { greeting: 'Hello' })
    write('locales/pages/about/en.json', { title: 'About' })
    const hash = (additional?: string[]) => hashTranslationSources([root], 'locales', additional)

    // step 1: nothing to hash → null, so the caller can fall back
    expect(hashTranslationSources([join(root, 'nope')], 'locales')).toBeNull()
    expect(hashTranslationSources([], 'locales')).toBeNull()

    // step 2: add a file → new value; remove it → the old value back
    const before = hash()
    write('locales/de.json', { greeting: 'Hallo' })
    expect(hash()).not.toBe(before)
    rmSync(join(root, 'locales/de.json'))
    expect(hash()).toBe(before)

    // step 3: same content under another name is a different fingerprint
    rmSync(join(root, 'locales/en.json'))
    write('locales/fr.json', { greeting: 'Hello' })
    expect(hash()).not.toBe(before)

    // step 4: additionalTranslationDirs: a root file edit counts, its pages/ does not
    write('common/en.json', { shared: 'a' })
    const withCommon = hash(['common'])
    write('common/pages/x/en.json', { leak: true })
    expect(hash(['common'])).toBe(withCommon)
    write('common/en.json', { shared: 'b' })
    expect(hash(['common'])).not.toBe(withCommon)

    // step 5: layers: the order decides which file wins the merge, so reversing it is a new fingerprint
    write('layer/locales/fr.json', { greeting: 'Salut' })
    const layer = join(root, 'layer')
    expect(hashTranslationSources([layer, root], 'locales')).not.toBe(hashTranslationSources([root, layer], 'locales'))
  })

  /**
   * Nitro compresses public assets before the hook that copies translation payloads into the
   * public directory, so `compressPublicAssets` never reaches them. This applies the user's
   * setting to those files — it must not compress on its own.
   */
  test('compression follows the user setting and Nitro size floor; stats count every payload', () => {
    const dir = join(root, 'public')
    const files = ['public/en.json', 'public/pages/about/en.json']
    // both well over Nitro's 1024-byte floor, which this pass mirrors
    write(files[0]!, { greeting: 'Hello'.repeat(400) })
    write(files[1]!, { title: 'About'.repeat(400) })
    write('public/notes.txt', 'not a payload')
    write('public/tiny.json', { a: 'b' })

    // step 1: off (unset or false) → nothing written
    expect(compressTranslationPayloads(dir, undefined)).toBe(0)
    expect(compressTranslationPayloads(dir, false)).toBe(0)
    expect(existsSync(join(dir, 'en.json.gz'))).toBe(false)

    // step 2: gzip only → .gz, no .br
    compressTranslationPayloads(dir, { gzip: true, brotli: false })
    expect(existsSync(join(dir, 'en.json.gz'))).toBe(true)
    expect(existsSync(join(dir, 'en.json.br'))).toBe(false)

    // step 3: on → gzip and brotli siblings for every large JSON, recursively; tiny files skipped
    expect(compressTranslationPayloads(dir, true)).toBe(2)
    for (const rel of files) {
      const source = readFileSync(join(root, rel))
      expect(gunzipSync(readFileSync(join(root, `${rel}.gz`)))).toEqual(source)
      expect(brotliDecompressSync(readFileSync(join(root, `${rel}.br`)))).toEqual(source)
    }
    expect(existsSync(join(dir, 'tiny.json.gz'))).toBe(false)
    expect(existsSync(join(dir, 'tiny.json.br'))).toBe(false)

    // step 4: stats count the JSON payloads only, a missing dir is zero
    expect(scanTranslationPayloadDirectory(dir)).toEqual({
      fileCount: 3,
      totalBytes: files.concat('public/tiny.json').reduce((n, f) => n + readFileSync(join(root, f)).length, 0),
    })
    expect(scanTranslationPayloadDirectory(join(root, 'missing'))).toEqual({ fileCount: 0, totalBytes: 0 })
  })
})
