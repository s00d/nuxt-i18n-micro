import { describe, expect, it, vi } from 'vitest'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import type { WorkspacePackage } from '../src/utils/git-baseline'
import { parseManifest } from '../src/utils/manifest'
import { repoRoot } from '../src/utils/workspace'
import { runCli } from './helpers'

const listWorkspacePackages = vi.hoisted(() => vi.fn<(filter?: string | null) => WorkspacePackage[]>())
const changedPackageNames = vi.hoisted(() => vi.fn<() => Set<string>>())

vi.mock('../src/utils/git-baseline', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/git-baseline')>()),
  listWorkspacePackages,
  changedPackageNames,
  resolveBase: () => 'v3.21.4',
  assertBaseResolvable: () => {},
}))

const { comparePublishedCommand, fetchNpmLatestBulk, listLocalPackPaths } = await import('../src/commands/compare-published')
type ComparePublishedReport = import('../src/commands/compare-published').ComparePublishedReport

const pkg = (name: string): WorkspacePackage =>
  ({ name, dir: `/repo/packages/${name}`, relDir: `packages/${name}`, localVersion: '1.0.0', pkg: { name, version: '1.0.0' } })

/**
 * `--changed-only` with nothing changed skips every package before it packs anything,
 * which is what makes these assertions cheap: no npm, no tarballs, no filesystem.
 */
const run = (args: Partial<{ package: string }> = {}) => runCli(comparePublishedCommand, { json: true, changedOnly: true, ...args })

describe('fetchNpmLatestBulk', () => {
  it('returns latest metadata keyed by package name', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)
      const name = url.includes('%2Fcore') ? '@i18n-micro/core' : '@i18n-micro/missing'
      if (name === '@i18n-micro/missing') return new Response('', { status: 404 })
      return Response.json({
        version: '1.2.3',
        dist: { tarball: `https://registry.npmjs.org/${name}/-/pkg-1.2.3.tgz` },
      })
    })

    const lookup = await fetchNpmLatestBulk(['@i18n-micro/core', '@i18n-micro/missing'])
    expect(lookup.get('@i18n-micro/core')).toEqual({
      version: '1.2.3',
      tarball: 'https://registry.npmjs.org/@i18n-micro/core/-/pkg-1.2.3.tgz',
    })
    expect(lookup.get('@i18n-micro/missing')).toBeNull()

    fetchMock.mockRestore()
  })
})

describe('listLocalPackPaths', () => {
  it('lists publishable files for @i18n-micro/core without npm pack', () => {
    const dir = join(repoRoot, 'packages/core')
    const manifest = parseManifest(readFileSync(join(dir, 'package.json'), 'utf8'))
    const paths = listLocalPackPaths(dir, manifest)
    expect(paths).toContain('package.json')
    expect(paths).toContain('README.md')
    expect(paths).toContain('LICENSE')
    expect(paths.some((p) => p.startsWith('dist/'))).toBe(true)
    expect(paths.some((p) => p.includes('node_modules'))).toBe(false)
  })
})

describe('compare-published', () => {
  it('passes --package through to the package listing', async () => {
    // The bug this guards: the filter was computed and then never used, so `--package`
    // silently packed the entire workspace.
    listWorkspacePackages.mockReturnValue([])
    changedPackageNames.mockReturnValue(new Set())

    await run({ package: 'path-strategy' })
    expect(listWorkspacePackages).toHaveBeenCalledWith('path-strategy')
  })

  it('passes null when no package was named', async () => {
    listWorkspacePackages.mockReturnValue([])
    changedPackageNames.mockReturnValue(new Set())

    await run({})
    expect(listWorkspacePackages).toHaveBeenCalledWith(null)
  })

  it('inspects only the packages that changed since the baseline', async () => {
    listWorkspacePackages.mockReturnValue([pkg('core'), pkg('vue')])
    changedPackageNames.mockReturnValue(new Set())

    const cli = await run({})
    expect(cli.json<ComparePublishedReport>().results).toEqual([])
    expect(cli.exitCode).toBeNull()
  })
})
