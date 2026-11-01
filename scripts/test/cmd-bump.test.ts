import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WorkspacePackage } from '../src/utils/git-baseline'
import { runCli } from './helpers'

const listWorkspacePackages = vi.hoisted(() => vi.fn<() => WorkspacePackage[]>())
vi.mock('../src/utils/git-baseline', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/git-baseline')>()),
  listWorkspacePackages,
}))

const { bumpCommand } = await import('../src/commands/bump')

function fixture(name: string, version: string): WorkspacePackage {
  const dir = mkdtempSync(join(tmpdir(), 'bump-'))
  // A nested key with the same text must stay put.
  const body = `{\n  "name": "${name}",\n  "version": "${version}",\n  "peer": { "version": "${version}" },\n  "files": ["dist"]\n}\n`
  writeFileSync(join(dir, 'package.json'), body)
  return { name, dir, relDir: `packages/${name}`, localVersion: version, pkg: { name, version } }
}

const manifest = (pkg: WorkspacePackage) => readFileSync(join(pkg.dir, 'package.json'), 'utf8')

describe('bump', () => {
  let core: WorkspacePackage
  let vue: WorkspacePackage

  beforeEach(() => {
    core = fixture('@i18n-micro/core', '2.0.0')
    vue = fixture('@i18n-micro/vue', '2.1.3')
    listWorkspacePackages.mockReturnValue([core, vue])
  })

  it('bumps only the named packages, at the named level, and keeps the formatting', async () => {
    const { stdout } = await runCli(bumpCommand, { level: 'minor', packages: 'core' })
    expect(stdout).toContain('@i18n-micro/core: 2.0.0 → 2.1.0')
    expect(manifest(core)).toContain('  "version": "2.1.0",\n  "peer": { "version": "2.0.0" },\n  "files": ["dist"]\n')
    expect(manifest(vue)).toContain('"version": "2.1.3"')
  })

  it('takes scoped names and "all"', async () => {
    await runCli(bumpCommand, { level: 'patch', packages: '@i18n-micro/vue' })
    expect(manifest(vue)).toContain('"version": "2.1.4"')

    listWorkspacePackages.mockReturnValue([core, { ...vue, localVersion: '2.1.4' }])
    await runCli(bumpCommand, { level: 'major', packages: 'all' })
    expect(manifest(core)).toContain('"version": "3.0.0"')
    expect(manifest(vue)).toContain('"version": "3.0.0"')
  })

  it('writes nothing without a level, or with an unknown package', async () => {
    const noLevel = await runCli(bumpCommand, { packages: 'core' })
    expect(noLevel.exitCode).toBe(1)
    expect(noLevel.stderr).toContain('--level patch | minor | major')

    const unknown = await runCli(bumpCommand, { level: 'patch', packages: 'core,nope' })
    expect(unknown.exitCode).toBe(1)
    expect(unknown.stderr).toContain('Unknown: nope')

    const empty = await runCli(bumpCommand, { level: 'patch' })
    expect(empty.exitCode).toBe(1)

    expect(manifest(core)).toContain('"version": "2.0.0"')
  })
})
