import { type ArgsDef, type CommandDef, defineCommand, runCommand } from 'citty'
import { name, version as packageVersion } from '../package.json'
import { reportError, usageError, validationError } from './errors'
import { ownValue } from './json'
import { commandUsage, rootUsage } from './help'
import { closePrompts, formatDuration, isInteractive, log, spinner, style } from './log'
import { type ArgSpec, type CommandSpec, REMOVED_COMMANDS, commands } from './spec'

// plain strings: a re-export would leave `../package.json` in the published declarations, where it does not resolve
export const packageName: string = name
export const version: string = packageVersion

type ParsedArgs = Record<string, unknown>

function citty(spec: ArgSpec): ArgsDef[string] {
  const { type, description, default: fallback, required, alias } = spec
  return { type, description, default: fallback, required, alias } as ArgsDef[string]
}

function convert(name: string, spec: ArgSpec, value: unknown): unknown {
  if (value === undefined || (value === '' && !spec.numeric)) return value
  if (spec.values && !spec.values.includes(String(value))) {
    throw usageError(`Invalid value "${String(value)}" for --${name}`, [`Accepted: ${spec.values.join(', ')}`])
  }
  if (!spec.numeric) return value
  const number = Number(value)
  const valid = Number.isFinite(number) && number > 0 && (spec.numeric === 'number' || Number.isInteger(number))
  if (!valid) throw validationError(`--${name} must be a positive ${spec.numeric === 'int' ? 'integer' : 'number'}`, [`Example: --${name} 10`])
  return number
}

const toCamel = (name: string): string => name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase())

const flagName = (raw: string): string => raw.split('=')[0]!

function assertKnownFlag(name: string, spec: CommandSpec, raw: string): { arg?: ArgSpec; negated: boolean } {
  const flag = toCamel(flagName(raw).slice(2))
  const positive = flag.replace(/^no([A-Z])/, (_match, letter: string) => letter.toLowerCase())
  if (flag !== 'help' && !spec.args[flag] && !spec.args[positive]) {
    throw usageError(`Unknown flag ${flagName(raw)} for ${name}`, [`See i18n-micro ${name} --help`])
  }
  return { arg: spec.args[flag] ?? spec.args[positive], negated: !spec.args[flag] }
}

/** The parser reads anything but `false` as true, so `--force=no` would mean the opposite. */
function assertBooleanValue(raw: string): void {
  const separator = raw.indexOf('=')
  if (separator !== -1 && !['true', 'false'].includes(raw.slice(separator + 1))) {
    throw usageError(`${flagName(raw)} takes true or false`, [`Or write ${flagName(raw)} alone.`])
  }
}

/** The parser hands the next word to a string flag, dashes or not: `--exclude --dryRun` would lose the `--dryRun`. */
function assertHasValue(raw: string, next: string | undefined): void {
  if (next === undefined || (next.startsWith('-') && next !== '-')) {
    throw usageError(`${raw} needs a value`, [`For a value that starts with a dash: ${raw}=<value>`])
  }
}

/**
 * A mistyped `--dryrun`, `-dryRun` or `dryRun` on `clean` must not run the real thing: whatever
 * the parser would drop or misread is an error here. Messages name the flag, never a value:
 * a mistyped `--token` would otherwise end up in a CI log.
 */
function assertKnownArgs(name: string, spec: CommandSpec, rawArgs: string[]): void {
  let positionals = 0
  const end = rawArgs.includes('--') ? rawArgs.indexOf('--') : rawArgs.length
  for (let index = 0; index < end; index += 1) {
    const raw = rawArgs[index]!
    if (raw.startsWith('--')) {
      const { arg, negated } = assertKnownFlag(name, spec, raw)
      if (arg?.type === 'boolean' || negated) assertBooleanValue(raw)
      else if (arg?.type === 'string' && !raw.includes('=')) {
        assertHasValue(raw, index + 1 < end ? rawArgs[index + 1] : undefined)
        index += 1
      }
    } else if (raw.startsWith('-') && raw !== '-') {
      throw usageError(`Not a flag of ${name}`, ['Long flags take two dashes.', `See i18n-micro ${name} --help`])
    } else positionals += 1
  }
  positionals += Math.max(0, rawArgs.length - end - 1)
  if (positionals > Object.values(spec.args).filter((arg) => arg.type === 'positional').length) {
    throw usageError(`Too many arguments for ${name}`, [`See i18n-micro ${name} --help`])
  }
}

function validated(spec: CommandSpec, args: ParsedArgs): ParsedArgs {
  const out: ParsedArgs = { ...args }
  for (const [name, arg] of Object.entries(spec.args)) out[name] = convert(name, arg, args[name])
  return out
}

function toCommand(name: string, spec: CommandSpec): CommandDef {
  const args = Object.fromEntries(Object.entries(spec.args).map(([key, arg]) => [key, citty(arg)]))
  return defineCommand({
    meta: { name, description: spec.description },
    args,
    async run({ args: parsed, rawArgs }) {
      assertKnownArgs(name, spec, rawArgs)
      log.setSilent(parsed.logLevel === 'silent')
      // A terminal only: a pipe, a CI log and `--json` keep their exact text.
      if (isInteractive() && !parsed.json) log.info(`${style('green', `i18n-micro ${style('bold', `v${version}`)}`)} ${style('gray', `· ${name}`)}`)
      spinner.start(`Running ${name}`)
      const handler = await spec.load()
      await handler.default(validated(spec, parsed) as never)
    },
  })
}

export const main = defineCommand({
  meta: { name: 'i18n-micro', version, description: 'Command-line tools for nuxt-i18n-micro' },
  subCommands: Object.fromEntries(Object.entries(commands).map(([name, spec]) => [name, toCommand(name, spec)])),
})

/** How long the command took, as nuxi ends a build: on a terminal only, where it cannot unsettle a diff of the output. */
function footer(started: number, rawArgs: string[]): void {
  if (isInteractive() && !rawArgs.some((arg) => arg === '--json' || arg.startsWith('--json=')))
    log.info(style('gray', `\nDone in ${formatDuration(performance.now() - started)}`))
}

/** Run the CLI. Failures set `process.exitCode`; nothing here throws. */
export async function runCli(rawArgs: string[]): Promise<void> {
  process.exitCode = 0
  const first = rawArgs[0] ?? ''
  try {
    if (rawArgs.length === 1 && ['--version', '-v'].includes(rawArgs[0]!)) {
      console.log(version)
      return
    }
    const replacement = ownValue(REMOVED_COMMANDS, first)
    if (replacement) throw usageError(`The ${first} command was removed. Use ${replacement}.`)
    if (rawArgs.length === 0 || rawArgs.includes('--help') || rawArgs.includes('-h')) {
      const spec = ownValue(commands, first)
      log.info(spec ? commandUsage(first, spec, version) : rootUsage(version))
      return
    }
    // The parser takes the first word as the command, so `--dryRun clean` would lose its flag.
    if (first.startsWith('-')) throw usageError('Flags go after the command.')
    if (!ownValue(commands, first)) throw usageError(`Unknown command ${first}`, ['See i18n-micro --help'])
    const started = performance.now()
    await runCommand(main, { rawArgs })
    spinner.stop()
    footer(started, rawArgs)
  } catch (error) {
    spinner.stop()
    reportError(error, rawArgs.includes('--debug'))
  } finally {
    closePrompts()
  }
}
