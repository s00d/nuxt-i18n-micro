import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getLoadedModule, packageRootFromImportMeta, smokeLoadExports } from '../../../test-utils/src/publish-smoke'

const packageRoot = packageRootFromImportMeta(import.meta.url)
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))

describe('@i18n-micro/vue dist publish smoke', () => {
  it('loads root entry (esm + cjs) without requiring vue-router', async () => {
    const indexMjs = readFileSync(join(packageRoot, 'dist/index.mjs'), 'utf8')
    expect(indexMjs).not.toMatch(/from ["']vue-router["']/)
    expect(indexMjs).not.toMatch(/createVueRouterAdapter/)

    const mods = await smokeLoadExports(packageRoot, pkg, [{ subpath: '.', formats: ['esm', 'cjs'] }])
    expect(getLoadedModule(mods, '.:import').createI18n).toBeTypeOf('function')
    expect(getLoadedModule(mods, '.:import').useI18n).toBeTypeOf('function')
    expect(getLoadedModule(mods, '.:import').createVueRouterAdapter).toBeUndefined()
    expect(getLoadedModule(mods, '.:require').createI18n).toBeTypeOf('function')
  })

  it('loads ./router entry with createVueRouterAdapter', async () => {
    const mods = await smokeLoadExports(packageRoot, pkg, [{ subpath: './router', formats: ['esm', 'cjs'] }])
    expect(getLoadedModule(mods, './router:import').createVueRouterAdapter).toBeTypeOf('function')
    expect(getLoadedModule(mods, './router:require').createVueRouterAdapter).toBeTypeOf('function')
  })
})
