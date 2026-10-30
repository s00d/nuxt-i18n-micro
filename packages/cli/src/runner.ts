import { type ArgsDef, type CommandDef, defineCommand, runCommand, showUsage } from 'citty'
import { name as packageName, version } from '../package.json'
import { reportError, usageError, validationError } from './errors'
import { closePrompts, log } from './log'
import { type ArgSpec, type CommandSpec, commands } from './spec'

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

/** A mistyped `--dryrun` on `clean` must not run the real thing. */
function assertKnownFlags(name: string, spec: CommandSpec, rawArgs: string[]): void {
  const known = new Set(['debug', 'help', ...Object.keys(spec.args)])
  for (const raw of rawArgs.slice(0, rawArgs.includes('--') ? rawArgs.indexOf('--') : undefined)) {
    if (!raw.startsWith('--')) continue
    const flag = toCamel(raw.slice(2).split('=')[0]!)
    const positive = flag.replace(/^no([A-Z])/, (_match, letter: string) => letter.toLowerCase())
    if (!known.has(flag) && !known.has(positive)) {
      throw usageError(`Unknown flag ${raw.split('=')[0]} for ${name}`, [`See i18n-micro ${name} --help`])
    }
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
      assertKnownFlags(name, spec, rawArgs)
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
    if (rawArgs.length === 0 || rawArgs.includes('--help') || rawArgs.includes('-h')) {
      const target = commands[rawArgs[0] ?? ''] ? toCommand(rawArgs[0]!, commands[rawArgs[0]!]!) : main
      await showUsage(target, target === main ? undefined : main)
      return
    }
    await runCommand(main, { rawArgs })
  } catch (error) {
    reportError(error, rawArgs.includes('--debug'))
  } finally {
    closePrompts()
  }
}
