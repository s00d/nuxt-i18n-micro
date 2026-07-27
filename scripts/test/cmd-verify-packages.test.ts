import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PackageManifest, WorkspacePackage } from '../src/utils/git-baseline'
import { runCli } from './helpers'

const listWorkspacePackages = vi.hoisted(() => vi.fn<() => WorkspacePackage[]>())
vi.mock('../src/utils/git-baseline', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/git-baseline')>()),
  listWorkspacePackages,
}))

/** Files that "exist on disk" for the package under test. */
const onDisk = vi.hoisted(() => new Set<string>())
vi.mock('node:fs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:fs')>()),
  existsSync: (path: string) => onDisk.has(String(path)),
  statSync: () => ({ isDirectory: () => true }),
}))

const { verifyPackagesCommand } = await import('../src/commands/verify-packages')

const DIR = '/repo/packages/core'

function workspace(pkg: PackageManifest, files: string[] = []) {
  onDisk.clear()
  for (const file of files) onDisk.add(`${DIR}/${file}`)
  listWorkspacePackages.mockReturnValue([{ name: String(pkg.name), dir: DIR, relDir: 'packages/core', localVersion: '1.0.0', pkg } as WorkspacePackage])
}

interface Report {
  errors: { pkg: string; code: string }[]
  warnings: { pkg: string; code: string }[]
}

async function report(pkg: PackageManifest, files?: string[]) {
  workspace(pkg, files)
  const cli = await runCli(verifyPackagesCommand, { json: true, publint: false })
  const parsed = cli.json<Report>()
  return {
    exitCode: cli.exitCode,
    errors: parsed.errors.map((e) => e.code),
    warnings: parsed.warnings.map((w) => w.code),
  }
}

/** A package with nothing for the checks to complain about. */
const clean = (extra: Partial<PackageManifest> = {}): PackageManifest => ({
  name: '@i18n-micro/core',
  version: '1.0.0',
  type: 'module',
  license: 'MIT',
  sideEffects: false,
  engines: { node: '>=18' },
  files: ['dist'],
  exports: { '.': { import: { types: './dist/index.d.ts', default: './dist/index.mjs' } } },
  ...extra,
})

beforeEach(() => listWorkspacePackages.mockReset())

describe('verify-packages', () => {
  it('passes a well-formed package and exits 0', async () => {
    const result = await report(clean(), ['dist', 'dist/index.mjs', 'dist/index.d.ts'])
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
    expect(result.exitCode).toBeNull()
  })

  it('errors on an export pointing at a file that was never built', async () => {
    const result = await report(clean(), ['dist'])
    expect(result.errors).toContain('missing-file')
    expect(result.exitCode).toBe(1)
  })

  it('errors on an export that exists but is excluded by "files"', async () => {
    // Resolves locally, 404s for everyone who installs it.
    const result = await report(clean({ files: ['README.md'] }), ['dist', 'dist/index.mjs', 'dist/index.d.ts'])
    expect(result.errors).toContain('unpublished-file')
    expect(result.exitCode).toBe(1)
  })

  it('warns when dist is referenced but missing entirely', async () => {
    const result = await report(clean(), [])
    expect(result.warnings).toContain('no-dist')
  })

  it('errors on a dual export with no types', async () => {
    const pkg = clean({ exports: { '.': { import: './dist/index.mjs', require: './dist/index.cjs' } } })
    const result = await report(pkg, ['dist', 'dist/index.mjs', 'dist/index.cjs'])
    expect(result.errors).toContain('exports-no-types')
  })

  it('warns about the publishing metadata a library should carry', async () => {
    const pkg: PackageManifest = { name: '@i18n-micro/core', version: '1.0.0', type: 'module', exports: { '.': './dist/index.mjs' }, module: './dist/index.mjs' }
    const result = await report(pkg, ['dist', 'dist/index.mjs'])
    expect(result.warnings).toEqual(expect.arrayContaining(['missing-license', 'missing-sideEffects', 'missing-engines', 'redundant-module']))
  })

  it('warns when LICENSE or README exist but "files" omits them', async () => {
    const result = await report(clean(), ['dist', 'dist/index.mjs', 'dist/index.d.ts', 'LICENSE', 'README.md'])
    expect(result.warnings).toEqual(expect.arrayContaining(['files-license', 'files-readme']))
  })

  it('does not treat a glob in "files" as a literal path to check', async () => {
    const result = await report(clean({ files: ['dist/**/*'] }), ['dist', 'dist/index.mjs', 'dist/index.d.ts'])
    expect(result.errors).toEqual([])
  })
})
