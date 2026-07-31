import { beforeEach, describe, expect, it, vi } from 'vitest'
import { runCli } from './helpers'

/** Which gates ran, and what each returned — the command shells out to its own CLI. */
const state = vi.hoisted(() => ({ calls: [] as string[][], failing: new Set<string>() }))

vi.mock('node:child_process', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:child_process')>()),
  // `pnpm exec tsx ./src/run.ts <gate> [flags]` — the gate and its flags start at index 3.
  execFileSync: (_cmd: string, args: string[]) => {
    const gate = args[3]!
    state.calls.push(args.slice(3))
    if (state.failing.has(gate)) {
      throw Object.assign(new Error('failed'), { stdout: Buffer.from(`${gate} said no`) })
    }
    return ''
  },
}))

vi.mock('../src/utils/git-baseline', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/git-baseline')>()),
  listWorkspacePackages: () => [{ name: '@i18n-micro/core', dir: '', relDir: '', localVersion: '1.0.0', pkg: {} }],
  tryRun: (_cmd: string, args: string[]) => (args[0] === 'tag' ? 'v3.21.4' : ''),
}))

const { preflightCommand } = await import('../src/commands/preflight')

interface Report {
  gates: { name: string; ok: boolean; skipped: boolean; detail: string }[]
  failed: number
  wouldPublish: { name: string; version: string }[]
  from: string | null
}

const run = async (args: Record<string, unknown> = {}) => {
  const cli = await runCli(preflightCommand, { json: true, npm: false, offline: false, budget: false, ...args })
  return { ...cli, report: cli.json<Report>() }
}

const gateNames = () => state.calls.map((call) => call[0])

beforeEach(() => {
  state.calls = []
  state.failing = new Set()
})

describe('preflight', () => {
  it('runs every gate and publishes nothing', async () => {
    const { report, exitCode } = await run()

    expect(report.gates.map((gate) => gate.name)).toEqual(['deps-audit', 'verify-packages', 'api-surface', 'docs-audit', 'docs-generate', 'fixtures-audit', 'check-versions', 'ensure-release-source', 'ensure-npm-auth'])
    expect(exitCode).toBeNull()
    expect(report.wouldPublish).toEqual([{ name: '@i18n-micro/core', version: '1.0.0' }])
  })

  it('reports every failure rather than stopping at the first', async () => {
    // The `&&` chain it replaces tells you nothing about the gates after the first.
    state.failing = new Set(['deps-audit', 'docs-audit'])

    const { report, exitCode } = await run()
    expect(report.failed).toBe(2)
    expect(report.gates.filter((gate) => !gate.ok).map((gate) => gate.name)).toEqual(['deps-audit', 'docs-audit'])
    expect(report.gates.find((gate) => gate.name === 'docs-audit')!.detail).toContain('docs-audit said no')
    expect(exitCode).toBe(1)
  })

  it('demands --strict from the fixture audit, which otherwise exits 0 on its findings', async () => {
    await run()
    expect(state.calls.find((call) => call[0] === 'fixtures-audit')).toEqual(['fixtures-audit', '--strict'])
  })

  it('checks the registry only with --npm', async () => {
    await run()
    expect(gateNames()).not.toContain('ensure-npm-auth')
    expect(state.calls.find((call) => call[0] === 'check-versions')).toEqual(['check-versions'])

    state.calls = []
    await run({ npm: true })
    expect(gateNames()).toContain('ensure-npm-auth')
    expect(state.calls.find((call) => call[0] === 'check-versions')).toEqual(['check-versions', '--npm'])
  })

  it('skips every network gate under --offline', async () => {
    const { report } = await run({ npm: true, offline: true })
    const skipped = report.gates.filter((gate) => gate.skipped).map((gate) => gate.name)

    // `check-versions` counts: it can `git fetch` to resolve its baseline.
    expect(skipped).toEqual(['check-versions', 'ensure-npm-auth'])
    expect(gateNames()).not.toContain('check-versions')
  })

  it('runs the budget last, and only with --budget', async () => {
    await run()
    expect(gateNames()).not.toContain('payload-budget')

    state.calls = []
    await run({ budget: true })
    // It builds an app; discovering a packaging failure after that defeats the ordering.
    expect(gateNames().at(-1)).toBe('payload-budget')
  })
})
