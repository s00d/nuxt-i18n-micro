// dist is compiled for the DOM and needs a browser build of Solid: read here, loaded by tests/hydration.test.ts through the `solid` condition.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { packageRootFromImportMeta } from '../../../test-utils/src/publish-smoke'

const packageRoot = packageRootFromImportMeta(import.meta.url)
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
const dist = (file: string) => readFileSync(join(packageRoot, 'dist', file), 'utf8')

describe('@i18n-micro/solid dist publish smoke', () => {
  it('declares both entries, with the source for the solid condition', () => {
    for (const entry of ['.', './router']) {
      const target = pkg.exports[entry]
      for (const path of [target.solid, target.import.default, target.import.types, target.require.default, target.require.types]) {
        expect(existsSync(join(packageRoot, path))).toBe(true)
      }
    }
  })

  it('keeps the router out of the main entry and core and the runtime out of the bundle', () => {
    expect(dist('index.mjs')).not.toMatch(/@solidjs\/router/)
    expect(dist('router.mjs')).toMatch(/@solidjs\/router/)
    expect(dist('index.mjs')).toMatch(/@i18n-micro\/runtime/)
    expect(dist('index.mjs')).toMatch(/@i18n-micro\/core/)
  })
})
