#!/usr/bin/env node
/**
 * Compare local npm pack tarballs with the latest published version on npm.
 *
 * Usage:
 *   node scripts/compare-published-dist.mjs
 *   node scripts/compare-published-dist.mjs --json
 *   node scripts/compare-published-dist.mjs --package path-strategy
 *   node scripts/compare-published-dist.mjs --skip-download
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const packagesRoot = join(root, 'packages')
const cacheRoot = join(root, '.compare-published')

const args = process.argv.slice(2)
const jsonOut = args.includes('--json')
const skipDownload = args.includes('--skip-download')
const packageFilter = (() => {
  const i = args.indexOf('--package')
  return i >= 0 ? args[i + 1] : null
})()

/** @typedef {{ name: string, dir: string, localVersion: string, pkg: Record<string, unknown> }} WorkspacePackage */

/** @returns {WorkspacePackage[]} */
function listWorkspacePackages() {
  /** @type {WorkspacePackage[]} */
  const out = []
  for (const entry of readdirSync(packagesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (packageFilter && entry.name !== packageFilter && !entry.name.includes(packageFilter)) continue
    const dir = join(packagesRoot, entry.name)
    const manifest = join(dir, 'package.json')
    if (!existsSync(manifest)) continue
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
    if (pkg.private === true) continue
    if (!pkg.name || typeof pkg.name !== 'string') continue
    out.push({ name: pkg.name, dir, localVersion: String(pkg.version ?? ''), pkg })
  }
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

/** @param {string} cmd @param {string[]} cmdArgs @param {import('node:child_process').ExecFileSyncOptions} [options] */
function run(cmd, cmdArgs, options = {}) {
  return execFileSync(cmd, cmdArgs, { encoding: 'utf8', ...options }).trim()
}

/** @param {string} name */
function npmVersion(name) {
  try {
    return run('npm', ['view', name, 'version'])
  } catch {
    return null
  }
}

/**
 * @param {string} cwd
 * @param {string} dest
 * @param {string} [spec] package spec for npm pack (defaults to cwd)
 */
function npmPack(cwd, dest, spec) {
  mkdirSync(dest, { recursive: true })
  const packArgs = ['pack', '--json', '--pack-destination', dest]
  if (spec) packArgs.push(spec)
  const output = run('npm', packArgs, { cwd: spec ? root : cwd })
  const parsed = JSON.parse(output)
  const first = parsed[0]
  if (!first?.filename) throw new Error(`npm pack returned no tarball (${spec ?? cwd})`)
  return {
    tarball: join(dest, first.filename),
    files: (first.files ?? []).map((/** @type {{ path: string }} */ f) => String(f.path).replace(/\\/g, '/')),
  }
}

/** @param {string} tarball */
function listTarballPaths(tarball) {
  const listing = run('tar', ['-tzf', tarball])
  return listing
    .split('\n')
    .filter(Boolean)
    .map((p) => p.replace(/\\/g, '/'))
    .map((p) => (p.startsWith('package/') ? p.slice('package/'.length) : p))
    .filter((p) => p && p !== 'package')
}

/** @param {string} tarball */
function readPackedManifest(tarball) {
  const extractDir = join(cacheRoot, '_manifest-extract')
  rmSync(extractDir, { recursive: true, force: true })
  mkdirSync(extractDir, { recursive: true })
  run('tar', ['-xzf', tarball, '-C', extractDir, 'package/package.json'])
  return JSON.parse(readFileSync(join(extractDir, 'package/package.json'), 'utf8'))
}

/** @param {unknown} value @param {string[]} [out] */
function collectExportTypePaths(value, out = []) {
  if (!value || typeof value !== 'object') return out
  if (typeof value === 'string') {
    if (/\.d\.(?:ts|cts|mts)$/.test(value)) out.push(value.replace(/^\.\//, ''))
    return out
  }
  if ('types' in value && typeof value.types === 'string') {
    out.push(value.types.replace(/^\.\//, ''))
  }
  for (const child of Object.values(value)) collectExportTypePaths(child, out)
  return out
}

const HASHED_CHUNK_RE = /^(?:base-strategy|common)-[A-Za-z0-9_-]{6,}\.(?:js|cjs|mjs)$/
const DIST_RUNTIME_RE = /^dist\/[^/]+\.(?:mjs|cjs|js)$/

/** @type {Array<Record<string, unknown>>} */
const results = []
let errorCount = 0

for (const { name, dir, localVersion } of listWorkspacePackages()) {
  const npmVer = npmVersion(name)
  /** @type {Record<string, unknown>} */
  const entry = {
    name,
    localVersion,
    npmVersion: npmVer,
    warnings: [],
    info: [],
    errors: [],
  }

  if (!npmVer) {
    entry.info.push('not published on npm yet — skipping ref download')
    results.push(entry)
    continue
  }

  const cacheKey = name.replace('@', '').replace('/', '__')
  const refDir = join(cacheRoot, cacheKey, `npm-${npmVer}`)
  const localDir = join(cacheRoot, cacheKey, `local-${localVersion}`)
  mkdirSync(cacheRoot, { recursive: true })

  try {
    let refTarball
    if (skipDownload && existsSync(join(refDir, '.done'))) {
      const cached = readdirSync(refDir).filter((f) => f.endsWith('.tgz'))
      refTarball = join(refDir, cached[0])
    } else {
      rmSync(refDir, { recursive: true, force: true })
      mkdirSync(refDir, { recursive: true })
      const ref = npmPack(dir, refDir, `${name}@${npmVer}`)
      refTarball = ref.tarball
      writeFileSync(join(refDir, '.done'), refTarball)
    }

    rmSync(localDir, { recursive: true, force: true })
    mkdirSync(localDir, { recursive: true })
    const local = npmPack(dir, localDir)
    const refPaths = listTarballPaths(refTarball)
    const localPaths = listTarballPaths(local.tarball)
    const refPkg = readPackedManifest(refTarball)
    const localPkg = readPackedManifest(local.tarball)

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
      const base = t.split('/').pop() ?? t
      const refMatch = [...refTypes].find((r) => r === t || r.endsWith(`/${base}`) || r.endsWith(base))
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

    const hashedInLocal = localPaths
      .filter((p) => p.startsWith('dist/'))
      .map((p) => p.replace(/^dist\//, ''))
      .filter((n) => HASHED_CHUNK_RE.test(n))
    if (hashedInLocal.length) {
      entry.errors.push(`hashed chunks in local dist: ${hashedInLocal.join(', ')}`)
      errorCount++
    }

    if (localVersion !== npmVer) {
      entry.info.push(`version bump ${npmVer} → ${localVersion}`)
    }

    if (localPkg.exports && !refPkg.exports) {
      entry.info.push('local package.json adds exports field')
    }

    const refDcts = refPaths.filter((p) => p.endsWith('.d.cts'))
    const localDcts = localPaths.filter((p) => p.endsWith('.d.cts'))
    if (localDcts.length > refDcts.length) {
      entry.info.push(`added ${localDcts.length - refDcts.length} .d.cts file(s) for require types`)
    }

    if (name === '@i18n-micro/astro') {
      const clientCjs = localPaths.filter((p) => /^dist\/client\/.*\.cjs$/.test(p))
      if (clientCjs.length) {
        entry.errors.push(`astro client CJS artifacts in pack: ${clientCjs.join(', ')}`)
        errorCount++
      }
    }

    if (onlyRef.length > 0 || onlyLocal.length > 0) {
      entry.info.push(`tarball diff: +${onlyLocal.length} / -${onlyRef.length} paths`)
    }
  } catch (error) {
    entry.errors.push(error instanceof Error ? error.message : String(error))
    errorCount++
  }

  results.push(entry)
}

if (jsonOut) {
  console.log(JSON.stringify({ results, errorCount }, null, 2))
} else {
  console.log(`Compared ${results.length} package(s) (local npm pack vs npm latest)\n`)
  for (const entry of results) {
    const label = /** @type {string} */ (entry.name)
    const errs = /** @type {string[]} */ (entry.errors)
    const warns = /** @type {string[]} */ (entry.warnings)
    const info = /** @type {string[]} */ (entry.info)
    const status = errs.length ? '✖' : warns.length ? '⚠' : '✓'
    console.log(`${status} ${label} (npm ${entry.npmVersion ?? '—'} → local ${entry.localVersion})`)
    for (const m of errs) console.log(`    error: ${m}`)
    for (const m of warns) console.log(`    warn: ${m}`)
    for (const m of info) console.log(`    info: ${m}`)
    console.log()
  }
  const ok = results.filter((r) => /** @type {string[]} */ (r.errors).length === 0).length
  console.log(`OK: ${ok}/${results.length} (errors: ${errorCount})`)
}

process.exit(errorCount > 0 ? 1 : 0)
