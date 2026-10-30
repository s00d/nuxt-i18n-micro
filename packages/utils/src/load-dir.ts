import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'
import { storeLoadedTranslationFile, type TranslationFileBuckets } from './parse-path'

/**
 * The one reader of a locales directory. Node only: never import it from a browser or edge entry.
 * Every adapter that reads the disk (node, astro, vitepress, devtools, types) agrees on what a
 * file is: any `*.json` under the directory, symlinks followed; broken and non-object files are
 * reported and skipped; a missing directory warns and reads as empty.
 */

export interface TranslationFile {
  /** `/`-separated, relative to the directory: what `parseTranslationRelativePath` takes. */
  relativePath: string
  absolutePath: string
}

type Dictionary = Record<string, unknown>

/** A file that cannot be read as an entry (a link to itself) is reported; the walk goes on. */
function statOf(path: string) {
  try {
    return statSync(path, { throwIfNoEntry: false })
  } catch (error) {
    console.error(`[i18n] Failed to read: ${path}`, error)
    return undefined
  }
}

/** A folder that cannot be read is reported and costs its own files; the walk goes on. */
function readFolder(dir: string) {
  try {
    return { real: realpathSync(dir), names: readdirSync(dir) }
  } catch (error) {
    console.error(`[i18n] Failed to read directory: ${dir}`, error)
    return null
  }
}

/** `active` holds the real directories on the way down: a link back up ends, two links to one folder are two folders. */
function walk(dir: string, active: Set<string>, files: string[]): void {
  const folder = readFolder(dir)
  if (!folder || active.has(folder.real)) return
  const { real, names } = folder
  active.add(real)
  for (const name of names) {
    const path = join(dir, name)
    const stat = statOf(path)
    if (stat?.isDirectory()) walk(path, active, files)
    else if (stat && name.endsWith('.json')) files.push(path)
  }
  active.delete(real)
}

/** Every `*.json` under `dir`, sorted by relative path so a read does not depend on the file system's order. */
export function listTranslationFiles(directory: string): TranslationFile[] {
  const dir = resolve(directory)
  if (!existsSync(dir)) {
    console.warn(`[i18n] Translation directory not found: ${dir}`)
    return []
  }
  const paths: string[] = []
  walk(dir, new Set(), paths)
  return paths
    .map((absolutePath) => ({ absolutePath, relativePath: relative(dir, absolutePath).split(sep).join('/') }))
    .sort((a, b) => (a.relativePath < b.relativePath ? -1 : 1))
}

/** The dictionary in a file's text, `null` (reported) when it is not a JSON object. A BOM from an editor is fine. */
export function parseTranslationFile(text: string, path: string): Dictionary | null {
  try {
    const parsed: unknown = JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text)
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Dictionary
    console.error(`[i18n] Skipping translation file: ${path}: expected a JSON object`)
  } catch (error) {
    console.error(`[i18n] Failed to load translation file: ${path}`, error)
  }
  return null
}

function readSync(path: string): Dictionary | null {
  try {
    return parseTranslationFile(readFileSync(path, 'utf-8'), path)
  } catch (error) {
    console.error(`[i18n] Failed to load translation file: ${path}`, error)
    return null
  }
}

async function readAsync(path: string): Promise<Dictionary | null> {
  try {
    return parseTranslationFile(await readFile(path, 'utf-8'), path)
  } catch (error) {
    console.error(`[i18n] Failed to load translation file: ${path}`, error)
    return null
  }
}

function toBuckets<T extends Dictionary>(files: TranslationFile[], read: Array<Dictionary | null>, disablePageLocales: boolean) {
  const buckets: TranslationFileBuckets<T> = { root: {}, routes: {} }
  files.forEach((file, index) => {
    const dictionary = read[index]
    if (dictionary) storeLoadedTranslationFile(buckets, file.relativePath, dictionary as T, disablePageLocales)
  })
  return buckets
}

/** Reads listed files into root and route buckets. */
export function loadTranslationFiles<T extends Dictionary = Dictionary>(
  files: TranslationFile[],
  disablePageLocales = false,
): TranslationFileBuckets<T> {
  return toBuckets<T>(
    files,
    files.map((file) => readSync(file.absolutePath)),
    disablePageLocales,
  )
}

/** Reads `dir` into root and route buckets. */
export function loadTranslationDir<T extends Dictionary = Dictionary>(dir: string, disablePageLocales = false): TranslationFileBuckets<T> {
  return loadTranslationFiles<T>(listTranslationFiles(dir), disablePageLocales)
}

/**
 * {@link loadTranslationDir} for a running server: file contents are read without blocking it.
 * ponytail: the listing stays sync, about 11 ms per 400 files; an async walker if a locale tree ever outgrows that.
 */
export async function loadTranslationDirAsync<T extends Dictionary = Dictionary>(
  dir: string,
  disablePageLocales = false,
): Promise<TranslationFileBuckets<T>> {
  const files = listTranslationFiles(dir)
  return toBuckets<T>(files, await Promise.all(files.map((file) => readAsync(file.absolutePath))), disablePageLocales)
}

/** Whether `file` lies under `dir`, on any platform: `locales-old` is no part of `locales`. */
export function isInsideDir(file: string, dir: string): boolean {
  const root = dir.replace(/[\\/]+$/, '').replace(/\\/g, '/')
  return file.replace(/\\/g, '/').startsWith(`${root}/`)
}
