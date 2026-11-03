import { style } from './log'
import { type ArgSpec, COMMAND_GROUPS, type CommandSpec, commands } from './spec'

/** The layout of citty's `renderUsage`, as nuxi prints it, with commands grouped and examples added. */

const BIN = 'i18n-micro'

const title = (text: string): string => style(['underline', 'bold'], text)

/** Two columns, the first padded to the widest: `pad` first, colors after, or the escapes count as width. */
function table(rows: Array<[string, string]>): string[] {
  const width = Math.max(0, ...rows.map(([left]) => left.length))
  return rows.map(([left, right]) => `  ${style('cyan', left.padEnd(width))}    ${right}`)
}

/** Flags every command has: listed after the ones of the command. */
const COMMON = new Set(['cwd', 'logLevel', 'debug'])

function flag(name: string, arg: ArgSpec): string {
  const names = [...(arg.alias ? [`-${arg.alias}`] : []), `--${name}`].join(', ')
  if (arg.type === 'boolean') return names
  return `${names} <${arg.values ? arg.values.join('|') : arg.numeric ? 'n' : 'value'}>`
}

function describe(arg: ArgSpec): string {
  const fallback = arg.defaultHint?.replaceAll('`', '') ?? (arg.default === undefined || arg.default === false ? undefined : String(arg.default))
  const notes = [arg.required ? '(Required)' : '', fallback === undefined ? '' : `(Default: ${fallback})`].filter(Boolean).join(' ')
  return notes ? `${arg.description} ${style('gray', notes)}` : arg.description
}

export function rootUsage(version: string): string {
  const width = Math.max(...Object.keys(commands).map((name) => name.length))
  const groups = COMMAND_GROUPS.flatMap((group) => {
    const rows = Object.entries(commands).filter(([, spec]) => spec.group === group)
    return ['', `  ${style('bold', group)}`].concat(rows.map(([name, spec]) => `    ${style('cyan', name.padEnd(width))}    ${spec.description}`))
  })
  return [
    style('gray', `Command-line tools for nuxt-i18n-micro (${BIN} v${version})`),
    '',
    `${title('USAGE')} ${style('cyan', `${BIN} <command> [OPTIONS]`)}`,
    '',
    title('COMMANDS'),
    ...groups,
    '',
    `Use ${style('cyan', `${BIN} <command> --help`)} for more information about a command.`,
  ].join('\n')
}

export function commandUsage(name: string, spec: CommandSpec, version: string): string {
  const entries = Object.entries(spec.args)
  const positionals = entries.filter(([, arg]) => arg.type === 'positional')
  const options = entries.filter(([, arg]) => arg.type !== 'positional').sort(([a], [b]) => Number(COMMON.has(a)) - Number(COMMON.has(b)))
  const usage = [`${BIN} ${name}`, options.length > 0 ? '[OPTIONS]' : '']
  for (const [arg, { required }] of positionals) usage.push(required ? `<${arg.toUpperCase()}>` : `[${arg.toUpperCase()}]`)
  for (const [arg, option] of options) if (option.required) usage.push(flag(arg, option))
  const optionRows = options.flatMap(([arg, option]): Array<[string, string]> => {
    const row: [string, string] = [flag(arg, option), describe(option)]
    // Only a flag that is on by default needs its negation spelled out.
    return option.type === 'boolean' && option.default === true ? [row, [`--no-${arg}`, `Turn --${arg} off`]] : [row]
  })
  const section = (heading: string, lines: string[]): string[] => (lines.length > 0 ? [title(heading), '', ...lines, ''] : [])
  return [
    style('gray', `${spec.description} (${BIN} ${name} v${version})`),
    '',
    `${title('USAGE')} ${style('cyan', usage.filter(Boolean).join(' '))}`,
    '',
    ...section('ARGUMENTS', table(positionals.map(([arg, option]) => [arg.toUpperCase(), describe(option)]))),
    ...section('OPTIONS', table(optionRows)),
    ...section(
      'EXAMPLES',
      (spec.examples ?? []).map((example) => `  ${style('gray', '$')} ${example}`),
    ),
  ]
    .join('\n')
    .trimEnd()
}
