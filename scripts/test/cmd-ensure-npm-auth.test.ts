import { beforeEach, describe, expect, it, vi } from 'vitest'
import { runCli } from './helpers'

/**
 * A plain mutable function, not `vi.fn()`.
 *
 * Vitest records a mock's thrown calls and reports one as a test failure as soon as
 * anything touches that mock afterwards — even though the command under test caught it
 * and behaved correctly. Nothing here records, so the tests stay order-independent.
 */
const state = vi.hoisted(() => ({ run: (() => '') as (cmd: string, args: string[]) => string }))
const run = { set: (impl: (cmd: string, args: string[]) => string) => (state.run = impl) }
vi.mock('../src/utils/git-baseline', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/git-baseline')>()),
  run: (cmd: string, args: string[]) => state.run(cmd, args),
}))

const { ensureNpmAuthCommand } = await import('../src/commands/ensure-npm-auth')

beforeEach(() => run.set(() => 'nobody'))
describe('ensure-npm-auth', () => {
  it('passes when the registry knows who we are', async () => {
    run.set(() => 's00d')
    const { exitCode, stdout } = await runCli(ensureNpmAuthCommand)
    expect(exitCode).toBeNull()
    expect(stdout).toContain('s00d')
  })

  it('fails with the registry error and how to fix it', async () => {
    run.set(() => {
      throw Object.assign(new Error('command failed'), { stderr: Buffer.from('ENEEDAUTH: This command requires you to be logged in') })
    })
    const { exitCode, stderr } = await runCli(ensureNpmAuthCommand)
    expect(exitCode).toBe(1)
    expect(stderr).toContain('pnpm login')
    expect(stderr).toContain('ENEEDAUTH')
  })

  it('fails when whoami succeeds but names nobody', async () => {
    // An anonymous session can exit 0 with empty output; publishing would then fail late.
    run.set(() => '')
    expect((await runCli(ensureNpmAuthCommand)).exitCode).toBe(1)
  })
})
