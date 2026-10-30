import { log } from './log'

export interface CliErrorOptions {
  code: string
  hints?: readonly string[]
  details?: Record<string, string>
  cause?: unknown
}

/** An expected failure: printed as message, details and hints, never as a stack trace. */
export class CliError extends Error {
  readonly code: string
  readonly hints: readonly string[]
  readonly details: Readonly<Record<string, string>>

  constructor(message: string, options: CliErrorOptions) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause })
    this.name = 'CliError'
    this.code = options.code
    this.hints = options.hints ?? []
    this.details = options.details ?? {}
  }
}

const factory =
  (code: string) =>
  (message: string, hints: readonly string[] = [], details?: Record<string, string>): CliError =>
    new CliError(message, { code, hints, details })

export const usageError = factory('USAGE_ERROR')
export const validationError = factory('VALIDATION_ERROR')
export const notFoundError = factory('NOT_FOUND')
export const commandFailed = factory('COMMAND_FAILED')
export const remoteConfigError = factory('REMOTE_CONFIG_ERROR')
/** The command worked and found something wrong: exit code 1, not a failure of the tool. */
export const findingsError = factory('FINDINGS')

function fromSystemError(error: NodeJS.ErrnoException): CliError | null {
  if (error.code === 'ENOENT') return new CliError(`Path not found: ${error.path ?? 'unknown'}`, { code: 'FILE_NOT_FOUND', cause: error })
  if (error.code === 'EACCES' || error.code === 'EPERM') {
    return new CliError(`Permission denied: ${error.path ?? 'unknown'}`, { code: 'PERMISSION_DENIED', cause: error })
  }
  return null
}

function normalize(error: unknown): CliError {
  if (error instanceof CliError) return error
  const system = error instanceof Error ? fromSystemError(error) : null
  if (system) return system
  const message = error instanceof Error ? error.message : String(error)
  return new CliError(message, { code: 'COMMAND_FAILED', hints: ['Run with --debug for a stack trace.'], cause: error })
}

export function reportError(error: unknown, debug: boolean): void {
  const normalized = normalize(error)
  log.error(normalized.message)
  for (const [label, value] of Object.entries(normalized.details)) log.error(`  ${label}: ${value}`)
  for (const hint of normalized.hints) log.error(`  ${hint}`)
  if (debug) log.error(String((normalized.cause as Error | undefined)?.stack ?? normalized.stack))
  process.exitCode = normalized.code === 'FINDINGS' ? 1 : 2
}
