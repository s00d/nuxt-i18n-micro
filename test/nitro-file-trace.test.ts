/**
 * Issue #233 — Nitro traces externals with the production export condition (not import/require),
 * seeding the file trace from the production-resolved `dist/*.mjs`.
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { nodeFileTrace } from '@vercel/nft'
import { describe, expect, it } from 'vitest'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const utilsRoot = join(rootDir, 'packages/utils')
const utilsPkgJson = join(utilsRoot, 'package.json')
const utilsRequire = createRequire(utilsPkgJson)
const nitroTraceConditions = ['production', 'node', 'development']

/** Resolve as Node would under `conditions` (a child process: the conditions are process-wide). */
function resolveWithNodeConditions(specifier: string, conditions: string[]): string {
  const script = `
import { fileURLToPath, pathToFileURL } from 'node:url';
const parent = pathToFileURL(${JSON.stringify(utilsPkgJson)}).href;
const resolved = import.meta.resolve(${JSON.stringify(specifier)}, { parentURL: parent, conditions: ${JSON.stringify(conditions)} });
console.log(fileURLToPath(resolved));
`
  const result = spawnSync('node', ['--input-type=module', '-e', script], { cwd: utilsRoot, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'node resolve failed')
  return result.stdout.trim()
}

describe('Nitro export conditions and file trace (#233)', () => {
  it('cookie subpath: exports order, CJS for require, ESM for import/production, trace stays ESM', async () => {
    // step 1: the export map: production → .mjs before import before require, default last (publint)
    const entry = JSON.parse(readFileSync(utilsPkgJson, 'utf8')).exports['./cookie']
    expect(entry.production.default).toBe('./dist/cookie.mjs')
    expect(entry.node).toBeUndefined()
    const keys = Object.keys(entry)
    expect(keys.indexOf('production')).toBeLessThan(keys.indexOf('import'))
    expect(keys.indexOf('import')).toBeLessThan(keys.indexOf('require'))
    expect(keys.at(-1)).toBe('default')

    // step 2: require still gets CJS (dual-package consumers); import and Nitro's conditions get ESM
    expect(utilsRequire.resolve('@i18n-micro/utils/cookie')).toMatch(/cookie\.cjs$/)
    expect(resolveWithNodeConditions('@i18n-micro/utils/cookie', ['import'])).toMatch(/cookie\.mjs$/)
    const seed = resolveWithNodeConditions('@i18n-micro/utils/cookie', nitroTraceConditions)
    expect(seed).toMatch(/cookie\.mjs$/)

    // step 3: tracing from that seed pulls cookie.mjs and never cookie.cjs
    const { fileList } = await nodeFileTrace([seed], { base: rootDir, processCwd: rootDir, exportsOnly: true, conditions: nitroTraceConditions })
    const files = [...fileList]
    expect(files.some((f) => f.endsWith('cookie.mjs'))).toBe(true)
    expect(files.some((f) => f.endsWith('cookie.cjs'))).toBe(false)
  })
})
