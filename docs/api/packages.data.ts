/**
 * The exported API of every workspace package, read from the committed API snapshots.
 *
 * The snapshots in `scripts/api-surface/` already exist as the input to
 * `pnpm run api:surface`, which compares them against the TypeScript sources. Reading
 * them here means the reference pages and the release gate cannot disagree: they are the
 * same file.
 */
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { defineLoader } from 'vitepress'
import { indexSnapshot } from '../../scripts/src/utils/api-surface'

export interface ApiExport {
  name: string
  kind: string
  signature: string
  members: { name: string; signature: string }[]
}

export interface ApiEntryPoint {
  /** Import specifier a consumer writes, e.g. `@i18n-micro/utils/deep-merge`. */
  specifier: string
  exports: ApiExport[]
}

export interface ApiPackage {
  name: string
  /** Slug used by the dynamic route, e.g. `core`. */
  slug: string
  entryPoints: ApiEntryPoint[]
  exportCount: number
}

export interface PackagesData {
  packages: ApiPackage[]
}

declare const data: PackagesData
export { data }

/** `i18n-micro__core.api.txt` -> `@i18n-micro/core`. */
function packageNameOf(file: string): string {
  return `@${basename(file).replace(/\.api\.txt$/, '').replace('__', '/')}`
}

export function parseSnapshot(name: string, text: string): ApiPackage {
  const index = indexSnapshot(text)
  const bySubpath = new Map<string, Map<string, ApiExport>>()

  // Members arrive as `Owner.member`; fold them under the export they belong to so the
  // page can show a class as one entry with its methods, not as thirty siblings.
  const sorted = [...index].sort(([a], [b]) => a.localeCompare(b))

  for (const [key, value] of sorted) {
    const separator = key.indexOf(' ')
    const subpath = key.slice(0, separator)
    const path = key.slice(separator + 1)
    const kindSeparator = value.indexOf(' ')
    const kind = value.slice(0, kindSeparator)
    const signature = value.slice(kindSeparator + 1).trim()

    const entry = bySubpath.get(subpath) ?? new Map<string, ApiExport>()
    bySubpath.set(subpath, entry)

    if (kind !== 'member') {
      entry.set(path, { name: path, kind, signature, members: entry.get(path)?.members ?? [] })
      continue
    }

    const owner = path.slice(0, path.indexOf('.'))
    const existing = entry.get(owner) ?? { name: owner, kind: 'unknown', signature: '', members: [] }
    existing.members.push({ name: path.slice(path.indexOf('.') + 1), signature })
    entry.set(owner, existing)
  }

  const entryPoints: ApiEntryPoint[] = [...bySubpath]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([subpath, exports]) => ({
      specifier: `${name}${subpath === '.' ? '' : subpath.slice(1)}`,
      exports: [...exports.values()].sort((a, b) => a.name.localeCompare(b.name)),
    }))

  return {
    name,
    slug: name.replace('@i18n-micro/', ''),
    entryPoints,
    exportCount: entryPoints.reduce((sum, entry) => sum + entry.exports.length, 0),
  }
}

export default defineLoader({
  watch: ['../../scripts/api-surface/*.api.txt'],
  load(files: string[]): PackagesData {
    const packages = files
      .filter((file) => file.endsWith('.api.txt'))
      .map((file) => parseSnapshot(packageNameOf(file), readFileSync(file, 'utf8')))
      .sort((a, b) => a.name.localeCompare(b.name))

    return { packages }
  },
})
