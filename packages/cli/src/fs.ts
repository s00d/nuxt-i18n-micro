import { randomBytes } from 'node:crypto'
import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { CliError } from './errors'
import type { JsonObject } from './json'

const SKIPPED_DIRS = new Set(['node_modules', '.git', '.nuxt', '.output'])

/** Every file under `dir` that `accept` wants, sorted. A missing directory is an empty result. */
export function walkFiles(dir: string, accept: (path: string) => boolean = () => true, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory() && !SKIPPED_DIRS.has(entry.name)) walkFiles(full, accept, out)
    if (entry.isFile() && accept(full)) out.push(full)
  }
  return out.sort()
}

const tempName = (path: string): string => join(dirname(path), `.${basename(path)}.${randomBytes(4).toString('hex')}.tmp`)

/**
 * Write a set of files all-or-nothing as far as a filesystem allows.
 *
 * Everything lands in temp files first, so a full disk or a bad path fails before the first
 * real file changes, and each rename is atomic. A crash can only stop between two renames,
 * leaving whole old and whole new files, never a truncated one.
 */
export function writeFilesAtomic(files: Array<[path: string, content: string | Buffer]>): void {
  const pending: Array<[temp: string, target: string]> = []
  try {
    for (const [path, content] of files) {
      mkdirSync(dirname(path), { recursive: true })
      const temp = tempName(path)
      pending.push([temp, path])
      writeFileSync(temp, content)
      if (existsSync(path)) chmodSync(temp, statSync(path).mode)
    }
  } catch (error) {
    for (const [temp] of pending) rmSync(temp, { force: true })
    throw error
  }
  for (const [temp, target] of pending) renameSync(temp, target)
}

export const writeFileAtomic = (path: string, content: string | Buffer): void => writeFilesAtomic([[path, content]])

export const stringifyJson = (value: unknown, indent = 2): string => `${JSON.stringify(value, null, indent)}\n`

export const writeJson = (path: string, value: unknown): void => writeFileAtomic(path, stringifyJson(value))

/**
 * Read a JSON object strictly.
 *
 * A broken file must stop the command: treating it as empty is how the next save would
 * replace somebody's translations with `{}`.
 */
export function readJsonObject(path: string): JsonObject {
  const content = readFileSync(path, 'utf8')
  if (content.trim() === '') return {}
  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch (error) {
    throw new CliError(`Invalid JSON in ${path}`, { code: 'INVALID_JSON', details: { Reason: String((error as Error).message) }, cause: error })
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new CliError(`Expected a JSON object in ${path}`, { code: 'INVALID_JSON' })
  }
  return parsed as JsonObject
}

export const readJsonIfExists = (path: string): JsonObject => (existsSync(path) ? readJsonObject(path) : {})
