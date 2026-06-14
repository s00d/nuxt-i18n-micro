import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getLoadedModule, packageRootFromImportMeta, smokeLoadExports } from '../../../test-utils/src/publish-smoke'

const packageRoot = packageRootFromImportMeta(import.meta.url)
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))

const subpaths = [
  { subpath: './deep-merge', exportName: 'deepMergeTranslations' },
  { subpath: './merge-source', exportName: 'mergeSourceTranslations' },
  { subpath: './payload-config', exportName: 'resolveTranslationPayloadOptions' },
  { subpath: './route', exportName: 'findAllowedLocalesForRoute' },
  { subpath: './parse-path', exportName: 'parseTranslationRelativePath' },
  { subpath: './accept-language', exportName: 'detectLocaleFromAcceptLanguage' },
  { subpath: './runtime-config', exportName: 'resolveI18nConfigWithRuntimeOverrides' },
] as const

describe('@i18n-micro/utils export subpaths', () => {
  it.each(subpaths)('$subpath resolves via package exports (esm)', async ({ subpath, exportName }) => {
    const mods = await smokeLoadExports(packageRoot, pkg, [{ subpath, condition: 'import' }])
    const mod = getLoadedModule(mods, `${subpath}:import`)
    expect(mod[exportName]).toBeTypeOf('function')
  })
})
