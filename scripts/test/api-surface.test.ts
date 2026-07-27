import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { type EntryPointSurface, entryPoints, indexSnapshot, indexSurface, readSurface, renderSurface, sourceForTarget } from '../src/utils/api-surface'
import type { PackageManifest } from '../src/utils/manifest'
import { repoRoot } from '../src/utils/workspace'
import { join } from 'node:path'

const CORE = join(repoRoot, 'packages/core')

describe('sourceForTarget', () => {
  it('maps a published target back to its source', () => {
    expect(sourceForTarget(CORE, './dist/index.mjs')).toBe('src/index.ts')
    expect(sourceForTarget(CORE, './dist/index.d.ts')).toBe('src/index.ts')
    expect(sourceForTarget(CORE, './dist/index.cjs')).toBe('src/index.ts')
  })

  it('returns null for targets with no source behind them', () => {
    // `./package.json` is a real export and must not be mistaken for an entry point.
    expect(sourceForTarget(CORE, './package.json')).toBeNull()
    expect(sourceForTarget(CORE, './dist/does-not-exist.mjs')).toBeNull()
  })
})

describe('entryPoints', () => {
  it('follows every subpath of a conditional exports map', () => {
    const pkg: PackageManifest = {
      exports: {
        '.': { import: { types: './dist/index.d.ts', default: './dist/index.mjs' } },
        './helpers': { import: './dist/helpers.mjs' },
        './package.json': './package.json',
      },
    }
    expect([...entryPoints(CORE, pkg)]).toEqual([
      ['.', 'src/index.ts'],
      ['./helpers', 'src/helpers.ts'],
    ])
  })

  it('falls back to src/index.ts when a manifest declares no usable entry', () => {
    expect([...entryPoints(CORE, {})]).toEqual([['.', 'src/index.ts']])
  })
})

describe('snapshot round-trip', () => {
  const surface: EntryPointSurface[] = [
    {
      subpath: '.',
      file: 'src/index.ts',
      entries: [
        { path: 'run', kind: 'function', signature: '(a: string) => void' },
        { path: 'Options', kind: 'interface', signature: '' },
        { path: 'Options.a?', kind: 'member', signature: 'string | undefined' },
      ],
    },
  ]

  it('renders one line per export and member', () => {
    expect(renderSurface(surface).split('\n')).toEqual([
      '# . (src/index.ts)',
      'function run: (a: string) => void',
      'interface Options',
      'member Options.a?: string | undefined',
      '',
    ])
  })

  it('parses back to exactly what it rendered', () => {
    // If these drift, every run reports phantom changes.
    expect(indexSnapshot(renderSurface(surface))).toEqual(indexSurface(surface))
  })

  it('keeps entry points apart', () => {
    const two: EntryPointSurface[] = [
      { subpath: '.', file: 'src/index.ts', entries: [{ path: 'run', kind: 'function', signature: '() => void' }] },
      { subpath: './sub', file: 'src/sub.ts', entries: [{ path: 'run', kind: 'function', signature: '() => number' }] },
    ]
    const index = indexSnapshot(renderSurface(two))
    expect(index.get('. run')).toBe('function () => void')
    expect(index.get('./sub run')).toBe('function () => number')
  })
})


/** A throwaway package, so these assertions do not chase the real sources. */
function surfaceOf(source: string, file = 'index.ts') {
  const dir = mkdtempSync(join(tmpdir(), 'surface-'))
  try {
    mkdirSync(join(dir, 'src'), { recursive: true })
    writeFileSync(join(dir, 'src', file), source)
    const [entry] = readSurface(dir, { exports: `./dist/${file.replace(/\.tsx?$/, '')}.mjs` })
    return new Map((entry?.entries ?? []).map((item) => [item.path, `${item.kind} ${item.signature}`]))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('readSurface', () => {
  it('records type parameters in the signature, not the path', () => {
    // A path containing spaces cannot be parsed back out of the snapshot, and members
    // keyed on the plain name would no longer match their owner.
    const surface = surfaceOf('export type ScopedKey<Scope extends string> = `${Scope}.x`\n')
    expect(surface.get('ScopedKey')).toBe('type <Scope extends string> = `${Scope}.x`')
  })

  it('keeps a generic class and its members under one name', () => {
    const surface = surfaceOf('export class Box<T> { value?: T\n  get(): T | undefined { return this.value } }\n')
    expect(surface.get('Box')).toBe('class <T>')
    expect(surface.has('Box.get')).toBe(true)
  })

  it('records a constructor that carries a contract', () => {
    const surface = surfaceOf('export class Service { constructor(public options: string) {} }\n')
    expect(surface.get('Service.new')).toContain('options: string')
  })

  it('omits an implicit no-argument constructor and an abstract one', () => {
    // Neither is something a reader has to know, and both were pure noise.
    expect(surfaceOf('export class Plain { a = 1 }\n').has('Plain.new')).toBe(false)
    expect(surfaceOf('export abstract class Base { constructor(readonly x: string) {} }\n').has('Base.new')).toBe(false)
  })

  it('keeps each constructor overload distinct', () => {
    const surface = surfaceOf('export declare class Multi { constructor(a: string)\n  constructor(a: number) }\n')
    expect(surface.has('Multi.new')).toBe(true)
    expect(surface.has('Multi.new#2')).toBe(true)
  })

  it('records an index signature and its value type', () => {
    const surface = surfaceOf('export interface Bag { [key: string]: number }\n')
    expect(surface.get('Bag.[string]')).toBe('member number')
  })

  it('marks a member that is not public', () => {
    const surface = surfaceOf('export class Guarded { public a = 1\n  protected b = 2 }\n')
    expect(surface.get('Guarded.b')).toContain('protected')
  })

  it('reads a .tsx export instead of reporting it as unknown', () => {
    // Without the `jsx` compiler option every component contract resolved to `unknown`.
    const surface = surfaceOf('export const Widget = (props: { id: string }) => null\n', 'index.tsx')
    expect(surface.get('Widget')).toContain('id: string')
  })

  it('round-trips everything it produces', () => {
    const dir = mkdtempSync(join(tmpdir(), 'surface-'))
    try {
      mkdirSync(join(dir, 'src'), { recursive: true })
      writeFileSync(join(dir, 'src', 'index.ts'), 'export class Box<T> { constructor(readonly v: T) {} }\nexport interface Bag { [k: string]: number }\n')
      const surface = readSurface(dir, { exports: './dist/index.mjs' })
      expect(indexSnapshot(renderSurface(surface))).toEqual(indexSurface(surface))
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
