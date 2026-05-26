import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getLoadedModule, packageRootFromImportMeta, smokeLoadExports } from '../../../test-utils/src/publish-smoke'

const packageRoot = packageRootFromImportMeta(import.meta.url)
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))

describe('@i18n-micro/vue dist publish smoke', () => {
  it('loads root entry (esm + cjs)', async () => {
    const mods = await smokeLoadExports(packageRoot, pkg, [{ subpath: '.', formats: ['esm', 'cjs'] }])
    expect(getLoadedModule(mods, '.:import').createI18n).toBeTypeOf('function')
    expect(getLoadedModule(mods, '.:import').useI18n).toBeTypeOf('function')
    expect(getLoadedModule(mods, '.:require').createI18n).toBeTypeOf('function')
  })
})
