import { describe, expect, it } from 'vitest'
import { dualPackageTypeFindings, isPublished } from '../src/commands/verify-packages'

type Manifest = Parameters<typeof isPublished>[0]

const codes = (pkg: unknown) => dualPackageTypeFindings(pkg as Manifest).map((f) => `${f.level}:${f.code}`)
const files = (list: unknown) => ({ files: list }) as Manifest

describe('isPublished', () => {
  it('treats a manifest without "files" as publishing everything', () => {
    expect(isPublished({} as Manifest, './dist/index.mjs')).toBe(true)
  })

  it('ships the whole subtree of a bare directory entry', () => {
    const pkg = files(['dist'])
    expect(isPublished(pkg, './dist/index.mjs')).toBe(true)
    expect(isPublished(pkg, './dist/chunks/a.mjs')).toBe(true)
    expect(isPublished(pkg, './src/index.ts')).toBe(false)
  })

  it('does not let a shared name prefix count as a directory match', () => {
    // `dist-types/` is not inside `dist/`.
    expect(isPublished(files(['dist']), './dist-types/index.d.ts')).toBe(false)
  })

  it('takes the prefix before the first glob', () => {
    expect(isPublished(files(['dist/**/*.mjs']), './dist/index.mjs')).toBe(true)
    expect(isPublished(files(['dist/*']), './dist/nested/deep.mjs')).toBe(true)
    expect(isPublished(files(['lib/**']), './dist/index.mjs')).toBe(false)
  })

  it('publishes npm’s always-included entries whatever "files" says', () => {
    const pkg = files(['dist'])
    for (const path of ['./package.json', './README.md', './LICENSE', './LICENCE', './CHANGELOG.md']) {
      expect(isPublished(pkg, path)).toBe(true)
    }
  })

  it('honours a later negation, and a re-inclusion after it', () => {
    expect(isPublished(files(['dist', '!dist/dev']), './dist/dev/debug.mjs')).toBe(false)
    expect(isPublished(files(['dist', '!dist/dev']), './dist/index.mjs')).toBe(true)
    expect(isPublished(files(['dist', '!dist/dev', 'dist/dev/keep.mjs']), './dist/dev/keep.mjs')).toBe(true)
  })

  it('normalises the leading ./ and trailing / of an entry', () => {
    expect(isPublished(files(['./dist/']), './dist/index.mjs')).toBe(true)
  })

  it('ignores non-string entries rather than throwing', () => {
    expect(isPublished(files(['dist', null, 42]), './dist/index.mjs')).toBe(true)
  })
})

describe('dualPackageTypeFindings', () => {
  const esm = (root: unknown) => ({ type: 'module', exports: { '.': root } })

  it('only looks at "type":"module" packages with a require condition', () => {
    expect(codes({ type: 'commonjs', exports: { '.': { import: './a.mjs', require: './a.cjs' } } })).toEqual([])
    expect(codes(esm({ import: './a.mjs' }))).toEqual([])
    expect(codes({ type: 'module' })).toEqual([])
  })

  it('errors when a dual export declares no types at all', () => {
    expect(codes(esm({ import: './a.mjs', require: './a.cjs' }))).toEqual(['errors:exports-no-types'])
  })

  it('warns when only the require condition is missing types', () => {
    expect(codes(esm({ import: { types: './a.d.ts', default: './a.mjs' }, require: './a.cjs' }))).toEqual(['warnings:require-no-types'])
  })

  it('does not claim CommonJS has no types when a root "types" condition covers both', () => {
    // The regression this guards: a root `types` applies to import *and* require, so
    // reporting "CommonJS consumers resolve no types" here was a false positive.
    expect(codes(esm({ types: './a.d.ts', import: './a.mjs', require: './a.cjs' }))).toEqual(['warnings:exports-types-top-level'])
  })

  it('flags a require types entry that is not .d.cts', () => {
    const found = codes(esm({ import: { types: './a.d.ts', default: './a.mjs' }, require: { types: './a.d.ts', default: './a.cjs' } }))
    expect(found).toContain('warnings:require-types-cts')
    expect(found).toContain('warnings:same-types-import-require')
  })

  it('accepts the correct shape without complaint', () => {
    expect(codes(esm({ import: { types: './a.d.ts', default: './a.mjs' }, require: { types: './a.d.cts', default: './a.cjs' } }))).toEqual([])
  })
})
