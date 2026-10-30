import { type Interface, createInterface } from 'node:readline'

let silent = false

const useColor = (stream: NodeJS.WriteStream): boolean => Boolean(stream.isTTY) && !process.env.NO_COLOR
const paint = (stream: NodeJS.WriteStream, code: number, text: string): string => (useColor(stream) ? `\u001B[${code}m${text}\u001B[39m` : text)

export const log = {
  setSilent(value: boolean): void {
    silent = value
  },
  info(message: string): void {
    if (!silent) console.log(message)
  },
  success(message: string): void {
    if (!silent) console.log(paint(process.stdout, 32, message))
  },
  warn(message: string): void {
    console.error(paint(process.stderr, 33, message))
  },
  error(message: string): void {
    console.error(paint(process.stderr, 31, message))
  },
  /** Machine-readable output: not muted by `--logLevel silent`. */
  json(value: unknown): void {
    console.log(JSON.stringify(value, null, 2))
  },
  section(title: string): void {
    log.info(`\n== ${title} ==`)
  },
  rows(rows: Array<[label: string, value: string | number]>, indent = ''): void {
    const width = Math.max(0, ...rows.map(([label]) => label.length))
    for (const [label, value] of rows) log.info(`${indent}${`${label}:`.padEnd(width + 2)}${value}`)
  },
  list(title: string, items: string[]): void {
    if (items.length === 0) return
    log.info(`\n${title}:`)
    for (const item of items) log.info(`  - ${item}`)
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
  return /^y(es)?$/i.test((await ask(`${question} [y/N]`)) ?? '')
}

export async function choose(question: string, options: string[]): Promise<string | null> {
  for (const [index, option] of options.entries()) log.info(`  ${index + 1}. ${option}`)
  const answer = await ask(`${question} [1-${options.length}]`)
  return options[Number(answer) - 1] ?? null
}
