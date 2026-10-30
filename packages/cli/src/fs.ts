import { randomBytes } from 'node:crypto'
import {
  accessSync,
  chmodSync,
  constants,
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
import { type JsonObject, findDuplicateKey, findUnsafeInteger, hasProtoKey } from './json'

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

export interface WriteOptions {
  /** The old content does not matter: it is replaced, not edited. */
  overwrite?: boolean
}

/** A rename needs only the directory, so it would replace a file somebody made read-only. */
function assertWritable(target: string): void {
  try {
    if (existsSync(target)) accessSync(target, constants.W_OK)
  } catch (error) {
    throw new CliError(`Permission denied: ${target}`, { code: 'PERMISSION_DENIED', cause: error })
  }
}

/** The tail of `tempName`. Anything else with a similar name is somebody else's. */
const TEMP_SUFFIX = /^[0-9a-f]{8}\.tmp$/

/** What a killed run left next to `target`. */
function clearStaleTemps(target: string): void {
  const prefix = `.${basename(target)}.`
  for (const name of readdirSync(dirname(target))) {
    if (name.startsWith(prefix) && TEMP_SUFFIX.test(name.slice(prefix.length))) rmSync(join(dirname(target), name), { force: true })
  }
}

function writeTemps(files: Array<[path: string, content: string | Buffer]>, options: WriteOptions): Array<[temp: string, target: string]> {
  const pending: Array<[temp: string, target: string]> = []
  for (const [path] of files) {
    const target = realTarget(path)
    assertWritable(target)
    // The one place a file gets replaced, so the one place its bytes matter. Reading never stops here.
    if (!options.overwrite && statOf(target)?.isFile()) readUtf8(target)
  }
  try {
    for (const [path, content] of files) {
      const target = realTarget(path)
      mkdirSync(dirname(target), { recursive: true })
      clearStaleTemps(target)
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
 * Everything lands in temp files first, so a full disk, a bad path or a read-only file fails
 * before the first real file changes. A rename that fails later puts back what the earlier ones
 * replaced. Only killing the process between two renames can leave a mix, of whole files, and
 * the next save clears its temp files.
 */
/** Hard links share an inode: a rename would leave the other name behind with the old text. */
function commit(temp: string, target: string): void {
  if ((statOf(target)?.nlink ?? 1) > 1) {
    writeFileSync(target, readFileSync(temp))
    rmSync(temp, { force: true })
  } else renameSync(temp, target)
}

/** Through a temp file too: a target that turned read-only must not stop the rollback. */
function restore(target: string, original: Buffer | null): void {
  if (!original) {
    rmSync(target, { force: true })
    return
  }
  const temp = tempName(target)
  writeFileSync(temp, original)
  chmodSync(temp, statSync(target).mode)
  commit(temp, target)
}

export function writeFilesAtomic(files: Array<[path: string, content: string | Buffer]>, options: WriteOptions = {}): void {
  const pending = writeTemps(files, options)
  const originals: Array<Buffer | null> = []
  let done = 0
  try {
    for (const [, target] of pending) originals.push(statOf(target)?.isFile() ? readFileSync(target) : null)
    for (; done < pending.length; done += 1) commit(pending[done]![0], pending[done]![1])
  } catch (error) {
    for (const [temp] of pending) rmSync(temp, { force: true })
    for (let index = 0; index < done; index += 1) restore(pending[index]![1], originals[index]!)
    throw error
  }
}

export const writeFileAtomic = (path: string, content: string | Buffer): void => writeFilesAtomic([[path, content]])

export const stringifyJson = (value: unknown, indent: number | string = 2): string => `${JSON.stringify(value, null, indent)}\n`

/** JSON text has no raw newline in a string, so every one of them is a line ending. */
export const matchLineEnding = (previous: string | undefined, text: string): string =>
  previous?.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text

/** Saved the way the file was written, so an edit shows up as an edit and not as a whole-file diff. */
export function stringifyLike(previous: string | undefined, value: unknown): string {
  const text = stringifyJson(value, /^([ \t]+)"/m.exec(previous ?? '')?.[1] ?? 2)
  return matchLineEnding(previous, previous && !previous.endsWith('\n') ? text.trimEnd() : text)
}

/** Text that survives a save. Bytes that are not UTF-8 would come back as replacement characters. */
export function readUtf8(path: string): string {
  const raw = readFileSync(path)
  const text = raw.toString('utf8')
  if (!Buffer.from(text).equals(raw)) throw new CliError(`${path} is not valid UTF-8: a save would corrupt it.`, { code: 'INVALID_ENCODING' })
  return text
}

/** For what is only read: a stray byte in a data file or a locale file costs nothing until a save. */
export const readLoose = (path: string): string => readFileSync(path, 'utf8').replace(/^\uFEFF/, '')

/** A BOM comes from Windows editors and Excel; `JSON.parse` stops at it. */
export const readText = (path: string): string => readUtf8(path).replace(/^\uFEFF/, '')

/**
 * Read a JSON object strictly.
 *
 * A broken file must stop the command: treating it as empty is how the next save would
 * replace somebody's translations with `{}`.
 */
export function readJsonObject(path: string, options: { private?: boolean } = {}): JsonObject {
  const content = readLoose(path)
  if (content.trim() === '') return {}
  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch (error) {
    // The parser quotes the text around the error: in a file with credentials, that may be one.
    const details: Record<string, string> = options.private ? {} : { Reason: String((error as Error).message) }
    throw new CliError(`Invalid JSON in ${path}`, { code: 'INVALID_JSON', details, cause: options.private ? undefined : error })
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new CliError(`Expected a JSON object in ${path}`, { code: 'INVALID_JSON' })
  }
  const duplicate = findDuplicateKey(content)
  if (duplicate !== null) throw new CliError(`Duplicate key in ${path}: ${duplicate}`, { code: 'INVALID_JSON' })
  if (content.includes('"__proto__"') && hasProtoKey(parsed as JsonObject)) {
    throw new CliError(`A key called __proto__ in ${path} would be lost on a save.`, { code: 'INVALID_JSON' })
  }
  const unsafe = findUnsafeInteger(parsed as JsonObject)
  if (unsafe !== null)
    throw new CliError(`Integer too large in ${path}: ${unsafe}. A save would change it; store it as a string.`, { code: 'INVALID_JSON' })
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
