import { describe, expect, it } from 'vitest'
import { mkdirSync, writeFileSync, readFileSync, rmSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { dirHasLocaleJson, profileFingerprint } from '../src/perf/generate'
import { createMarkdownWriter } from '../src/perf/report'
import { buildProfile, DEFAULT_KEYS, DEFAULT_LOCALES } from '../src/perf/config'

describe('dirHasLocaleJson', () => {
  it('returns false for missing or empty dirs (fresh clone)', () => {
    const root = mkdtempSync(join(tmpdir(), 'perf-loc-'))
    try {
      expect(dirHasLocaleJson(join(root, 'missing'))).toBe(false)
      const empty = join(root, 'empty')
      mkdirSync(empty)
      expect(dirHasLocaleJson(empty)).toBe(false)
      writeFileSync(join(empty, 'readme.txt'), 'no')
      expect(dirHasLocaleJson(empty)).toBe(false)
      writeFileSync(join(empty, 'de.json'), '{}')
      expect(dirHasLocaleJson(empty)).toBe(true)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('createMarkdownWriter atomic commit', () => {
  it('does not touch the target file until commit()', () => {
    const dir = mkdtempSync(join(tmpdir(), 'perf-md-'))
    const file = join(dir, 'performance-results.md')
    writeFileSync(file, '# previous committed report\n')
    try {
      const profile = buildProfile(DEFAULT_LOCALES, DEFAULT_KEYS)
      const md = createMarkdownWriter(true, file)
      md.init(profile, 1)
      md.write('\n## Build Performance for test\n')
      expect(readFileSync(file, 'utf8')).toBe('# previous committed report\n')
      expect(md.getBuffer()).toContain('Performance Test Results')
      expect(md.getBuffer()).toContain('Build Performance for test')
      md.commit()
      expect(readFileSync(file, 'utf8')).toContain('Performance Test Results')
      expect(readFileSync(file, 'utf8')).not.toContain('previous committed report')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('profileFingerprint', () => {
  it('is stable for the same profile', () => {
    const a = buildProfile(DEFAULT_LOCALES, DEFAULT_KEYS)
    const b = buildProfile(DEFAULT_LOCALES, DEFAULT_KEYS)
    expect(profileFingerprint(a)).toBe(profileFingerprint(b))
  })
})
