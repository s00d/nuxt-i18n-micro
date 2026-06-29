/**
 * Issue #233 — Nitro traces externals with the production export condition (not import/require).
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const utilsPkg = JSON.parse(readFileSync(join(rootDir, 'packages/utils/package.json'), 'utf8'))
const utilsRoot = join(rootDir, 'packages/utils')
const utilsRequire = createRequire(join(utilsRoot, 'package.json'))

function resolveWithNodeConditions(specifier: string, conditions: string[]): string {
  const script = `
import { fileURLToPath, pathToFileURL } from 'node:url';
const parent = pathToFileURL(${JSON.stringify(join(utilsRoot, 'index.mjs'))}).href;
const resolved = import.meta.resolve(${JSON.stringify(specifier)}, { parentURL: parent, conditions: ${JSON.stringify(conditions)} });
console.log(fileURLToPath(resolved));
`
  const result = spawnSync('node', ['--input-type=module', '-e', script], {
    cwd: utilsRoot,
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'node resolve failed')
  }
  return result.stdout.trim()
}

describe('Nitro export conditions (#233)', () => {
  it('require still resolves CJS for dual-package consumers', () => {
    expect(utilsRequire.resolve('@i18n-micro/utils/route')).toMatch(/route\.cjs$/)
  })

  it('import resolves ESM for runtime chunks', () => {
    const resolved = resolveWithNodeConditions('@i18n-micro/utils/route', ['import'])
    expect(resolved).toMatch(/route\.mjs$/)
  })

  it('production condition resolves ESM for Nitro file trace', () => {
    const resolved = resolveWithNodeConditions('@i18n-micro/utils/route', ['production'])
    expect(resolved).toMatch(/route\.mjs$/)
  })

  it('route export declares production → .mjs before import/require', () => {
    const entry = utilsPkg.exports['./route']
    expect(entry.production.default).toBe('./dist/route.mjs')
    const keys = Object.keys(entry)
    expect(keys.indexOf('production')).toBeLessThan(keys.indexOf('import'))
    expect(keys.indexOf('import')).toBeLessThan(keys.indexOf('require'))
    expect(entry.node).toBeUndefined()
  })
})
