import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
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

/** `active` holds the real directories on the way down: a link back up ends, two links to one folder are two folders. */
function walk(dir: string, active: Set<string>, files: string[]): void {
  const real = realpathSync(dir)
  if (active.has(real)) return
  active.add(real)
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    const stat = statOf(path)
    if (stat?.isDirectory()) walk(path, active, files)
    else if (stat && name.endsWith('.json')) files.push(path)
  }
  active.delete(real)
}

/** Every `*.json` under `dir`, sorted by relative path so a read does not depend on the file system's order. */
export function listTranslationFiles(dir: string): TranslationFile[] {
  if (!existsSync(dir)) {
    console.warn(`[i18n] Translation directory not found: ${dir}`)
    return []
  }
  const paths: string[] = []
  try {
    walk(dir, new Set(), paths)
  } catch (error) {
    console.error(`[i18n] Failed to read directory: ${dir}`, error)
  }
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

/** Reads `dir` into root and route buckets. */
export function loadTranslationDir<T extends Dictionary = Dictionary>(dir: string, disablePageLocales = false): TranslationFileBuckets<T> {
  const files = listTranslationFiles(dir)
  return toBuckets<T>(
    files,
    files.map((file) => readSync(file.absolutePath)),
    disablePageLocales,
  )
}

/** {@link loadTranslationDir} for a running server: file contents are read without blocking it. */
export async function loadTranslationDirAsync<T extends Dictionary = Dictionary>(
  dir: string,
  disablePageLocales = false,
): Promise<TranslationFileBuckets<T>> {
  const files = listTranslationFiles(dir)
  return toBuckets<T>(files, await Promise.all(files.map((file) => readAsync(file.absolutePath))), disablePageLocales)
}
