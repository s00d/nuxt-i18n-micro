import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export type PublishFormat = 'esm' | 'cjs'

export interface ExportTarget {
  /** Subpath key from package.exports (e.g. "." or "./client/vue") */
  subpath: string
  /** import | require | default — which condition to resolve */
  condition?: 'import' | 'require' | 'default'
  formats?: PublishFormat[]
}

interface ResolvedExport {
  subpath: string
  condition: string
  filePath: string
  relPath: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** Resolve runtime file paths from package.json exports for smoke tests. */
export function resolveExportTargets(pkg: { exports?: unknown }, targets: ExportTarget[], packageRoot: string): ResolvedExport[] {
  const exportsMap = pkg.exports
  if (!isRecord(exportsMap)) {
    throw new Error('package.json has no exports map')
  }

  const resolved: ResolvedExport[] = []

  for (const target of targets) {
    const entry = exportsMap[target.subpath]
    if (!entry) throw new Error(`Missing exports[${JSON.stringify(target.subpath)}]`)

    const conditions = target.formats ? target.formats.map((f) => (f === 'cjs' ? 'require' : 'import')) : [target.condition ?? 'import']

    for (const condition of conditions) {
      const rel = resolveExportCondition(entry, condition)
      if (!rel) continue
      if (!/\.(?:mjs|cjs|js)$/.test(rel)) continue
      const filePath = resolve(packageRoot, rel.replace(/^\.\//, ''))
      resolved.push({ subpath: target.subpath, condition, filePath, relPath: rel })
    }
  }

  return resolved
}

function resolveExportCondition(entry: unknown, condition: string): string | null {
  if (typeof entry === 'string') {
    return condition === 'default' || condition === 'import' ? entry : null
  }
  if (!isRecord(entry)) return null

  const node = entry[condition]
  if (typeof node === 'string') return node
  if (isRecord(node) && typeof node.default === 'string') return node.default
  return null
}

export async function loadResolvedExport(item: ResolvedExport, packageRequire: NodeRequire): Promise<Record<string, unknown>> {
  if (!existsSync(item.filePath)) {
    throw new Error(`Missing built file for ${item.subpath} (${item.condition}): ${item.filePath}`)
  }

  if (item.condition === 'require' || item.filePath.endsWith('.cjs')) {
    return packageRequire(item.filePath) as Record<string, unknown>
  }

  return import(pathToFileURL(item.filePath).href) as Promise<Record<string, unknown>>
}

/** Load each export target; returns loaded modules keyed by "subpath:condition". */
export async function smokeLoadExports(
  packageRoot: string,
  pkg: { exports?: unknown },
  targets: ExportTarget[],
): Promise<Record<string, Record<string, unknown>>> {
  const packageRequire = createRequire(join(packageRoot, 'package.json'))
  const items = resolveExportTargets(pkg, targets, packageRoot)
  const entries = await Promise.all(
    items.map(async (item) => {
      const key = `${item.subpath}:${item.condition}`
      const mod = await loadResolvedExport(item, packageRequire)
      return [key, mod] as const
    }),
  )

  return Object.fromEntries(entries)
}

export function packageRootFromImportMeta(importMetaUrl: string, levelsUp = 2): string {
  return resolve(dirname(fileURLToPath(importMetaUrl)), ...Array.from({ length: levelsUp }, () => '..'))
}

export function getLoadedModule(mods: Record<string, Record<string, unknown>>, key: string): Record<string, unknown> {
  const mod = mods[key]
  if (!mod) throw new Error(`Missing loaded module for ${key}`)
  return mod
}
