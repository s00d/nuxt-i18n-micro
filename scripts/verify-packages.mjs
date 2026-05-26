#!/usr/bin/env node
/**
 * Verify workspace packages: package.json publish fields + files referenced by exports exist.
 *
 * Usage:
 *   node scripts/verify-packages.mjs
 *   node scripts/verify-packages.mjs --publint   # also run `publint` in each package
 *   node scripts/verify-packages.mjs --json      # machine-readable report
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const packagesRoot = join(root, 'packages')

const flags = new Set(process.argv.slice(2))
const runPublint = flags.has('--publint')
const jsonOut = flags.has('--json')

/** @type {{ errors: Array<{ pkg: string, code: string, message: string }>, warnings: typeof errors, ok: string[] }} */
const report = { errors: [], warnings: [], ok: [] }

function add(level, pkg, code, message) {
  report[level].push({ pkg, code, message })
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function listWorkspacePackages() {
  /** @type {Array<{ name: string, dir: string, pkg: Record<string, unknown> }>} */
  const out = []
  for (const entry of readdirSync(packagesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const dir = join(packagesRoot, entry.name)
    const manifest = join(dir, 'package.json')
    if (!existsSync(manifest)) continue
    const pkg = readJson(manifest)
    if (pkg.private === true) continue
    if (!pkg.name || typeof pkg.name !== 'string') continue
    out.push({ name: pkg.name, dir, pkg })
  }
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

/** @param {unknown} value @param {string[]} paths */
function collectRelativePaths(value, paths) {
  if (typeof value === 'string') {
    if (value.startsWith('./') || value.startsWith('../')) paths.push(value)
    return
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const v of Object.values(value)) collectRelativePaths(v, paths)
  }
}

function resolvePkgPath(pkgDir, rel) {
  return resolve(pkgDir, rel.replace(/^\.\//, ''))
}

function pathExists(pkgDir, rel) {
  if (rel.includes('*')) {
    const base = rel.split('*')[0].replace(/\/$/, '')
    const dir = resolvePkgPath(pkgDir, base || '.')
    return existsSync(dir) && statSync(dir).isDirectory()
  }
  return existsSync(resolvePkgPath(pkgDir, rel))
}

function checkDualPackageTypes(pkgName, pkgDir, pkg) {
  const exports = pkg.exports
  if (!exports || typeof exports !== 'object' || pkg.type !== 'module') return

  const root = exports['.']
  if (!root || typeof root !== 'object') return

  const hasRequire =
    typeof root === 'object' &&
    ('require' in root || (typeof root.require === 'object' && root.require !== null))
  if (!hasRequire) return

  const importTypes =
    typeof root.import === 'object' && root.import && 'types' in root.import
      ? root.import.types
      : typeof root.types === 'string'
        ? root.types
        : null
  const requireTypes =
    typeof root.require === 'object' && root.require && 'types' in root.require
      ? root.require.types
      : null

  if (typeof root.types === 'string' && (root.import || root.require)) {
    add(
      'warnings',
      pkgName,
      'exports-types-top-level',
      'Root export "." uses top-level "types" with import/require conditions — prefer types under import/require',
    )
  }

  if (requireTypes && !String(requireTypes).endsWith('.d.cts')) {
    add(
      'warnings',
      pkgName,
      'require-types-cts',
      `require.types should use .d.cts for "type":"module" (got ${requireTypes})`,
    )
  }

  if (importTypes && requireTypes && importTypes === requireTypes) {
    add(
      'warnings',
      pkgName,
      'same-types-import-require',
      'import.types and require.types point to the same file — use .d.cts for require',
    )
  }
}

function checkPublishFields(pkgName, pkgDir, pkg) {
  if (!pkg.license) {
    add('warnings', pkgName, 'missing-license', 'Missing "license" field')
  }
  if (pkg.sideEffects === undefined && pkg.exports) {
    add('warnings', pkgName, 'missing-sideEffects', 'Missing "sideEffects" (recommended false for libraries)')
  }
  if (!pkg.engines?.node) {
    add('warnings', pkgName, 'missing-engines', 'Missing engines.node')
  }
  if (pkg.module && pkg.exports) {
    add('warnings', pkgName, 'redundant-module', 'Redundant "module" field when "exports" is set')
  }
  if (existsSync(join(pkgDir, 'LICENSE')) && Array.isArray(pkg.files) && !pkg.files.includes('LICENSE')) {
    add('warnings', pkgName, 'files-license', '"files" should include LICENSE')
  }
  if (existsSync(join(pkgDir, 'README.md')) && Array.isArray(pkg.files) && !pkg.files.includes('README.md')) {
    add('warnings', pkgName, 'files-readme', '"files" should include README.md')
  }
  checkDualPackageTypes(pkgName, pkgDir, pkg)
}

function checkReferencedFiles(pkgName, pkgDir, pkg) {
  const relPaths = []
  collectRelativePaths(pkg.exports, relPaths)
  for (const field of ['main', 'module', 'types']) {
    if (typeof pkg[field] !== 'string') continue
    relPaths.push(pkg[field].startsWith('./') || pkg[field].startsWith('../') ? pkg[field] : `./${pkg[field]}`)
  }
  if (Array.isArray(pkg.files)) {
    for (const entry of pkg.files) {
      if (typeof entry === 'string' && !entry.includes('*')) relPaths.push(`./${entry}`)
    }
  }

  const unique = [...new Set(relPaths)]
  for (const rel of unique) {
    if (rel === './package.json') continue
    if (!pathExists(pkgDir, rel)) {
      add('errors', pkgName, 'missing-file', `Referenced path does not exist: ${rel}`)
    }
  }

  if (unique.some((p) => p.startsWith('./dist/')) && !existsSync(join(pkgDir, 'dist'))) {
    add('warnings', pkgName, 'no-dist', 'Package references ./dist/* but dist/ is missing — run pnpm run build in this package')
  }
}

function runPublintForPackage(pkgName, pkgDir) {
  try {
    execFileSync('pnpm', ['exec', 'publint'], { cwd: pkgDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] })
    report.ok.push(pkgName)
  } catch (error) {
    const stdout = error.stdout?.toString?.() ?? ''
    const stderr = error.stderr?.toString?.() ?? ''
    const detail = (stdout + stderr).trim() || error.message
    add('errors', pkgName, 'publint', detail.split('\n')[0] || 'publint failed')
  }
}

const packages = listWorkspacePackages()

for (const { name, dir, pkg } of packages) {
  checkPublishFields(name, dir, pkg)
  checkReferencedFiles(name, dir, pkg)
  if (runPublint) runPublintForPackage(name, dir)
  else if (report.errors.every((e) => e.pkg !== name)) report.ok.push(name)
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(`Checked ${packages.length} workspace package(s) under packages/\n`)
  if (report.errors.length) {
    console.log('Errors:')
    for (const { pkg, code, message } of report.errors) {
      console.log(`  ✖ ${pkg} [${code}] ${message}`)
    }
    console.log()
  }
  if (report.warnings.length) {
    console.log('Warnings:')
    for (const { pkg, code, message } of report.warnings) {
      console.log(`  ⚠ ${pkg} [${code}] ${message}`)
    }
    console.log()
  }
  const clean = report.ok.filter((n) => !report.errors.some((e) => e.pkg === n))
  console.log(`OK: ${clean.length}/${packages.length}`)
  if (runPublint) console.log('(includes publint)')
}

process.exit(report.errors.length > 0 ? 1 : 0)
