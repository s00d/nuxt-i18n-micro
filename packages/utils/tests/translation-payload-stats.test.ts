import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { scanTranslationPayloadDirectory } from '../src/payload-stats'

describe('scanTranslationPayloadDirectory', () => {
  it('counts json files recursively', () => {
    const dir = mkdtempSync(join(tmpdir(), 'i18n-payload-stats-'))
    mkdirSync(join(dir, 'pages', 'index'), { recursive: true })
    writeFileSync(join(dir, 'en.json'), '{"a":1}')
    writeFileSync(join(dir, 'pages', 'index', 'en.json'), '{"b":2}')

    const stats = scanTranslationPayloadDirectory(dir)
    expect(stats.fileCount).toBe(2)
    expect(stats.totalBytes).toBeGreaterThan(0)
  })

  it('returns zero stats for missing directory', () => {
    expect(scanTranslationPayloadDirectory('/nonexistent/path')).toEqual({ fileCount: 0, totalBytes: 0 })
  })
})
