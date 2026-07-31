import { beforeEach, describe, expect, it, vi } from 'vitest'
import { runCli } from './helpers'

/**
 * Mutable stubs — same reason as ensure-npm-auth: vitest mock call recording
 * turns intentional throws into flaky failures.
 */
const state = vi.hoisted(() => ({
  run: (() => '') as (cmd: string, args: string[]) => string,
  tryRun: (() => null) as (cmd: string, args: string[]) => string | null,
}))

vi.mock('../src/utils/git-baseline', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/git-baseline')>()),
  run: (cmd: string, args: string[]) => state.run(cmd, args),
  tryRun: (cmd: string, args: string[]) => state.tryRun(cmd, args),
  assertBaseResolvable: () => undefined,
}))

vi.mock('../src/utils/release-tag', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/release-tag')>()),
  resolveFromTag: () => 'v3.24.0',
}))

const { ensureReleaseSourceCommand, checkReleaseSource, RELEASE_COMMIT_SUBJECT } = await import('../src/commands/ensure-release-source')

function pkg(version: string): string {
  return JSON.stringify({ name: 'nuxt-i18n-micro', version }, null, 2)
}

beforeEach(() => {
  state.run = () => ''
  state.tryRun = () => null
})

describe('RELEASE_COMMIT_SUBJECT', () => {
  it('matches changelogen subjects', () => {
    expect(RELEASE_COMMIT_SUBJECT.test('chore(release): v3.24.3')).toBe(true)
    expect(RELEASE_COMMIT_SUBJECT.test('chore(release): 3.24.3')).toBe(true)
    expect(RELEASE_COMMIT_SUBJECT.test('fix(runtime): bump version')).toBe(false)
  })
})

describe('ensure-release-source', () => {
  it('passes when nothing touched version or CHANGELOG since the tag', async () => {
    state.tryRun = (cmd, args) => {
      if (cmd === 'git' && args[0] === 'status') return ''
      if (cmd === 'git' && args[0] === 'log' && args.includes('--format=%H')) return ''
      if (cmd === 'git' && args[0] === 'rev-parse') return 'ok'
      return null
    }

    const { exitCode, stdout } = await runCli(ensureReleaseSourceCommand, { base: 'v3.24.0' })
    expect(exitCode).toBeNull()
    expect(stdout).toContain('release source ok')
  })

  it('fails on uncommitted CHANGELOG.md edits', async () => {
    state.tryRun = (cmd, args) => {
      if (cmd === 'git' && args[0] === 'status') return ' M CHANGELOG.md'
      return null
    }

    const { exitCode, stderr } = await runCli(ensureReleaseSourceCommand, { base: 'v3.24.0' })
    expect(exitCode).toBe(1)
    expect(stderr).toContain('CHANGELOG.md has uncommitted changes')
    expect(stderr).toContain('pnpm -C scripts cli release')
  })

  it('fails when a non-release commit bumped the root version', () => {
    const sha = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    state.tryRun = (cmd, args) => {
      if (cmd === 'git' && args[0] === 'status') return ''
      if (cmd === 'git' && args[0] === 'log' && args.includes('package.json') && args.includes('--format=%H')) return sha
      if (cmd === 'git' && args[0] === 'log' && args.includes('CHANGELOG.md')) return ''
      if (cmd === 'git' && args[0] === 'show' && args[1] === `${sha}^:package.json`) return pkg('3.24.0')
      if (cmd === 'git' && args[0] === 'show' && args[1] === `${sha}:package.json`) return pkg('3.24.1')
      return null
    }
    state.run = (cmd, args) => {
      if (cmd === 'git' && args[0] === 'log' && args.includes('--format=%s')) return 'fix(runtime): replace history on no_prefix'
      return ''
    }

    const report = checkReleaseSource('v3.24.0')
    expect(report.ok).toBe(false)
    expect(report.violations.some((v) => v.kind === 'manual-version')).toBe(true)
    expect(report.violations[0]?.message).toContain('3.24.0 → 3.24.1')
  })

  it('fails when CHANGELOG.md changed outside chore(release)', () => {
    const sha = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    state.tryRun = (cmd, args) => {
      if (cmd === 'git' && args[0] === 'status') return ''
      if (cmd === 'git' && args[0] === 'log' && args.includes('CHANGELOG.md') && args.includes('--format=%H')) return sha
      if (cmd === 'git' && args[0] === 'log' && args.includes('package.json')) return ''
      return null
    }
    state.run = (cmd, args) => {
      if (cmd === 'git' && args[0] === 'log' && args.includes('--format=%s')) return 'docs: tweak changelog wording'
      return ''
    }

    const report = checkReleaseSource('v3.24.0')
    expect(report.ok).toBe(false)
    expect(report.violations.some((v) => v.kind === 'manual-changelog')).toBe(true)
  })

  it('allows a proper chore(release) commit that bumps version', () => {
    const sha = 'cccccccccccccccccccccccccccccccccccccccc'
    state.tryRun = (cmd, args) => {
      if (cmd === 'git' && args[0] === 'status') return ''
      if (cmd === 'git' && args[0] === 'log' && args.includes('--format=%H') && args.includes('package.json')) return sha
      if (cmd === 'git' && args[0] === 'log' && args.includes('CHANGELOG.md')) return sha
      if (cmd === 'git' && args[0] === 'show' && args[1] === `${sha}^:package.json`) return pkg('3.24.0')
      if (cmd === 'git' && args[0] === 'show' && args[1] === `${sha}:package.json`) return pkg('3.24.1')
      return null
    }
    state.run = (cmd, args) => {
      if (cmd === 'git' && args[0] === 'log' && args.includes('--format=%s')) return 'chore(release): v3.24.1'
      return ''
    }

    expect(checkReleaseSource('v3.24.0').ok).toBe(true)
  })
})
