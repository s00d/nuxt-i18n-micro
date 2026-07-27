import { vi } from 'vitest'

export interface CliRun {
  exitCode: number | null
  stdout: string
  stderr: string
  /** Parsed stdout, for commands invoked with `--json`. */
  json: <T>() => T
}

class ProcessExit extends Error {
  constructor(public code: number) {
    super(`process.exit(${code})`)
  }
}

/**
 * Invoke a citty command's `setup` the way the CLI would, capturing what a caller
 * actually observes: stdout, stderr and the exit code.
 *
 * `process.exit` is replaced with a throw so the command stops where it really would —
 * a stub that returns lets the rest of the body run against state the command already
 * decided was unusable, which is how a passing test can describe behaviour that never
 * happens.
 */
/** Structural shape of a citty command, so any concrete `args` definition is accepted. */
interface RunnableCommand {
  setup?: (...args: never[]) => unknown
}

export async function runCli(cmd: RunnableCommand, args: Record<string, unknown> = {}): Promise<CliRun> {
  const out: string[] = []
  const err: string[] = []
  let exitCode: number | null = null

  const log = vi.spyOn(console, 'log').mockImplementation((...a: unknown[]) => void out.push(a.join(' ')))
  const error = vi.spyOn(console, 'error').mockImplementation((...a: unknown[]) => void err.push(a.join(' ')))
  const exit = vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new ProcessExit(Number(code ?? 0))
  })
  const write = vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    out.push(String(chunk))
    return true
  })

  try {
    const setup = cmd.setup as ((ctx: unknown) => unknown) | undefined
    await setup?.({ args, cmd, rawArgs: [], data: undefined })
  } catch (e) {
    if (!(e instanceof ProcessExit)) throw e
    exitCode = e.code
  } finally {
    log.mockRestore()
    error.mockRestore()
    exit.mockRestore()
    write.mockRestore()
  }

  const stdout = out.join('\n')
  return { exitCode, stdout, stderr: err.join('\n'), json: <T>() => JSON.parse(stdout) as T }
}
