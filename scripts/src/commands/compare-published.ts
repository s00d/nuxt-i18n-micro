import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { defineCommand } from 'citty'
import { assertBaseResolvable, changedPackageNames, listWorkspacePackages, resolveBase } from '../utils/git-baseline'
import { walkFiles } from '../utils/fs-walk'
import { type ExportEntry, type PackageManifest, isExportMap, parseManifest } from '../utils/manifest'
import { repoRoot } from '../utils/workspace'

const execFileAsync = promisify(execFile)

/** One package's line in the report. Exported: it is the `--json` contract. */
export interface ComparisonEntry {
  name: string
  localVersion: string
  npmVersion: string | null
  errors: string[]
  warnings: string[]
  info: string[]
}

export interface ComparePublishedReport {
  results: ComparisonEntry[]
  errorCount: number
}

export interface NpmLatestMeta {
  version: string
  tarball: string
}

export type NpmLatestLookup = { ok: true; meta: NpmLatestMeta | null } | { ok: false; error: string }

export type NpmLatestLookupMap = Map<string, NpmLatestLookup>

async function runAsync(cmd: string, args: string[], options: { cwd?: string } = {}): Promise<string> {
  const { stdout } = await execFileAsync(cmd, args, {
    cwd: options.cwd ?? repoRoot,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  })
  return stdout.toString().trim()
}

/**
 * Paths that would land in the published tarball, without calling `npm pack`.
 *
 * `npm pack` was ~6s/package here; walking `files` + npm's always-included root
 * docs is sub-millisecond and matches this workspace (no `.npmignore`).
 */
export function listLocalPackPaths(dir: string, pkg: PackageManifest): string[] {
  const out = new Set<string>(['package.json'])

  for (const name of readdirSync(dir)) {
    if (!/^(readme|licen[cs]e)(\.|$)/i.test(name)) continue
    try {
      if (statSync(join(dir, name)).isFile()) out.add(name)
    } catch {
      // vanished between readdir and stat
    }
  }

  for (const entry of pkg.files ?? []) {
    if (typeof entry !== 'string' || entry.startsWith('!')) continue
    const rel = entry.replace(/^\.\//, '').replace(/\/$/, '')
    if (!rel) continue
    const abs = join(dir, rel)
    if (!existsSync(abs)) continue
    const st = statSync(abs)
    if (st.isFile()) {
      out.add(rel)
      continue
    }
    if (!st.isDirectory()) continue
    for (const file of walkFiles(abs, { skipDirs: new Set(['node_modules', '.git']) })) {
      out.add(`${rel}/${file}`)
    }
  }

  return [...out].sort()
}

function registryLatestUrl(name: string): string {
  const scoped = name.startsWith('@') ? `${name.slice(0, name.indexOf('/'))}%2F${name.slice(name.indexOf('/') + 1)}` : encodeURIComponent(name)
  return `https://registry.npmjs.org/${scoped}/latest`
}

async function fetchNpmLatest(name: string): Promise<NpmLatestMeta | null> {
  const res = await fetch(registryLatestUrl(name), {
    headers: { accept: 'application/json' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`registry ${name}: HTTP ${res.status}`)
  const body = (await res.json()) as { version?: string; dist?: { tarball?: string } }
  if (!body.version || !body.dist?.tarball) return null
  return { version: body.version, tarball: body.dist.tarball }
}

/** One registry round-trip phase for every package name (npm has no multi-package latest API). */
export async function fetchNpmLatestBulk(names: readonly string[]): Promise<NpmLatestLookupMap> {
  const entries = await Promise.all(
    names.map(async (name): Promise<[string, NpmLatestLookup]> => {
      try {
        return [name, { ok: true, meta: await fetchNpmLatest(name) }]
      } catch (error) {
        return [name, { ok: false, error: error instanceof Error ? error.message : String(error) }]
      }
    }),
  )
  return new Map(entries)
}

async function listTarballPaths(tarball: string): Promise<string[]> {
  const listing = await runAsync('tar', ['-tzf', tarball])
  return listing
    .split('\n')
    .filter(Boolean)
    .map((p) => p.replace(/\\/g, '/'))
    .map((p) => (p.startsWith('package/') ? p.slice('package/'.length) : p))
    .filter((p) => p && p !== 'package')
}

async function readPackedManifest(tarball: string): Promise<PackageManifest> {
  const extractDir = mkdtempSync(join(tmpdir(), 'i18n-compare-manifest-'))
  try {
    await runAsync('tar', ['-xzf', tarball, '-C', extractDir, 'package/package.json'])
    return parseManifest(readFileSync(join(extractDir, 'package/package.json'), 'utf8'))
  } finally {
    rmSync(extractDir, { recursive: true, force: true })
  }
}

async function downloadTarball(url: string, destFile: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download ${url}: HTTP ${res.status}`)
  writeFileSync(destFile, Buffer.from(await res.arrayBuffer()))
}

function cacheKey(name: string): string {
  return name.replace('@', '').replace('/', '__')
}

async function resolveRefTarball(name: string, meta: NpmLatestMeta, cacheRoot: string, skipDownload: boolean): Promise<string> {
  const key = cacheKey(name)
  const refDir = join(cacheRoot, key, `npm-${meta.version}`)
  if (skipDownload && existsSync(join(refDir, '.done'))) {
    const cached = readdirSync(refDir).filter((f: string) => f.endsWith('.tgz'))
    return join(refDir, cached[0]!)
  }
  rmSync(refDir, { recursive: true, force: true })
  mkdirSync(refDir, { recursive: true })
  const refTarball = join(refDir, `${key}-${meta.version}.tgz`)
  await downloadTarball(meta.tarball, refTarball)
  writeFileSync(join(refDir, '.done'), refTarball)
  return refTarball
}

function collectExportTypePaths(value: ExportEntry | undefined, out: string[] = []): string[] {
  if (typeof value === 'string') {
    if (/\.d\.(?:ts|cts|mts)$/.test(value)) out.push(value.replace(/^\.\//, ''))
    return out
  }
  if (Array.isArray(value)) {
    for (const item of value) collectExportTypePaths(item, out)
    return out
  }
  if (!isExportMap(value)) return out
  if (typeof value.types === 'string') out.push(value.types.replace(/^\.\//, ''))
  for (const child of Object.values(value)) collectExportTypePaths(child, out)
  return out
}

const HASHED_CHUNK_RE = /^(?:base-strategy|common)-[A-Za-z0-9_-]{6,}\.(?:js|cjs|mjs)$/
const DIST_RUNTIME_RE = /^dist\/[^/]+\.(?:mjs|cjs|js)$/

function checkLocalPackaging(entry: ComparisonEntry, name: string, localPaths: string[]): void {
  const hashedInLocal = localPaths
    .filter((p) => p.startsWith('dist/'))
    .map((p) => p.replace(/^dist\//, ''))
    .filter((n) => HASHED_CHUNK_RE.test(n))
  if (hashedInLocal.length) {
    entry.errors.push(`hashed chunks in local dist: ${hashedInLocal.join(', ')}`)
  }

  if (name === '@i18n-micro/astro') {
    const clientCjs = localPaths.filter((p) => /^dist\/client\/.*\.cjs$/.test(p))
    if (clientCjs.length) {
      entry.errors.push(`astro client CJS artifacts in pack: ${clientCjs.join(', ')}`)
    }
  }
}

function compareAgainstPublished(
  entry: ComparisonEntry,
  localPaths: string[],
  localPkg: PackageManifest,
  localVersion: string,
  meta: NpmLatestMeta,
  refPaths: string[],
  refPkg: PackageManifest,
): void {
  entry.npmVersion = meta.version

  const refSet = new Set(refPaths)
  const localSet = new Set(localPaths)
  const onlyRef = [...refSet].filter((p) => !localSet.has(p))
  const onlyLocal = [...localSet].filter((p) => !refSet.has(p))

  for (const f of onlyRef.filter((p) => DIST_RUNTIME_RE.test(p))) {
    entry.warnings.push(`removed dist runtime: ${f}`)
  }
  for (const f of onlyLocal.filter((p) => DIST_RUNTIME_RE.test(p))) {
    entry.warnings.push(`added dist runtime: ${f}`)
  }

  const refTypes = new Set(collectExportTypePaths(refPkg.exports))
  const localTypes = new Set(collectExportTypePaths(localPkg.exports))
  for (const t of localTypes) {
    const baseName = t.split('/').pop() ?? t
    const refMatch = [...refTypes].find((r) => r === t || r.endsWith(`/${baseName}`) || r.endsWith(baseName))
    if (!refMatch && refTypes.size > 0) {
      entry.info.push(`new types export path: ${t}`)
    } else if (refMatch && refMatch !== t) {
      entry.warnings.push(`types path changed: ${refMatch} → ${t}`)
    }
  }
  for (const t of refTypes) {
    if (!localTypes.has(t) && !localPaths.includes(t)) {
      entry.warnings.push(`types path removed from exports: ${t}`)
    }
  }

  if (localVersion !== meta.version) {
    entry.info.push(`version bump ${meta.version} → ${localVersion}`)
  }

  if (localPkg.exports && !refPkg.exports) {
    entry.info.push('local package.json adds exports field')
  }

  const refDcts = refPaths.filter((p) => p.endsWith('.d.cts'))
  const localDcts = localPaths.filter((p) => p.endsWith('.d.cts'))
  if (localDcts.length > refDcts.length) {
    entry.info.push(`added ${localDcts.length - refDcts.length} .d.cts file(s) for require types`)
  }

  if (onlyRef.length > 0 || onlyLocal.length > 0) {
    entry.info.push(`tarball diff: +${onlyLocal.length} / -${onlyRef.length} paths`)
  }
}

export const comparePublishedCommand = defineCommand({
  meta: {
    name: 'compare-published',
    description: [
      'Compare local publishable files with the latest published version on npm.',
      '',
      'Local side walks package `files` (no `npm pack`). Remote side bulk-fetches',
      'registry metadata, then downloads reference tarballs in parallel.',
      '',
      'Only local-pack problems fail the run (hashed chunks in dist, astro client CJS);',
      'differences against the published version are reported as warnings. Hence',
      '`--local-only`, which keeps the gates but needs no network — that is what PRs use.',
      '',
      'Examples:',
      '  pnpm -C scripts cli compare-published',
      '  pnpm -C scripts cli compare-published --json',
      '  pnpm -C scripts cli compare-published --package path-strategy',
      '  pnpm -C scripts cli compare-published --local-only --changed-only',
    ].join('\n'),
  },
  args: {
    json: { type: 'boolean', default: false, description: 'Print machine-readable output' },
    localOnly: { type: 'boolean', default: false, description: 'Skip the npm comparison; keep the local packaging gates' },
    skipDownload: { type: 'boolean', default: false, description: 'Reuse previously downloaded npm tarballs' },
    changedOnly: { type: 'boolean', default: false, description: 'Only inspect packages changed since the baseline' },
    base: { type: 'string', description: 'Baseline ref for --changed-only' },
    package: { type: 'string', description: 'Inspect a single package by directory name' },
  },
  async setup({ args }) {
    const cacheRoot = join(repoRoot, '.compare-published')
    const packageFilter = args.package ?? null

    let changedNames: Set<string> | null = null
    if (args.changedOnly) {
      const base = resolveBase(args.base)
      assertBaseResolvable(base)
      changedNames = changedPackageNames(base)
      if (!args.json) console.log(`Only checking packages changed since ${base}: ${changedNames.size ? [...changedNames].join(', ') : '(none)'}\n`)
    }

    const packages = listWorkspacePackages(packageFilter).filter(({ name }) => !changedNames || changedNames.has(name))
    const npmLatest: NpmLatestLookupMap = args.localOnly ? new Map() : await fetchNpmLatestBulk(packages.map((p) => p.name))

    const refTarballs = new Map<string, string>()
    const refTarballErrors = new Map<string, string>()
    if (!args.localOnly) {
      mkdirSync(cacheRoot, { recursive: true })
      const downloads = packages.flatMap((pkg) => {
        const lookup = npmLatest.get(pkg.name)
        if (!lookup?.ok || !lookup.meta) return []
        return [{ name: pkg.name, meta: lookup.meta }]
      })
      const resolved = await Promise.all(
        downloads.map(async ({ name, meta }) => {
          try {
            return { name, ok: true as const, tarball: await resolveRefTarball(name, meta, cacheRoot, args.skipDownload) }
          } catch (error) {
            return { name, ok: false as const, error: error instanceof Error ? error.message : String(error) }
          }
        }),
      )
      for (const result of resolved) {
        if (result.ok) refTarballs.set(result.name, result.tarball)
        else refTarballErrors.set(result.name, result.error)
      }
    }

    const refEntries = await Promise.all(
      [...refTarballs.entries()].map(async ([name, tarball]) => {
        const [paths, manifest] = await Promise.all([listTarballPaths(tarball), readPackedManifest(tarball)])
        return [name, { paths, manifest }] as const
      }),
    )
    const refContents = new Map<string, { paths: string[]; manifest: PackageManifest }>(refEntries)

    const results: ComparisonEntry[] = []
    for (const { name, dir, localVersion, pkg } of packages) {
      const localPaths = listLocalPackPaths(dir, pkg)
      const entry: ComparisonEntry = {
        name,
        localVersion,
        npmVersion: null,
        warnings: [],
        info: [],
        errors: [],
      }

      checkLocalPackaging(entry, name, localPaths)

      if (args.localOnly) {
        entry.info.push('local-only mode — skipped npm reference comparison')
        results.push(entry)
        continue
      }

      const lookup = npmLatest.get(name)
      if (!lookup) {
        entry.info.push('not published on npm yet — skipping ref download')
        results.push(entry)
        continue
      }
      if (!lookup.ok) {
        entry.errors.push(lookup.error)
        results.push(entry)
        continue
      }
      if (!lookup.meta) {
        entry.info.push('not published on npm yet — skipping ref download')
        results.push(entry)
        continue
      }

      const downloadError = refTarballErrors.get(name)
      if (downloadError) {
        entry.errors.push(downloadError)
        results.push(entry)
        continue
      }

      const ref = refContents.get(name)
      if (!ref) {
        entry.errors.push('failed to load npm reference tarball')
        results.push(entry)
        continue
      }

      compareAgainstPublished(entry, localPaths, pkg, localVersion, lookup.meta, ref.paths, ref.manifest)
      results.push(entry)
    }

    const errorCount = results.reduce((sum, entry) => sum + entry.errors.length, 0)

    if (args.json) {
      const report: ComparePublishedReport = { results, errorCount }
      console.log(JSON.stringify(report, null, 2))
    } else {
      console.log(`Compared ${results.length} package(s) (local files vs npm latest)\n`)
      for (const entry of results) {
        const errs = entry.errors
        const warns = entry.warnings
        const info = entry.info
        const status = errs.length ? '✖' : warns.length ? '⚠' : '✓'
        console.log(`${status} ${entry.name} (npm ${entry.npmVersion ?? '—'} → local ${entry.localVersion})`)
        for (const m of errs) console.log(`    error: ${m}`)
        for (const m of warns) console.log(`    warn: ${m}`)
        for (const m of info) console.log(`    info: ${m}`)
        console.log()
      }
      const ok = results.filter((r) => r.errors.length === 0).length
      console.log(`OK: ${ok}/${results.length} (errors: ${errorCount})`)
    }

    if (errorCount > 0) process.exit(1)
  },
})
