/**
 * Issue #233 — Nitro seeds file-trace from production-resolved subpath files (dist/*.mjs).
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { nodeFileTrace } from '@vercel/nft'
import { describe, expect, it } from 'vitest'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const utilsPkgJson = join(rootDir, 'packages/utils/package.json')
const utilsRoot = join(rootDir, 'packages/utils')
const utilsRequire = createRequire(utilsPkgJson)

const nitroTraceConditions = ['production', 'node', 'development']

function resolveWithNodeConditions(specifier: string, conditions: string[]): string {
  const script = `
import { fileURLToPath, pathToFileURL } from 'node:url';
const parent = pathToFileURL(${JSON.stringify(utilsPkgJson)}).href;
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

describe('Nitro file trace (#233)', () => {
  it('require still resolves CJS for dual-package consumers', () => {
    expect(utilsRequire.resolve('@i18n-micro/utils/route')).toMatch(/route\.cjs$/)
  })

  it('production resolve picks route.mjs as Nitro trace seed (not createRequire → .cjs)', () => {
    const productionPath = resolveWithNodeConditions('@i18n-micro/utils/route', ['production', 'import', 'node'])
    const requirePath = utilsRequire.resolve('@i18n-micro/utils/route')
    expect(productionPath).toMatch(/route\.mjs$/)
    expect(requirePath).toMatch(/route\.cjs$/)
    expect(productionPath).not.toBe(requirePath)
  })

  it('file-trace from production-resolved route.mjs does not pull route.cjs', async () => {
    const seed = resolveWithNodeConditions('@i18n-micro/utils/route', nitroTraceConditions)
    const result = await nodeFileTrace([seed], {
      base: rootDir,
      processCwd: rootDir,
      exportsOnly: true,
      conditions: nitroTraceConditions,
    })

    const files = [...result.fileList]
    expect(files.some((f) => f.endsWith('route.mjs'))).toBe(true)
    expect(files.some((f) => f.endsWith('route.cjs'))).toBe(false)
  })
})
