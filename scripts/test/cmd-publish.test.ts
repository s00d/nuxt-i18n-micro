import { beforeEach, describe, expect, it, vi } from 'vitest'
import { runCli } from './helpers'

const execFileSync = vi.hoisted(() => vi.fn())
vi.mock('node:child_process', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:child_process')>()),
  execFileSync,
}))

const runCapture = vi.hoisted(() => vi.fn())
const tryRun = vi.hoisted(() => vi.fn<() => string | null>(() => ''))
vi.mock('../src/utils/git-baseline', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/git-baseline')>()),
  run: () => 'abc123',
  runCapture,
  tryRun,
}))

const { publishCommand } = await import('../src/commands/publish')

/** Everything the command ran, as "pnpm run test" strings. */
const steps = () => execFileSync.mock.calls.map(([cmd, args]) => `${cmd} ${(args as string[]).join(' ')}`)
/** `gh run list` answers `runs`, and `gh run view <id>` the jobs of run `<id>`: the `ci` job by default. */
const gh = (runs: unknown[], jobs: Record<number, unknown[]> = {}) =>
  runCapture.mockImplementation((_cmd: string, args: string[]) => ({
    ok: true,
    stdout: JSON.stringify(args[1] === 'view' ? { jobs: jobs[Number(args[2])] ?? [{ name: 'ci', conclusion: 'success' }] } : runs),
    stderr: '',
  }))
const passed = { databaseId: 1, name: 'ci', status: 'completed', conclusion: 'success', url: 'https://ci/1' }
/** Run 40857327536: closing a PR gives a green run, 9 seconds long, with the test job skipped. */
const closedPr = [
  { name: 'cleanup-sticky', conclusion: 'success' },
  { name: 'ci', conclusion: 'skipped' },
]

describe('publish', () => {
  beforeEach(() => {
    execFileSync.mockClear()
    runCapture.mockReset()
    tryRun.mockReturnValue('')
  })

  it('runs the tests by default, and bumps before publishing', async () => {
    await runCli(publishCommand, { bump: 'minor' })
    expect(runCapture).not.toHaveBeenCalled()
    expect(steps()).toEqual([
      'pnpm run release:auth',
      'pnpm run prepack',
      'pnpm run format:check',
      'pnpm run lint',
      'pnpm run typecheck',
      'pnpm run check:versions -- --npm',
      'pnpm run release:source',
      'pnpm run compare:published',
      'pnpm run test',
      'pnpm -C scripts cli release --bump minor',
      'pnpm publish -r',
      'git push --follow-tags',
    ])
  })

  it('--ci-passed drops the tests and nothing else, and says why', async () => {
    await runCli(publishCommand, { bump: 'minor' })
    const all = steps()
    execFileSync.mockClear()

    gh([passed, { ...passed, conclusion: 'cancelled' }])
    const { stdout } = await runCli(publishCommand, { bump: 'minor', ciPassed: true })
    expect(steps()).toEqual(all.filter((s) => s !== 'pnpm run test'))
    expect(stdout).toContain('Skipping local tests: CI passed on abc123.')
  })

  it('without --bump leaves the root alone', async () => {
    await runCli(publishCommand, {})
    expect(steps().some((s) => s.includes('cli release'))).toBe(false)
    expect(steps()).toContain('pnpm publish -r')
  })

  it('--check-only stops before anything leaves the machine', async () => {
    await runCli(publishCommand, { bump: 'patch', checkOnly: true })
    expect(steps()).toContain('pnpm run test')
    for (const s of ['release:auth', 'cli release', 'publish -r', 'git push']) expect(steps().join('\n')).not.toContain(s)
  })

  it.each([
    ['a failed run', [passed, { ...passed, conclusion: 'failure' }], 'CI failure on abc123: https://ci/1'],
    ['a run in progress', [{ ...passed, status: 'in_progress', conclusion: '' }], 'CI is still running'],
    ['only cancelled runs', [{ ...passed, conclusion: 'cancelled' }], 'no passed CI run'],
    ['no run at all', [], 'no passed CI run'],
  ])('--ci-passed refuses on %s, and --force does not override it', async (_, runs, message) => {
    gh(runs)
    for (const force of [false, true]) {
      // oxlint-disable-next-line no-await-in-loop
      const { exitCode, stderr } = await runCli(publishCommand, { ciPassed: true, force })
      expect(exitCode).toBe(1)
      expect(stderr).toContain(message)
      expect(execFileSync).not.toHaveBeenCalled()
    }
  })

  it.each([
    ['the run of a closed PR', [passed], { 1: closedPr }],
    ['that run beside a cancelled one', [{ ...passed, conclusion: 'cancelled', databaseId: 2 }, passed], { 1: closedPr }],
    ['a green run whose test job was cancelled', [passed], { 1: [{ name: 'ci', conclusion: 'cancelled' }] }],
  ])('--ci-passed refuses %s: no test ran, and --force does not override it', async (_, runs, jobs) => {
    gh(runs, jobs)
    for (const force of [false, true]) {
      // oxlint-disable-next-line no-await-in-loop
      const { exitCode, stderr } = await runCli(publishCommand, { ciPassed: true, force })
      expect(exitCode).toBe(1)
      expect(stderr).toContain('no passed CI run')
      expect(execFileSync).not.toHaveBeenCalled()
    }
  })

  it('--ci-passed finds the run that tested HEAD among others', async () => {
    gh([passed, { ...passed, databaseId: 2 }], { 1: closedPr })
    const { stdout } = await runCli(publishCommand, { ciPassed: true })
    expect(stdout).toContain('Skipping local tests: CI passed on abc123.')
  })

  it('--ci-passed asks for --force when gh lists the runs but cannot show the jobs', async () => {
    runCapture.mockImplementation((_cmd: string, args: string[]) =>
      args[1] === 'view' ? { ok: false, stdout: '', stderr: 'HTTP 502' } : { ok: true, stdout: JSON.stringify([passed]), stderr: '' },
    )
    const { exitCode, stderr } = await runCli(publishCommand, { ciPassed: true })
    expect(exitCode).toBe(1)
    expect(stderr).toContain('HTTP 502')
    expect(stderr).toContain('--force')
  })

  it('a dirty tree stops before the bump: no commit or tag is left behind', async () => {
    tryRun.mockReturnValue(' M src/module.ts')
    const { exitCode, stderr } = await runCli(publishCommand, { bump: 'minor' })
    expect(exitCode).toBe(1)
    expect(stderr).toContain('nothing was bumped')
    expect(steps().some((s) => s.includes('cli release') || s.includes('publish -r'))).toBe(false)
  })

  it('--ci-passed refuses a dirty tree: CI never saw it', async () => {
    tryRun.mockReturnValue(' M src/module.ts')
    const { exitCode, stderr } = await runCli(publishCommand, { ciPassed: true })
    expect(exitCode).toBe(1)
    expect(stderr).toContain('uncommitted changes')
    expect(runCapture).not.toHaveBeenCalled()
  })

  it('when gh cannot answer, asks for --force instead of guessing', async () => {
    runCapture.mockReturnValue({ ok: false, stdout: '', stderr: 'gh: not logged in' })

    const refused = await runCli(publishCommand, { ciPassed: true })
    expect(refused.exitCode).toBe(1)
    expect(refused.stderr).toContain('not logged in')
    expect(refused.stderr).toContain('--force')
    expect(execFileSync).not.toHaveBeenCalled()

    const { stdout } = await runCli(publishCommand, { ciPassed: true, force: true })
    expect(stdout).toContain('Skipping local tests: --force confirms CI passed on abc123, unchecked.')
    expect(steps()).toContain('pnpm publish -r')
    expect(steps()).not.toContain('pnpm run test')
  })

  it('rejects an unknown bump and a lone --force before running anything', async () => {
    expect((await runCli(publishCommand, { bump: 'auto' })).exitCode).toBe(1)
    expect((await runCli(publishCommand, { force: true })).exitCode).toBe(1)
    expect(execFileSync).not.toHaveBeenCalled()
  })
})
