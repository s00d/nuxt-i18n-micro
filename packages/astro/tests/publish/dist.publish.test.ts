import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getLoadedModule, packageRootFromImportMeta, smokeLoadExports } from '../../../test-utils/src/publish-smoke'

const packageRoot = packageRootFromImportMeta(import.meta.url)
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))

describe('@i18n-micro/astro dist publish smoke', () => {
  it('loads server and client entrypoints', async () => {
    const mods = await smokeLoadExports(packageRoot, pkg, [
      { subpath: '.', formats: ['esm', 'cjs'] },
      { subpath: './client/vue', condition: 'import' },
      { subpath: './client/react', condition: 'import' },
    ])
    expect(getLoadedModule(mods, '.:import')).toBeDefined()
    expect(getLoadedModule(mods, '.:require')).toBeDefined()
    expect(getLoadedModule(mods, './client/vue:import')).toBeDefined()
    expect(getLoadedModule(mods, './client/react:import')).toBeDefined()
  })

  it('leaves vue to the app: a second copy of it cannot track the app\'s effects', () => {
    const source = readFileSync(join(packageRoot, 'dist/client/vue.js'), 'utf8')
    expect(source).toMatch(/from ['"]vue['"]/)
    expect(source).not.toContain('__v_isRef')
  })
})
