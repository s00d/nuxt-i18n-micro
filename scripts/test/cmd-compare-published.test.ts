import { describe, expect, it, vi } from 'vitest'
import type { WorkspacePackage } from '../src/utils/git-baseline'
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

const { comparePublishedCommand } = await import('../src/commands/compare-published')
type ComparePublishedReport = import('../src/commands/compare-published').ComparePublishedReport

const pkg = (name: string): WorkspacePackage =>
  ({ name, dir: `/repo/packages/${name}`, relDir: `packages/${name}`, localVersion: '1.0.0', pkg: { name, version: '1.0.0' } })

/**
 * `--changed-only` with nothing changed skips every package before it packs anything,
 * which is what makes these assertions cheap: no npm, no tarballs, no filesystem.
 */
const run = (args: Partial<{ package: string }> = {}) => runCli(comparePublishedCommand, { json: true, changedOnly: true, ...args })

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
