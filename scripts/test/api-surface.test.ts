import { describe, expect, it } from 'vitest'
import { type EntryPointSurface, entryPoints, indexSnapshot, indexSurface, renderSurface, sourceForTarget } from '../src/utils/api-surface'
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
