import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getLoadedModule, packageRootFromImportMeta, smokeLoadExports } from '../../../test-utils/src/publish-smoke'

const packageRoot = packageRootFromImportMeta(import.meta.url)
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))

describe('@i18n-micro/core dist publish smoke', () => {
  it('loads root entry (esm + cjs)', async () => {
    const mods = await smokeLoadExports(packageRoot, pkg, [{ subpath: '.', formats: ['esm', 'cjs'] }])
    expect(getLoadedModule(mods, '.:import').FormatService).toBeTypeOf('function')
    expect(getLoadedModule(mods, '.:require').FormatService).toBeTypeOf('function')
    expect(getLoadedModule(mods, '.:import').interpolate).toBeTypeOf('function')
  })

  it('every entry shares one defaultPlural: resolveText tells the built-in rule by identity', async () => {
    const mods = await smokeLoadExports(packageRoot, pkg, [
      { subpath: '.', condition: 'import' },
      { subpath: './helpers', condition: 'import' },
      { subpath: './render', condition: 'import' },
    ])
    const { defaultPlural } = getLoadedModule(mods, '.:import')
    const helpers = getLoadedModule(mods, './helpers:import')
    expect(helpers.defaultPlural).toBe(defaultPlural)
    const host = { pluralFunc: helpers.defaultPlural, getLocale: () => 'en', t: () => 'a | {count} {x}' }
    const render = getLoadedModule(mods, './render:import')
    const h = (_tag: string, _attrs: unknown, children: unknown) => children
    expect(render.renderI18nT({ h, Fragment: 'f' }, host, { keypath: 'k', plural: 3, params: { x: '{y}' } }, {}, {})).toBe('3 {y}')
  })
})
