import { type ArgsDef, type CommandDef, defineCommand, runCommand, showUsage } from 'citty'
import { name as packageName, version } from '../package.json'
import { reportError, usageError, validationError } from './errors'
import { closePrompts, log } from './log'
import { type ArgSpec, type CommandSpec, REMOVED_COMMANDS, commands } from './spec'

type ParsedArgs = Record<string, unknown>

function citty(spec: ArgSpec): ArgsDef[string] {
  const { type, description, default: fallback, required, alias } = spec
  const shown = spec.defaultHint ? `${description} (default: ${spec.defaultHint.replaceAll('`', '')})` : description
  return { type, description: shown, default: fallback, required, alias } as ArgsDef[string]
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

function assertKnownFlag(name: string, spec: CommandSpec, raw: string): ArgSpec | undefined {
  const flag = toCamel(raw.slice(2).split('=')[0]!)
  const positive = flag.replace(/^no([A-Z])/, (_match, letter: string) => letter.toLowerCase())
  if (flag !== 'help' && !spec.args[flag] && !spec.args[positive]) {
    throw usageError(`Unknown flag ${raw.split('=')[0]} for ${name}`, [`See i18n-micro ${name} --help`])
  }
  return spec.args[flag]
}

const takesValue = (arg: ArgSpec | undefined, raw: string): boolean => arg?.type === 'string' && !raw.includes('=')

/**
 * A mistyped `--dryrun`, `-dryRun` or `dryRun` on `clean` must not run the real thing: whatever
 * the parser would drop or misread is an error here.
 */
function assertKnownArgs(name: string, spec: CommandSpec, rawArgs: string[]): void {
  const positionals: string[] = []
  const end = rawArgs.includes('--') ? rawArgs.indexOf('--') : rawArgs.length
  for (let index = 0; index < end; index += 1) {
    const raw = rawArgs[index]!
    if (raw.startsWith('--')) {
      if (takesValue(assertKnownFlag(name, spec, raw), raw) && !rawArgs[index + 1]?.startsWith('-')) index += 1
    } else if (raw.startsWith('-') && raw !== '-') {
      throw usageError(`Unknown flag ${raw} for ${name}`, ['Long flags take two dashes.', `See i18n-micro ${name} --help`])
    } else positionals.push(raw)
  }
  positionals.push(...rawArgs.slice(end + 1))
  const allowed = Object.values(spec.args).filter((arg) => arg.type === 'positional').length
  if (positionals.length > allowed) {
    throw usageError(`Unexpected argument for ${name}: ${positionals[allowed]}`, [`See i18n-micro ${name} --help`])
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
      const handler = await spec.load()
      await handler.default(validated(spec, parsed) as never)
    },
  })
}

export const main = defineCommand({
  meta: { name: 'i18n-micro', version, description: 'Command-line tools for nuxt-i18n-micro' },
  subCommands: Object.fromEntries(Object.entries(commands).map(([name, spec]) => [name, toCommand(name, spec)])),
})

export { packageName, version }

/** Run the CLI. Failures set `process.exitCode`; nothing here throws. */
export async function runCli(rawArgs: string[]): Promise<void> {
  try {
    if (rawArgs.length === 1 && ['--version', '-v'].includes(rawArgs[0]!)) {
      console.log(version)
      return
    }
    const replacement = REMOVED_COMMANDS[rawArgs[0] ?? '']
    if (replacement) throw usageError(`The ${rawArgs[0]} command was removed. Use ${replacement}.`)
    if (rawArgs.length === 0 || rawArgs.includes('--help') || rawArgs.includes('-h')) {
      const target = commands[rawArgs[0] ?? ''] ? toCommand(rawArgs[0]!, commands[rawArgs[0]!]!) : main
      await showUsage(target, target === main ? undefined : main)
      return
    }
    // The parser takes the first word as the command, so `--dryRun clean` would lose its flag.
    if (rawArgs[0]!.startsWith('-')) throw usageError(`Unknown flag ${rawArgs[0]}: flags go after the command.`)
    await runCommand(main, { rawArgs })
  } catch (error) {
    reportError(error, rawArgs.includes('--debug'))
  } finally {
    closePrompts()
  }
}
