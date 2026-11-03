import { type Interface, createInterface } from 'node:readline'
import { stripVTControlCharacters } from 'node:util'

let silent = false

const secrets = new Set<string>()

/** Anything printed from now on shows `***` instead. Shorter than a real key, it would only garble the text. */
export function addSecret(value: string | undefined): void {
  if (!value || value.length < 4) return
  secrets.add(value)
  secrets.add(encodeURIComponent(value))
}

/**
 * A URL up to its query, split around the last `@` there: one in the query is no part of the address.
 * Not a `.*` regex: that stops at a line end and leaves the password in the text.
 */
export function urlParts(url: string): { scheme: string; credentials?: string; host: string } {
  const end = url.search(/[?#;]/)
  const address = end === -1 ? url : url.slice(0, end)
  const at = address.lastIndexOf('@')
  if (at === -1) return { scheme: '', host: address }
  const slashes = address.indexOf('://')
  const start = slashes === -1 || slashes > at ? 0 : slashes + 3
  return { scheme: address.slice(0, start), credentials: address.slice(start, at), host: address.slice(at + 1) }
}

/** A URL somebody typed: what is after its path and before its host can be a key, whatever a server echoes back. */
export function addUrlSecrets(url: string | undefined): void {
  if (!url) return
  const [, ...tail] = url.split(/[?#;&]/)
  for (const pair of tail) addSecret(pair.slice(pair.indexOf('=') + 1))
  const { credentials } = urlParts(url)
  if (!credentials) return
  addSecret(credentials)
  const colon = credentials.indexOf(':')
  addSecret(colon === -1 ? credentials : credentials.slice(0, colon))
  if (colon !== -1) addSecret(credentials.slice(colon + 1))
}

const URL_CREDENTIALS = /(\/\/)[^/\s]+@/g

/** The address first and the longest secret first: a part replaced earlier would leave the rest of a longer one in view. */
const redact = (text: string): string =>
  [...secrets].sort((a, b) => b.length - a.length).reduce((out, secret) => out.replaceAll(secret, '***'), text.replace(URL_CREDENTIALS, '$1***@'))

const env = process.env

/** A live terminal: a pipe or a CI log gets no header, spinner or timing, so its text stays the same run after run. */
export const isInteractive = (stream: NodeJS.WriteStream = process.stdout): boolean => Boolean(stream.isTTY) && !env.CI

/** `hasColors` exists on terminals only, and answers NO_COLOR, FORCE_COLOR and TERM=dumb. */
const hasColors = (stream: NodeJS.WriteStream): boolean => Boolean(stream.isTTY && stream.hasColors?.())

/** The old Windows console has no glyphs for these; a pipe gets them always, so its text is the same on every OS. */
const unicode = !(process.platform === 'win32' && process.stdout.isTTY && !env.WT_SESSION && !env.TERM_PROGRAM)

/** The symbols of @clack/prompts, which nuxi prints its log lines with. */
export const symbols = unicode
  ? { info: '●', success: '◆', warn: '▲', error: '■', step: '◇', arrow: '→', frames: ['◒', '◐', '◓', '◑'] }
  : { info: '•', success: '*', warn: '!', error: 'x', step: 'o', arrow: '>', frames: ['|', '/', '-', '\\'] }

const SGR = {
  bold: [1, 22],
  dim: [2, 22],
  underline: [4, 24],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  gray: [90, 39],
  black: [30, 39],
  bgRed: [41, 49],
  bgYellow: [43, 49],
} as const
export type Style = keyof typeof SGR

/** Always styled: the writer strips it again for a stream without colors. */
export const style = (names: Style | Style[], text: string): string =>
  [names].flat().reduce((out, name) => `\u001B[${SGR[name][0]}m${out}\u001B[${SGR[name][1]}m`, text)

const indentLines = (text: string): string => text.replaceAll('\n', '\n  ')

/** Columns padded to the widest cell; the last one is not. The first is the subject, the third on is context. */
function columns(rows: string[][]): string[] {
  // ponytail: width by code units, East Asian wide characters misalign; a string-width table when that matters
  const widths = rows[0]?.map((_cell, index) => Math.max(...rows.map((row) => row[index]?.length ?? 0))) ?? []
  const tone = (index: number, cell: string): string => (index === 0 ? style('cyan', cell) : index >= 2 ? style('gray', cell) : cell)
  return rows.map((row) => row.map((cell, index) => tone(index, index === row.length - 1 ? cell : cell.padEnd(widths[index]!))).join('  '))
}

let frame = 0
let label = ''
let timer: ReturnType<typeof setInterval> | undefined
/** A frame is on the screen, on the line the next output would start on. */
let drawn = false

const drawSpinner = (): void => {
  const glyph = symbols.frames[frame++ % symbols.frames.length]!
  process.stderr.write(`\r\u001B[2K${hasColors(process.stderr) ? style('magenta', glyph) : glyph} ${label}...`)
  drawn = true
}

/** On stderr, and on a live terminal only: stdout stays clean for `--json` and pipes. */
export const spinner = {
  start(text: string): void {
    if (silent || !isInteractive(process.stderr)) return
    label = text
    timer ??= setInterval(drawSpinner, 80)
    timer.unref()
    drawSpinner()
  },
  update(text: string): void {
    label = text
  },
  /** Wipes the frame; the next tick draws it again under what was printed. */
  clear(): void {
    if (drawn) process.stderr.write('\r\u001B[2K')
    drawn = false
  },
  stop(): void {
    clearInterval(timer)
    timer = undefined
    spinner.clear()
  },
}

/** A line with a secret in it loses its colors: escapes between its characters would let the secret through. */
function write(stream: NodeJS.WriteStream, sink: (line: string) => void, text: string): void {
  const plain = stripVTControlCharacters(text)
  const safe = redact(plain)
  spinner.clear()
  sink(hasColors(stream) && safe === plain ? text : safe)
}

const out = (text: string): void => write(process.stdout, console.log, text)
const err = (text: string): void => write(process.stderr, console.error, text)

/** `4.2ms`, `420ms`, `4.20s`, `42.0s`, `4m 02s`: the precision nuxi gives its timings. */
export function formatDuration(ms: number): string {
  if (ms < 10) return `${ms.toFixed(1)}ms`
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 10_000) return `${(Math.floor(ms / 10) / 100).toFixed(2)}s`
  if (ms < 60_000) return `${(Math.floor(ms / 100) / 10).toFixed(1)}s`
  const total = Math.floor(ms / 1000)
  return `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, '0')}s`
}

/** The word for a count: `pick(1, 'was', 'were')`. */
export const pick = (count: number, one: string, many: string): string => (count === 1 ? one : many)

/** A count and its noun, in agreement: `1 key`, `2 keys`. */
export const plural = (count: number, one: string, many = `${one}s`): string => `${count} ${pick(count, one, many)}`

/** A table or a group was printed last: the line after it is a summary and stands apart. */
let afterBlock = false

const heading = (title: string, count?: number): string =>
  `\n${style('cyan', symbols.step)} ${style('bold', title)}${count === undefined ? '' : style('gray', ` (${count})`)}`

export const log = {
  setSilent(value: boolean): void {
    silent = value
  },
  /** A bare line, for text that is part of a block. */
  info(message: string): void {
    if (!silent) out(message)
  },
  /** A line of its own: what the command is doing or found. */
  note(message: string): void {
    if (!silent) out(`${log.gap()}${style('blue', symbols.info)} ${indentLines(message)}`)
  },
  success(message: string): void {
    if (!silent) out(`${log.gap()}${style('green', symbols.success)} ${indentLines(message)}`)
  },
  warn(message: string): void {
    err(`${log.gap()}${style('yellow', symbols.warn)} ${indentLines(message)}`)
  },
  /** A blank line when a group or a table came last, once. */
  gap(): string {
    const gap = afterBlock ? '\n' : ''
    afterBlock = false
    return gap
  },
  error(message: string): void {
    err(style('red', message))
  },
  /** Stderr as is: the error report builds its own lines. */
  raw(message: string): void {
    err(message)
  },
  /** Machine-readable output: not muted by `--logLevel silent`. */
  json(value: unknown): void {
    spinner.clear()
    console.log(redact(JSON.stringify(value, null, 2)))
  },
  section(title: string): void {
    log.info(heading(title))
  },
  rows(rows: Array<[label: string, value: string | number]>): void {
    const width = Math.max(0, ...rows.map(([label]) => label.length))
    // A value that brings its own colors keeps them.
    const tint = (value: string): string => (value.includes('\u001B') ? value : style('cyan', value))
    for (const [label, value] of rows) log.info(`  ${style('bold', `${label}:`.padEnd(width + 2))}${tint(String(value))}`)
    afterBlock = !silent
  },
  /** A titled group with its count; cells of a row are aligned as a table. */
  list(title: string, items: Array<string | string[]>): void {
    if (items.length === 0) return
    log.info(heading(title, items.length))
    const table = items.every((item) => Array.isArray(item))
    const lines = table ? columns(items as string[][]) : items.map((item) => [item].flat().join(' '))
    for (const line of lines) log.info(`  ${line}`)
    afterBlock = !silent
  },
}

let prompt: Interface | undefined
let lines: AsyncIterableIterator<string> | undefined

/**
 * One line of input. Closed stdin (CI, a pipe that ended) answers `null`, never hangs.
 *
 * A single reader for the whole run: readline buffers ahead, so a second one would miss
 * lines a pipe already delivered.
 */
export async function ask(question: string): Promise<string | null> {
  prompt ??= createInterface({ input: process.stdin, terminal: false })
  lines ??= prompt[Symbol.asyncIterator]()
  spinner.stop()
  process.stdout.write(`${question} `)
  const line = await lines.next()
  return line.done ? null : String(line.value).trim()
}

export function closePrompts(): void {
  prompt?.close()
  prompt = undefined
  lines = undefined
}

export async function confirm(question: string): Promise<boolean> {
  const answer = ((await ask(`${question} [y/N]`)) ?? '').toLowerCase()
  return answer === 'y' || answer === 'yes'
}

export async function choose(question: string, options: string[]): Promise<string | null> {
  for (const [index, option] of options.entries()) log.info(`  ${index + 1}. ${option}`)
  const answer = await ask(`${question} [1-${options.length}]`)
  return options[Number(answer) - 1] ?? null
}
