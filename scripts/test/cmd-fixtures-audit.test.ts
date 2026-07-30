import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

const root = vi.hoisted(() => ({ dir: '' }))
vi.mock('../src/utils/workspace', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/workspace')>()),
  get repoRoot() {
    return root.dir
  },
}))

const { fixturesAuditCommand } = await import('../src/commands/fixtures-audit')
const { runCli } = await import('./helpers')

interface Report {
  fixtures: { name: string; references: number; staleDirs: string[]; committedDirs: string[] }[]
  unreferenced: string[]
  withStaleDirs: string[]
  withCommittedDirs: string[]
}

/** A throwaway workspace: fixtures, plus the sources that may reference them. */
function workspace(fixtures: Record<string, { stale?: string[] }>, references: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'fixtures-audit-'))
  mkdirSync(join(dir, 'test'), { recursive: true })
  for (const [name, options] of Object.entries(fixtures)) {
    mkdirSync(join(dir, 'test/fixtures', name), { recursive: true })
    writeFileSync(join(dir, 'test/fixtures', name, 'nuxt.config.ts'), 'export default {}\n')
    for (const stale of options.stale ?? []) mkdirSync(join(dir, 'test/fixtures', name, stale), { recursive: true })
  }
  writeFileSync(join(dir, 'test/suite.test.ts'), references)
  writeFileSync(join(dir, 'package.json'), '{}\n')
  return dir
}

afterEach(() => rmSync(root.dir, { recursive: true, force: true }))

const run = async (args: Record<string, unknown> = {}) => {
  const cli = await runCli(fixturesAuditCommand, { json: true, dir: 'test/fixtures', strict: false, ...args })
  return { ...cli, report: cli.json<Report>() }
}

describe('fixtures-audit', () => {
  it('reports a fixture nothing mentions', async () => {
    root.dir = workspace({ used: {}, orphan: {} }, "await setup({ rootDir: './fixtures/used' })")

    const { report, exitCode } = await run()
    expect(report.unreferenced).toEqual(['orphan'])
    expect(exitCode).toBeNull()
  })

  it('counts a reference from anywhere under test/, not only a test file', async () => {
    root.dir = workspace({ used: {} }, '{ "fixture": "used" }')
    expect((await run()).report.unreferenced).toEqual([])
  })

  it('reports build leftovers but not node_modules', async () => {
    // Fixtures are workspace packages, so pnpm installs into every one of them.
    root.dir = workspace({ built: { stale: ['.nuxt', '.output', 'node_modules'] } }, 'built')

    const { report } = await run()
    expect(report.withStaleDirs).toEqual(['built'])
    expect(report.fixtures[0]!.staleDirs.sort()).toEqual(['.nuxt', '.output'])
  })

  it('does not fail --strict on build output that is merely present', async () => {
    // `.nuxt` is gitignored and expected after running the suites; failing a release on
    // it would make the gate red on every developer machine.
    root.dir = workspace({ orphan: { stale: ['.nuxt'] } }, 'nothing here')

    const { report, exitCode } = await run({ strict: true })
    expect(report.withStaleDirs).toEqual(['orphan'])
    expect(report.withCommittedDirs).toEqual([])
    expect(exitCode).toBeNull()
  })

  it('fails when the fixtures directory does not exist', async () => {
    root.dir = workspace({}, '')
    // No report to parse: the command exits before printing one.
    const { exitCode, stderr } = await runCli(fixturesAuditCommand, { json: true, dir: 'test/nowhere', strict: false })
    expect(exitCode).toBe(1)
    expect(stderr).toContain('No fixtures directory')
  })
})
