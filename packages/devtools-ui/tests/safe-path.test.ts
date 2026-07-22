import { describe, expect, it } from 'vitest'
import { safeResolvePath } from '../src/safe-path'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtempSync } from 'node:fs'

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
})
