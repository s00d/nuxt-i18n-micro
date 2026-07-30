import { describe, expect, it } from 'vitest'
import { fileImports, stripComments } from '../src/utils/imports'

describe('stripComments', () => {
  it('removes line and block comments', () => {
    expect(stripComments('a // b\nc')).toBe('a \nc')
    // A block comment leaves one space so `import/* x */'p'` keeps its token boundary.
    expect(stripComments('a /* b\nc */ d')).toBe('a   d')
  })

  it('keeps quoted strings, including ones that look like comments', () => {
    expect(stripComments(`const url = 'https://x.dev'`)).toBe(`const url = 'https://x.dev'`)
    expect(stripComments(`const s = "/* not a comment */"`)).toBe(`const s = "/* not a comment */"`)
    expect(stripComments(`const s = 'it\\'s fine' // gone`)).toBe(`const s = 'it\\'s fine' `)
  })

  it('empties template text but keeps its interpolations, which are real code', () => {
    expect(stripComments('const t = `a ${b} c`')).toBe('const t = ``b')
    expect(stripComments('const t = `a ${`x ${y}`} c`; const z = 1')).toBe('const t = ````y; const z = 1')
  })

  it('consumes a regex literal whole, including comment and quote characters', () => {
    // Treating `/*` inside a character class as a comment swallowed the rest of the file.
    // The body is replaced rather than kept: it is a pattern, not code.
    expect(stripComments("const re = /[/*]/ ; const s = 'kept'")).toBe("const re = /re/ ; const s = 'kept'")
    expect(stripComments("const re = /it's/ ; const s = 'kept'")).toBe("const re = /re/ ; const s = 'kept'")
  })

  it('reads division after a closing brace as division, not as a regex', () => {
    // Guessing regex there runs to the end of the line and takes every later import with
    // it; guessing division only leaves harmless text behind.
    expect(stripComments("const r = {a: 1}\nconst h = obj.n / 2 // gone")).toBe('const r = {a: 1}\nconst h = obj.n / 2 ')
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

  it('keeps a side-effect import whose specifier is separated by a comment', () => {
    // Removing the comment outright glued `import` to `'alpha'` and lost the match.
    expect(fileImports("import/* why */'alpha'").value).toEqual(['alpha'])
  })

  it('does not treat an interpolated string as code', () => {
    // The interpolation is rescanned as source, so a string inside it must stay a string.
    expect(fileImports("const s = `${'import \"ghost\"'}`").value).toEqual([])
  })

  it('survives a regex literal inside an interpolation', () => {
    // A brace or quote in a regex used to end the interpolation early and hide the rest.
    expect(fileImports("const s = `${x.replace(/[{}'\"]/g, '')}`; import 'alpha'").value).toEqual(['alpha'])
  })

  it('does not read a regex body as an import, anywhere', () => {
    // `deps-audit` reported `ghost` as an undeclared dependency of the file below.
    expect(fileImports("const r = /import 'ghost'/").value).toEqual([])
    expect(fileImports("const s = `${/import 'ghost'/.test(y)}`").value).toEqual([])
  })

  it('finds an import after a line that divides', () => {
    expect(fileImports("const r = {a: 1}\nconst h = obj.n / 2\nimport 'alpha'").value).toEqual(['alpha'])
  })

  it('survives a lone brace inside an interpolated string', () => {
    // A naive brace count closes the interpolation early and hides everything after it.
    expect(fileImports("const s = `${x['}']}`; import 'alpha'").value).toEqual(['alpha'])
  })

  it('ignores prose in a comment that reads like an import', () => {
    // The real false positive this guards: a sentence ending `… from "no request context"`.
    expect(fileImports('// disabled for this request) from "no request context"').value).toEqual([])
    expect(fileImports('/* import x from "ghost" */').value).toEqual([])
  })

  it('finds a runtime import written inside a template interpolation', () => {
    // The interpolation is code the module really runs, unlike the literal text around it.
    expect(fileImports("const html = `<b>${require('alpha').x}</b>`").value).toEqual(['alpha'])
  })

  it('ignores imports inside generated code held in a template literal', () => {
    // types-generator writes `import '@i18n-micro/types';` into the .d.ts it emits; that
    // is the generated file's dependency, not the generator's.
    const source = "const dts = `\nimport '@i18n-micro/types';\ndeclare module '@i18n-micro/types' {}\n`"
    expect(fileImports(source).value).toEqual([])
  })
})
