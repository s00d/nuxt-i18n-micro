import { describe, expect, it } from 'vitest'
import { fileImports, stripComments } from '../src/utils/imports'

describe('stripComments', () => {
  it('removes line and block comments', () => {
    expect(stripComments('a // b\nc')).toBe('a \nc')
    expect(stripComments('a /* b\nc */ d')).toBe('a  d')
  })

  it('keeps quoted strings, including ones that look like comments', () => {
    expect(stripComments(`const url = 'https://x.dev'`)).toBe(`const url = 'https://x.dev'`)
    expect(stripComments(`const s = "/* not a comment */"`)).toBe(`const s = "/* not a comment */"`)
    expect(stripComments(`const s = 'it\\'s fine' // gone`)).toBe(`const s = 'it\\'s fine' `)
  })

  it('empties template literals, including nested interpolations', () => {
    expect(stripComments('const t = `a ${b} c`')).toBe('const t = ``')
    expect(stripComments('const t = `a ${`x ${y}`} c`; const z = 1')).toBe('const t = ``; const z = 1')
  })
})

describe('fileImports', () => {
  it('finds value imports in every form', () => {
    const source = [
      `import a from 'alpha'`,
      `import { b } from 'beta'`,
      `import * as g from 'gamma'`,
      `import 'delta'`,
      `export { e } from 'epsilon'`,
      `export * from 'zeta'`,
      `const h = await import('eta')`,
      `const t = require('theta')`,
    ].join('\n')

    expect(fileImports(source).value.sort()).toEqual(['alpha', 'beta', 'delta', 'epsilon', 'eta', 'gamma', 'theta', 'zeta'])
  })

  it('separates type-only imports, which are erased from the output', () => {
    const found = fileImports(`import type { A } from 'alpha'\nexport type { B } from 'beta'\nimport c from 'gamma'`)
    expect(found.typeOnly.sort()).toEqual(['alpha', 'beta'])
    expect(found.value).toEqual(['gamma'])
  })

  it('counts a package imported both ways as a value import', () => {
    const found = fileImports(`import type { A } from 'alpha'\nimport { run } from 'alpha'`)
    expect(found.value).toEqual(['alpha'])
    expect(found.typeOnly).toEqual([])
  })

  it('ignores prose in a comment that reads like an import', () => {
    // The real false positive this guards: a sentence ending `… from "no request context"`.
    expect(fileImports('// disabled for this request) from "no request context"').value).toEqual([])
    expect(fileImports('/* import x from "ghost" */').value).toEqual([])
  })

  it('ignores imports inside generated code held in a template literal', () => {
    // types-generator writes `import '@i18n-micro/types';` into the .d.ts it emits; that
    // is the generated file's dependency, not the generator's.
    const source = "const dts = `\nimport '@i18n-micro/types';\ndeclare module '@i18n-micro/types' {}\n`"
    expect(fileImports(source).value).toEqual([])
  })
})
