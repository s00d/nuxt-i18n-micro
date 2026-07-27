/**
 * Reading the generated documentation data.
 *
 * `docs/` deliberately knows nothing about the tooling package: `pnpm run docs:data`
 * writes plain JSON into `docs/.data/`, and every loader here reads only that. A docs
 * build therefore needs no TypeScript compiler, no TypeDoc and no SFC parser — and a
 * change to how the data is produced cannot break the site.
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const DATA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../.data')

/** Absolute path of a dataset, for a loader's `watch` list. */
export function dataFile(name: string): string {
  return join(DATA_DIR, `${name}.json`)
}

export function readData<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(dataFile(name), 'utf8')) as T
  } catch {
    // A missing file means `docs:data` has not run; an empty page beats a failed build.
    return fallback
  }
}

export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(1)} KB`
}
