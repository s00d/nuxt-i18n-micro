import { describe, expect, it, vi } from 'vitest'
import { runCli } from './helpers'

const run = vi.hoisted(() => vi.fn<(cmd: string, args: string[]) => string>())
const tryRun = vi.hoisted(() => vi.fn<(cmd: string, args: string[]) => string | null>())

vi.mock('../src/utils/git-baseline', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/git-baseline')>()),
  run,
  tryRun,
}))

const { changelogFromRefCommand } = await import('../src/commands/changelog-from-ref')

/** `git tag -l` output, plus which of those tags are ancestors of HEAD. */
function repoTags(tags: string[], ancestors: string[] = tags) {
  run.mockImplementation((_cmd, args) => (args[0] === 'tag' ? tags.join('\n') : ''))
  tryRun.mockImplementation((_cmd, args) => (args[0] === 'merge-base' ? (ancestors.includes(args[2]!) ? '' : null) : null))
}

// No mock reset between tests: every test sets the implementations it needs, and
// clearing a `vi.fn()` that recorded a thrown call makes Vitest report that throw as a
// test failure even when the command handled it exactly as intended.
describe('changelog-from-ref', () => {
  it('picks the highest v3+ tag', async () => {
    repoTags(['v3.9.0', 'v3.10.0', 'v3.21.4'])
    const { stdout, exitCode } = await runCli(changelogFromRefCommand)
    expect(stdout).toBe('v3.21.4')
    expect(exitCode).toBeNull()
  })

  it('ignores the hundreds of legacy v1/v2 tags this repo carries', async () => {
    // The bug this guards: binding to a v1 tag produces a changelog thousands of lines
    // long, which is what `git describe` and changelogen's default both do here.
    repoTags(['v1.9.9', 'v2.5.0', 'v3.0.1'])
    expect((await runCli(changelogFromRefCommand)).stdout).toBe('v3.0.1')
  })

  it('skips a newer tag that is not on the ancestry of HEAD', async () => {
    // A tag cut on another branch: newer, but nothing between it and HEAD is meaningful.
    repoTags(['v3.22.0', 'v3.21.4'], ['v3.21.4'])
    expect((await runCli(changelogFromRefCommand)).stdout).toBe('v3.21.4')
  })

  it('ignores tags that are not plain vX.Y.Z', async () => {
    repoTags(['nightly', 'v3.1', 'v3.2.0-beta.1', 'release-3.3.0', 'v3.1.0'])
    expect((await runCli(changelogFromRefCommand)).stdout).toBe('v3.1.0')
  })

  it('exits 1 with a usable message when there is no v3+ tag', async () => {
    repoTags(['v2.0.0'])
    const { exitCode, stderr } = await runCli(changelogFromRefCommand)
    expect(exitCode).toBe(1)
    expect(stderr).toContain('no v3+ semver tag')
  })

  it('exits 1 when git itself fails', async () => {
    run.mockImplementation(() => {
      throw new Error('not a git repository')
    })
    const { exitCode, stderr } = await runCli(changelogFromRefCommand)
    expect(exitCode).toBe(1)
    expect(stderr).toContain('not a git repository')
  })
})
