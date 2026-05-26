import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getLoadedModule, packageRootFromImportMeta, smokeLoadExports } from '../../../test-utils/src/publish-smoke'

const packageRoot = packageRootFromImportMeta(import.meta.url)
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))

describe('@i18n-micro/devtools-ui dist publish smoke', () => {
  it('loads published subpaths', async () => {
    const mods = await smokeLoadExports(packageRoot, pkg, [
      { subpath: '.', condition: 'import' },
      { subpath: '.', condition: 'require' },
      { subpath: './bridge', condition: 'import' },
      { subpath: './bridge/create', condition: 'import' },
      { subpath: './vite', condition: 'import' },
    ])
    expect(getLoadedModule(mods, '.:import')).toBeDefined()
    expect(getLoadedModule(mods, '.:require')).toBeDefined()
    expect(getLoadedModule(mods, './bridge:import').BRIDGE_INTERFACE_MODULE).toBe(true)
    expect(getLoadedModule(mods, './bridge/create:import').createBridge).toBeTypeOf('function')
    expect(getLoadedModule(mods, './vite:import').i18nDevToolsPlugin).toBeTypeOf('function')
  })
})
