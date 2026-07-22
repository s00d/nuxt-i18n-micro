import { describe, expect, it } from 'vitest'
import { mkdtempSync, symlinkSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { safeResolvePath } from '../src/safe-path'

describe('safeResolvePath', () => {
  it('resolves paths inside project root', () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-devtools-'))
    const resolved = safeResolvePath(root, 'locales/en.json')
    expect(resolved).toBe(join(root, 'locales/en.json'))
  })

  it('rejects path traversal outside project root', () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-devtools-'))
    expect(() => safeResolvePath(root, '../../../etc/passwd')).toThrow(/Access denied/)
  })

  it('rejects writes through a dangling symlink', () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-devtools-'))
    const linkPath = join(root, 'locales')
    const missingTarget = join(root, 'definitely-missing-target')
    symlinkSync(missingTarget, linkPath)
    expect(() => safeResolvePath(root, 'locales/en.json')).toThrow(/Access denied/)
  })
})
