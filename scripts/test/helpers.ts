import type { ArgsDef, CommandDef, ParsedArgs } from 'citty'
import { vi } from 'vitest'

export interface CliRun {
  exitCode: number | null
  stdout: string
  stderr: string
  /** Parsed stdout of a `--json` run. Pass the command's own exported report type. */
  json: <Report>() => Report
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
/**
 * The command's own arguments, with citty's catch-all index signature dropped.
 *
 * `ParsedArgs` ends in `Record<string, …>`, so a misspelled flag type-checks against it
 * and the test then asserts on a default the command never saw. Picking only the keys
 * the command declares turns that into a compile error.
 */
export type CommandArgs<T extends ArgsDef> = Partial<Pick<ParsedArgs<T>, Extract<keyof T, string>>>

export async function runCli<T extends ArgsDef>(cmd: CommandDef<T>, args: CommandArgs<T> = {}): Promise<CliRun> {
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
    await cmd.setup?.({ args: args as ParsedArgs<T>, cmd, rawArgs: [], data: undefined })
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
  return { exitCode, stdout, stderr: err.join('\n'), json: <Report>() => JSON.parse(stdout) as Report }
}
