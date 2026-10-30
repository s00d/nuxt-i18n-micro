import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getLoadedModule, packageRootFromImportMeta, smokeLoadExports } from '../../../test-utils/src/publish-smoke'

const packageRoot = packageRootFromImportMeta(import.meta.url)
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
const dist = (file: string) => readFileSync(join(packageRoot, 'dist', file), 'utf8')

describe('@i18n-micro/preact dist publish smoke', () => {
  it('loads root and router entries (esm + cjs)', async () => {
    const mods = await smokeLoadExports(packageRoot, pkg, [
      { subpath: '.', formats: ['esm', 'cjs'] },
      { subpath: './router', formats: ['esm', 'cjs'] },
    ])
    expect(getLoadedModule(mods, '.:import').useI18n).toBeTypeOf('function')
    expect(getLoadedModule(mods, '.:require').PreactI18n).toBeTypeOf('function')
    expect(getLoadedModule(mods, './router:import').createBrowserHistoryAdapter).toBeTypeOf('function')
  })

  it('stands on Preact alone: no react, no compat', () => {
    for (const file of ['index.mjs', 'index.cjs', 'router.mjs']) {
      expect(dist(file)).not.toMatch(/["'](react|react-dom|preact\/compat)["']/)
    }
    expect(dist('index.d.ts')).not.toMatch(/from ['"](react|#host)['"]/)
  })

  it('publishes the bundled declarations only', () => {
    expect(existsSync(join(packageRoot, 'dist/preact'))).toBe(false)
    expect(existsSync(join(packageRoot, 'dist/react'))).toBe(false)
    expect(dist('router.d.ts')).toContain('createBrowserHistoryAdapter')
  })
})
