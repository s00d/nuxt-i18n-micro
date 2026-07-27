import { describe, expect, it, vi } from 'vitest'
import { runCli } from './helpers'

const execFileSync = vi.hoisted(() => vi.fn())
vi.mock('node:child_process', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:child_process')>()),
  execFileSync,
}))

const run = vi.hoisted(() => vi.fn<(cmd: string, args: string[]) => string>(() => 'v3.21.4'))
const tryRun = vi.hoisted(() => vi.fn<(cmd: string, args: string[]) => string | null>(() => ''))
vi.mock('../src/utils/git-baseline', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/git-baseline')>()),
  run,
  tryRun,
}))

const { releaseCommand } = await import('../src/commands/release')

/** Arguments changelogen was invoked with. */
const changelogenArgs = () => execFileSync.mock.calls.at(-1)?.[1] as string[] | undefined

describe('release', () => {
  it('pins changelogen to the resolved v3+ tag', async () => {
    // Without --from, changelogen binds to a legacy v1.x tag and writes a changelog
    // thousands of lines long.
    execFileSync.mockClear()
    await runCli(releaseCommand, { bump: 'patch' })
    expect(changelogenArgs()).toEqual(['exec', 'changelogen', '--release', '--from', 'v3.21.4', '--patch'])
  })

  it('lets changelogen infer the bump for --bump auto', async () => {
    execFileSync.mockClear()
    await runCli(releaseCommand, { bump: 'auto' })
    expect(changelogenArgs()).not.toContain('--auto')
    expect(changelogenArgs()).toEqual(['exec', 'changelogen', '--release', '--from', 'v3.21.4'])
  })

  it('passes minor and major straight through', async () => {
    for (const bump of ['minor', 'major']) {
      execFileSync.mockClear()
      // oxlint-disable-next-line no-await-in-loop
      await runCli(releaseCommand, { bump })
      expect(changelogenArgs()).toContain(`--${bump}`)
    }
  })

  it('rejects an unknown bump before running anything', async () => {
    execFileSync.mockClear()
    const { exitCode, stderr } = await runCli(releaseCommand, { bump: 'huge' })
    expect(exitCode).toBe(1)
    expect(stderr).toContain('Unknown bump')
    expect(execFileSync).not.toHaveBeenCalled()
  })
})
