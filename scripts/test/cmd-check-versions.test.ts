import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CommandResult, WorkspacePackage } from '../src/utils/git-baseline'
import type { CheckVersionsReport, VersionEntry } from '../src/commands/check-versions'
import { versionSatisfiesRange } from '../src/utils/semver'
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

const pkg = (
  name: string,
  version: string,
  extra: Partial<WorkspacePackage['pkg']> = {},
): WorkspacePackage => {
  const dirName = name.includes('/') ? name.split('/').pop()! : name
  return {
    name,
    dir: `/repo/packages/${dirName}`,
    relDir: `packages/${dirName}`,
    localVersion: version,
    pkg: { name, version, ...extra },
  }
}

/** `git show <ref>:<dir>/package.json` for the baseline versions a test declares. */
function baselineVersions(versions: Record<string, string | null>) {
  tryRun.mockImplementation((_cmd, args) => {
    const match = /^v[\d.]+:packages\/(.+)\/package\.json$/.exec(args[1] ?? '')
    if (!match) return null
    const version = versions[match[1]!]
    return version === undefined || version === null ? null : JSON.stringify({ version })
  })
}

const npmHas = (versions: Record<string, string[]>, deps: Record<string, Record<string, string>> = {}) =>
  runCapture.mockImplementation((_cmd, args) => {
    if (args[2] === 'dependencies') {
      const spec = args[1]!
      const scoped = spec.match(/^(@[^/]+\/[^@]+)@(.+)$/)
      const pkgName = scoped?.[1] ?? spec.slice(0, spec.lastIndexOf('@'))
      const pin = deps[pkgName]
      if (!pin) return { ok: true, stdout: '{}', stderr: '' }
      return { ok: true, stdout: JSON.stringify(pin), stderr: '' }
    }

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
  changedFiles.mockReturnValue([])
})

describe('versionSatisfiesRange', () => {
  it('handles exact, caret, and tilde pins', () => {
    expect(versionSatisfiesRange('1.0.11', '1.0.11')).toBe(true)
    expect(versionSatisfiesRange('1.0.11', '1.0.8')).toBe(false)
    expect(versionSatisfiesRange('1.0.11', '^1.0.8')).toBe(true)
    expect(versionSatisfiesRange('2.0.0', '^1.0.8')).toBe(false)
    expect(versionSatisfiesRange('1.1.0', '~1.0.8')).toBe(false)
    expect(versionSatisfiesRange('1.0.11', '~1.0.8')).toBe(true)
  })
})

describe('check-versions', () => {
  it('passes when nothing changed', async () => {
    listWorkspacePackages.mockReturnValue([pkg('core', '1.0.0')])
    baselineVersions({ core: '1.0.0' })

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

  it('cascades a bump to dependents that still match the baseline version', async () => {
    listWorkspacePackages.mockReturnValue([
      pkg('@i18n-micro/utils', '1.0.11'),
      pkg('@i18n-micro/hmr', '1.0.4', { dependencies: { '@i18n-micro/utils': 'workspace:^' } }),
    ])
    changedFiles.mockImplementation((_ref, relDir) => (relDir === 'packages/utils' ? ['packages/utils/src/build.ts'] : []))
    baselineVersions({ utils: '1.0.8', hmr: '1.0.4' })

    const { report, exitCode } = await run()
    expect(entry(report.results, '@i18n-micro/utils').status).toBe('bumped 1.0.8 → 1.0.11')
    expect(entry(report.results, '@i18n-micro/hmr').status).toBe('NEEDS BUMP')
    expect(entry(report.results, '@i18n-micro/hmr').errors[0]).toContain('depends on @i18n-micro/utils')
    expect(exitCode).toBe(1)
  })

  it('does not cascade bumps onto brand-new dependents', async () => {
    listWorkspacePackages.mockReturnValue([
      pkg('@i18n-micro/vue', '1.3.11'),
      pkg('@i18n-micro/vitepress', '1.0.0', { dependencies: { '@i18n-micro/vue': 'workspace:^' } }),
    ])
    changedFiles.mockImplementation((_ref, relDir) =>
      relDir === 'packages/vue'
        ? ['packages/vue/src/components/i18n-link.ts']
        : ['packages/vitepress/src/index.ts'],
    )
    baselineVersions({ vue: '1.3.10' })

    const { report, exitCode } = await run()
    expect(entry(report.results, '@i18n-micro/vue').status).toBe('bumped 1.3.10 → 1.3.11')
    expect(entry(report.results, '@i18n-micro/vitepress').status).toBe('new package')
    expect(entry(report.results, '@i18n-micro/vitepress').errors).toEqual([])
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

    it('fails when an already-published version still has a stale exact workspace pin', async () => {
      listWorkspacePackages.mockReturnValue([
        pkg('@i18n-micro/utils', '1.0.11'),
        pkg('@i18n-micro/hmr', '1.0.4', { dependencies: { '@i18n-micro/utils': 'workspace:^' } }),
      ])
      baselineVersions({ utils: '1.0.11', hmr: '1.0.4' })
      npmHas(
        { '@i18n-micro/utils': ['1.0.11'], '@i18n-micro/hmr': ['1.0.4'] },
        { '@i18n-micro/hmr': { '@i18n-micro/utils': '1.0.8' } },
      )

      const { report, exitCode } = await run({ npm: true })
      expect(entry(report.results, '@i18n-micro/hmr').status).toBe('STALE DEP PIN')
      expect(exitCode).toBe(1)
    })

    it('passes when the published pin is a caret that still satisfies the local version', async () => {
      listWorkspacePackages.mockReturnValue([
        pkg('@i18n-micro/utils', '1.0.11'),
        pkg('@i18n-micro/hmr', '1.0.5', { dependencies: { '@i18n-micro/utils': 'workspace:^' } }),
      ])
      baselineVersions({ utils: '1.0.11', hmr: '1.0.5' })
      npmHas(
        { '@i18n-micro/utils': ['1.0.11'], '@i18n-micro/hmr': ['1.0.5'] },
        { '@i18n-micro/hmr': { '@i18n-micro/utils': '^1.0.8' } },
      )

      const { report, exitCode } = await run({ npm: true })
      expect(entry(report.results, '@i18n-micro/hmr').errors).toEqual([])
      expect(exitCode).toBeNull()
    })
  })
})
