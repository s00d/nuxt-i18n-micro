import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CommandResult, WorkspacePackage } from '../src/utils/git-baseline'
import type { CheckVersionsReport, VersionEntry } from '../src/commands/check-versions'
import { runCli } from './helpers'

const listWorkspacePackages = vi.hoisted(() => vi.fn<() => WorkspacePackage[]>())
const changedFiles = vi.hoisted(() => vi.fn<(ref: string, relDir: string) => string[]>())
const tryRun = vi.hoisted(() => vi.fn<(cmd: string, args: string[]) => string | null>())
const runCapture = vi.hoisted(() => vi.fn<(cmd: string, args: string[]) => CommandResult>())

vi.mock('../src/utils/git-baseline', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/git-baseline')>()),
  listWorkspacePackages,
  changedFiles,
  tryRun,
  runCapture,
  resolveBase: () => 'v3.21.4',
  assertBaseResolvable: () => {},
}))

const { checkVersionsCommand } = await import('../src/commands/check-versions')

const pkg = (name: string, version: string): WorkspacePackage =>
  ({ name, dir: `/repo/packages/${name}`, relDir: `packages/${name}`, localVersion: version, pkg: { name, version } })

/** `git show <ref>:<dir>/package.json` for the baseline versions a test declares. */
function baselineVersions(versions: Record<string, string | null>) {
  tryRun.mockImplementation((_cmd, args) => {
    const match = /^v[\d.]+:packages\/(.+)\/package\.json$/.exec(args[1] ?? '')
    if (!match) return null
    const version = versions[match[1]!]
    return version === undefined || version === null ? null : JSON.stringify({ version })
  })
}

const npmHas = (versions: Record<string, string[]>) =>
  runCapture.mockImplementation((_cmd, args) => {
    const name = args[1]!
    const list = versions[name]
    if (!list) return { ok: false, stdout: JSON.stringify({ error: { code: 'E404' } }), stderr: '' }
    return { ok: true, stdout: JSON.stringify(list), stderr: '' }
  })

const run = async (args: Partial<{ npm: boolean }> = {}) => {
  const cli = await runCli(checkVersionsCommand, { json: true, npm: false, ...args })
  return { ...cli, report: cli.json<CheckVersionsReport>() }
}

const entry = (results: VersionEntry[], name: string) => results.find((r) => r.name === name)!

beforeEach(() => {
  listWorkspacePackages.mockReset()
  changedFiles.mockReset()
  tryRun.mockReset()
  runCapture.mockReset()
})

describe('check-versions', () => {
  it('passes when nothing changed', async () => {
    listWorkspacePackages.mockReturnValue([pkg('core', '1.0.0')])
    changedFiles.mockReturnValue([])

    const { report, exitCode } = await run()
    expect(entry(report.results, 'core').status).toBe('unchanged')
    expect(report.errorCount).toBe(0)
    expect(exitCode).toBeNull()
  })

  it('fails when a package changed without a bump', async () => {
    listWorkspacePackages.mockReturnValue([pkg('core', '1.0.0')])
    changedFiles.mockReturnValue(['packages/core/src/index.ts'])
    baselineVersions({ core: '1.0.0' })

    const { report, exitCode } = await run()
    expect(entry(report.results, 'core').status).toBe('NEEDS BUMP')
    expect(exitCode).toBe(1)
  })

  it('ignores changes that cannot reach the registry', async () => {
    listWorkspacePackages.mockReturnValue([pkg('core', '1.0.0')])
    changedFiles.mockReturnValue(['packages/core/README.md', 'packages/core/test/a.test.ts'])
    baselineVersions({ core: '1.0.0' })

    const { report, exitCode } = await run()
    expect(entry(report.results, 'core').status).toBe('unchanged')
    expect(exitCode).toBeNull()
  })

  it('accepts a bump and rejects one that goes backwards', async () => {
    listWorkspacePackages.mockReturnValue([pkg('core', '1.1.0'), pkg('vue', '0.9.0')])
    changedFiles.mockReturnValue(['packages/x/src/index.ts'])
    baselineVersions({ core: '1.0.0', vue: '1.0.0' })

    const { report, exitCode } = await run()
    expect(entry(report.results, 'core').status).toBe('bumped 1.0.0 → 1.1.0')
    expect(entry(report.results, 'vue').status).toBe('VERSION WENT BACKWARDS')
    expect(exitCode).toBe(1)
  })

  it('treats a package with no baseline manifest as new', async () => {
    listWorkspacePackages.mockReturnValue([pkg('brand-new', '0.1.0')])
    changedFiles.mockReturnValue(['packages/brand-new/src/index.ts'])
    baselineVersions({})

    const { report, exitCode } = await run()
    expect(entry(report.results, 'brand-new').status).toBe('new package')
    expect(exitCode).toBeNull()
  })

  describe('--npm', () => {
    it('rejects a bump onto a version npm already has', async () => {
      listWorkspacePackages.mockReturnValue([pkg('core', '1.1.0')])
      changedFiles.mockReturnValue(['packages/core/src/index.ts'])
      baselineVersions({ core: '1.0.0' })
      npmHas({ core: ['1.0.0', '1.1.0'] })

      const { report, exitCode } = await run({ npm: true })
      expect(entry(report.results, 'core').status).toBe('ALREADY PUBLISHED')
      expect(exitCode).toBe(1)
    })

    it('lets a brand-new package through — npm answers E404, not a failure', async () => {
      listWorkspacePackages.mockReturnValue([pkg('brand-new', '0.1.0')])
      changedFiles.mockReturnValue(['packages/brand-new/src/index.ts'])
      baselineVersions({})
      npmHas({})

      const { report, exitCode } = await run({ npm: true })
      expect(entry(report.results, 'brand-new').errors).toEqual([])
      expect(exitCode).toBeNull()
    })

    it('blocks when the registry cannot be reached', async () => {
      listWorkspacePackages.mockReturnValue([pkg('core', '1.1.0')])
      changedFiles.mockReturnValue(['packages/core/src/index.ts'])
      baselineVersions({ core: '1.0.0' })
      runCapture.mockReturnValue({ ok: false, stdout: '<html>502</html>', stderr: 'ETIMEDOUT' })

      const { report, exitCode } = await run({ npm: true })
      expect(entry(report.results, 'core').status).toBe('NPM LOOKUP FAILED')
      expect(exitCode).toBe(1)
    })

    it('does not query npm without the flag', async () => {
      listWorkspacePackages.mockReturnValue([pkg('core', '1.1.0')])
      changedFiles.mockReturnValue(['packages/core/src/index.ts'])
      baselineVersions({ core: '1.0.0' })

      await run({ npm: false })
      expect(runCapture).not.toHaveBeenCalled()
    })
  })
})
