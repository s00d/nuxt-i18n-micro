import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getLoadedModule, packageRootFromImportMeta, smokeLoadExports } from '../../../test-utils/src/publish-smoke'
import { baseContext } from './test-context'

const packageRoot = packageRootFromImportMeta(import.meta.url)
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))

const subpaths = [
  { subpath: './prefix', exportName: 'PrefixPathStrategy', strategy: 'prefix' as const },
  { subpath: './no-prefix', exportName: 'NoPrefixPathStrategy', strategy: 'no_prefix' as const },
  {
    subpath: './prefix-except-default',
    exportName: 'PrefixExceptDefaultPathStrategy',
    strategy: 'prefix_except_default' as const,
  },
  { subpath: './prefix-and-default', exportName: 'PrefixAndDefaultPathStrategy', strategy: 'prefix_and_default' as const },
] as const

describe('@i18n-micro/path-strategy export subpaths', () => {
  it.each(subpaths)('$subpath resolves via package exports (esm)', async ({ subpath, exportName, strategy }) => {
    const mods = await smokeLoadExports(packageRoot, pkg, [{ subpath, condition: 'import' }])
    const mod = getLoadedModule(mods, `${subpath}:import`)
    const Strategy = mod[exportName] as new (ctx: ReturnType<typeof baseContext>) => {
      shouldReturn404(path: string): string | null
    }
    expect(Strategy).toBeTypeOf('function')
    const instance = new Strategy(baseContext({ strategy }))
    expect(instance.shouldReturn404('/')).toBeDefined()
  })
})
