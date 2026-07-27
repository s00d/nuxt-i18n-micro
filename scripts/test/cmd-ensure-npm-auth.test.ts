import { describe, expect, it, vi } from 'vitest'
import { runCli } from './helpers'

const run = vi.hoisted(() => vi.fn<(cmd: string, args: string[]) => string>())
vi.mock('../src/utils/git-baseline', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/git-baseline')>()),
  run,
}))

const { ensureNpmAuthCommand } = await import('../src/commands/ensure-npm-auth')

// No mock reset between tests: every test sets the implementations it needs, and
// clearing a `vi.fn()` that recorded a thrown call makes Vitest report that throw as a
// test failure even when the command handled it exactly as intended.
describe('ensure-npm-auth', () => {
  it('passes when the registry knows who we are', async () => {
    run.mockReturnValue('s00d')
    const { exitCode, stdout } = await runCli(ensureNpmAuthCommand)
    expect(exitCode).toBeNull()
    expect(stdout).toContain('s00d')
  })

  it('fails with the registry error and how to fix it', async () => {
    run.mockImplementation(() => {
      throw Object.assign(new Error('command failed'), { stderr: Buffer.from('ENEEDAUTH: This command requires you to be logged in') })
    })
    const { exitCode, stderr } = await runCli(ensureNpmAuthCommand)
    expect(exitCode).toBe(1)
    expect(stderr).toContain('pnpm login')
    expect(stderr).toContain('ENEEDAUTH')
  })

  it('fails when whoami succeeds but names nobody', async () => {
    // An anonymous session can exit 0 with empty output; publishing would then fail late.
    run.mockReturnValue('')
    expect((await runCli(ensureNpmAuthCommand)).exitCode).toBe(1)
  })
})
