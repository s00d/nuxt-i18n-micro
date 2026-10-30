import { randomBytes } from 'node:crypto'
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import type { Stats } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { CliError } from './errors'
import type { JsonObject } from './json'

const SKIPPED_DIRS = new Set(['node_modules', '.git', '.nuxt', '.output'])

const statOf = (path: string): Stats | undefined => {
  try {
    return statSync(path, { throwIfNoEntry: false })
  } catch {
    return undefined // a symlink loop
  }
}

function visit(dir: string, accept: (path: string) => boolean, skipDir: (path: string) => boolean, seen: Set<string>, out: string[]): void {
  const real = realpathSync(dir)
  if (seen.has(real)) return
  seen.add(real)
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    const stat = entry.isSymbolicLink() ? statOf(full) : entry
    if (stat?.isDirectory() && !skipDir(full)) visit(full, accept, skipDir, seen, out)
    else if (stat?.isFile() && accept(full)) out.push(full)
  }
}

/** Every file under `dir` that `accept` wants, sorted, symlinks followed. A missing directory is an empty result. */
export function walkFiles(
  dir: string,
  accept: (path: string) => boolean = () => true,
  skipDir: (path: string) => boolean = (path) => SKIPPED_DIRS.has(basename(path)),
): string[] {
  const out: string[] = []
  if (statOf(dir)?.isDirectory()) visit(dir, accept, skipDir, new Set(), out)
  return out.sort()
}

/** Where a write has to land: replacing a symlink with a file would silently unshare it. */
function realTarget(path: string): string {
  if (existsSync(path)) return realpathSync(path)
  return lstatSync(path, { throwIfNoEntry: false })?.isSymbolicLink() ? resolve(dirname(path), readlinkSync(path)) : path
}

const tempName = (path: string): string => join(dirname(path), `.${basename(path)}.${randomBytes(4).toString('hex')}.tmp`)

function writeTemps(files: Array<[path: string, content: string | Buffer]>): Array<[temp: string, target: string]> {
  const pending: Array<[temp: string, target: string]> = []
  try {
    for (const [path, content] of files) {
      const target = realTarget(path)
      mkdirSync(dirname(target), { recursive: true })
      const temp = tempName(target)
      pending.push([temp, target])
      writeFileSync(temp, content)
      if (existsSync(target)) chmodSync(temp, statSync(target).mode)
    }
  } catch (error) {
    for (const [temp] of pending) rmSync(temp, { force: true })
    throw error
  }
  return pending
}

/**
 * Write a set of files all-or-nothing.
 *
 * Everything lands in temp files first, so a full disk or a bad path fails before the first
 * real file changes. A rename that fails later puts back what the earlier ones replaced. Only
 * killing the process between two renames can leave a mix, and then of whole files.
 */
export function writeFilesAtomic(files: Array<[path: string, content: string | Buffer]>): void {
  const pending = writeTemps(files)
  const originals: Array<Buffer | null> = []
  let done = 0
  try {
    for (const [, target] of pending) originals.push(existsSync(target) ? readFileSync(target) : null)
    for (; done < pending.length; done += 1) renameSync(pending[done]![0], pending[done]![1])
  } catch (error) {
    for (const [temp] of pending) rmSync(temp, { force: true })
    for (let index = 0; index < done; index += 1) {
      const original = originals[index]
      if (original) writeFileSync(pending[index]![1], original)
      else rmSync(pending[index]![1], { force: true })
    }
    throw error
  }
}

export const writeFileAtomic = (path: string, content: string | Buffer): void => writeFilesAtomic([[path, content]])

export const stringifyJson = (value: unknown, indent: number | string = 2): string => `${JSON.stringify(value, null, indent)}\n`

/** Saved the way the file was written, so an edit shows up as an edit and not as a whole-file diff. */
export function stringifyLike(previous: string | undefined, value: unknown): string {
  const text = stringifyJson(value, /^([ \t]+)"/m.exec(previous ?? '')?.[1] ?? 2)
  return previous && !previous.endsWith('\n') ? text.trimEnd() : text
}

/** A BOM comes from Windows editors and Excel; `JSON.parse` stops at it. */
export const readText = (path: string): string => readFileSync(path, 'utf8').replace(/^﻿/, '')

/**
 * Read a JSON object strictly.
 *
 * A broken file must stop the command: treating it as empty is how the next save would
 * replace somebody's translations with `{}`.
 */
export function readJsonObject(path: string): JsonObject {
  const content = readText(path)
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

/** `tests/**`, `*.spec.ts`. A glob without a slash matches at any depth. */
export function globToRegExp(glob: string): RegExp {
  const source = (glob.includes('/') ? glob : `**/${glob}`)
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '\u0000')
    .replace(/\*\*/g, '\u0001')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replaceAll('\u0000', '(?:.*/)?')
    .replaceAll('\u0001', '.*')
  return new RegExp(`^${source}(?:/.*)?$`)
}

export const splitList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
