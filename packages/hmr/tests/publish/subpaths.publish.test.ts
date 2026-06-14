import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getLoadedModule, packageRootFromImportMeta, smokeLoadExports } from '@i18n-micro/test-utils/publish-smoke'

const packageRoot = packageRootFromImportMeta(import.meta.url)
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))

const subpaths = [
  { subpath: './watcher', exportName: 'handleTranslationWatchChange' },
  { subpath: './generate-plugin', exportName: 'generateHmrPlugin' },
  { subpath: './cache-keys', exportName: 'SERVER_CC_KEY' },
] as const

describe('@i18n-micro/hmr export subpaths', () => {
  it.each(subpaths)('$subpath resolves via package exports (esm)', async ({ subpath, exportName }) => {
    const mods = await smokeLoadExports(packageRoot, pkg, [{ subpath, condition: 'import' }])
    const mod = getLoadedModule(mods, `${subpath}:import`)
    if (exportName === 'SERVER_CC_KEY') {
      expect(typeof mod[exportName]).toBe('symbol')
    } else {
      expect(mod[exportName]).toBeTypeOf('function')
    }
  })
})
