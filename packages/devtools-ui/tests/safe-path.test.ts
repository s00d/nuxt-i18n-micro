import { expect, test } from 'vitest'
import { mkdirSync, mkdtempSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { safeResolvePath } from '../src/safe-path'

// The vite plugin's save endpoint resolves every `file` from the devtools UI through this before
// it reads or writes: whatever the UI sends must stay inside the project.
test('save targets resolve inside the project; traversal and symlinks out of it are refused', () => {
  const sandbox = realpathSync(mkdtempSync(join(tmpdir(), 'i18n-devtools-')))
  const root = join(sandbox, 'app')
  mkdirSync(join(root, 'locales/pages'), { recursive: true })
  mkdirSync(join(sandbox, 'app-evil'))
  mkdirSync(join(sandbox, 'outside'))
  mkdirSync(join(root, 'shared-src'))
  symlinkSync(join(root, 'shared-src'), join(root, 'locales/shared'))
  symlinkSync(join(sandbox, 'outside'), join(root, 'locales/escape'))
  symlinkSync(join(root, 'definitely-missing-target'), join(root, 'dangling'))
  writeFileSync(join(root, 'locales/en.json'), '{}')

  // Existing files, files still to be created, and paths the UI sends with leading or doubled slashes.
  expect(safeResolvePath(root, 'locales/en.json')).toBe(join(root, 'locales/en.json'))
  expect(safeResolvePath(root, 'locales/pages/new/deep/de.json')).toBe(join(root, 'locales/pages/new/deep/de.json'))
  expect(safeResolvePath(root, '/locales/en.json')).toBe(join(root, 'locales/en.json'))
  expect(safeResolvePath(root, '//locales//pages///en.json')).toBe(join(root, 'locales/pages/en.json'))
  expect(safeResolvePath(root, 'locales/pages/../en.json')).toBe(join(root, 'locales/en.json'))
  expect(safeResolvePath(root, '')).toBe(root)
  // A path under an existing file cannot exist yet, but it is still inside the project.
  expect(safeResolvePath(root, 'locales/en.json/x.json')).toBe(join(root, 'locales/en.json/x.json'))
  // A symlink whose target stays in the project is fine.
  expect(safeResolvePath(root, 'locales/shared/en.json')).toBe(join(root, 'locales/shared/en.json'))

  const denied = /^Access denied: /
  expect(() => safeResolvePath(root, '../../../etc/passwd')).toThrow(denied)
  expect(() => safeResolvePath(root, '..')).toThrow(`Access denied: Path ${sandbox} is outside project root`)
  expect(() => safeResolvePath(root, '../app-evil/en.json')).toThrow(denied)
  expect(() => safeResolvePath(root, 'locales/escape/en.json')).toThrow(denied)
  expect(() => safeResolvePath(root, 'locales/escape')).toThrow(denied)
  expect(() => safeResolvePath(root, 'dangling/en.json')).toThrow(
    `Access denied: Path ${join(root, 'dangling/en.json')} resolves through an invalid symlink`,
  )
})
