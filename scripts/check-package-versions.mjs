#!/usr/bin/env node
/**
 * Fail when a workspace package changed but its version was not bumped.
 *
 * Package versions in `packages/*` are maintained by hand (changelogen only
 * bumps the root package), and `pnpm publish -r` silently *skips* a package
 * whose version already exists on npm. So forgetting a bump does not error —
 * it just leaves a stale package published while the rest of the release moves
 * on. This script turns that silent skip into a loud failure.
 *
 * A package "changed" when any file in it changed since the baseline, except
 * files that cannot affect the published artifact (tests, docs, playgrounds,
 * test configs). The rule fails closed: anything not explicitly ignored counts.
 *
 * Baseline resolution (first match wins):
 *   --base <ref>              explicit
 *   GITHUB_BASE_REF           pull request → merge-base with origin/<base>
 *   git describe --tags       last release tag (the release baseline)
 *   origin/HEAD → main        fallback
 *
 * Usage:
 *   node scripts/check-package-versions.mjs
 *   node scripts/check-package-versions.mjs --base v3.21.4
 *   node scripts/check-package-versions.mjs --npm     # also reject versions already on npm
 *   node scripts/check-package-versions.mjs --json
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const packagesRoot = join(root, 'packages')

const args = process.argv.slice(2)
const jsonOut = args.includes('--json')
const checkNpm = args.includes('--npm')
const explicitBase = (() => {
  const i = args.indexOf('--base')
  return i >= 0 ? args[i + 1] : null
})()

/** @param {string} cmd @param {string[]} cmdArgs */
function run(cmd, cmdArgs, options = {}) {
  return execFileSync(cmd, cmdArgs, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim()
}

/** @param {string} cmd @param {string[]} cmdArgs @returns {string | null} */
function tryRun(cmd, cmdArgs) {
  try {
    return run(cmd, cmdArgs)
  } catch {
    return null
  }
}

/**
 * Files that can never change what gets published.
 * Everything else counts as a publishable change (fail closed).
 * @param {string} relPath path relative to the package directory
 */
function affectsPublishedArtifact(relPath) {
  const ignored = [
    /^tests?\//,
    /^__tests__\//,
    /^playground\//,
    /^examples?\//,
    /\.md$/i,
    /^vitest\..*\.?config\.[cm]?[jt]s$/,
    /^jest\..*config\./,
    /^\.npmignore$/,
    /^CHANGELOG/i,
  ]
  return !ignored.some((re) => re.test(relPath))
}

function resolveBase() {
  if (explicitBase) return explicitBase

  const prBase = process.env.GITHUB_BASE_REF
  if (prBase) {
    // Pull request: diff against the merge-base with the target branch.
    tryRun('git', ['fetch', '--no-tags', '--quiet', 'origin', prBase])
    const mergeBase = tryRun('git', ['merge-base', 'HEAD', `origin/${prBase}`])
    if (mergeBase) return mergeBase
  }

  const lastTag = tryRun('git', ['describe', '--tags', '--abbrev=0'])
  if (lastTag) return lastTag

  return tryRun('git', ['rev-parse', 'origin/main']) ? 'origin/main' : 'HEAD~1'
}

/** @returns {{ name: string, dir: string, relDir: string, version: string }[]} */
function listWorkspacePackages() {
  const out = []
  for (const entry of readdirSync(packagesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const dir = join(packagesRoot, entry.name)
    const manifest = join(dir, 'package.json')
    if (!existsSync(manifest)) continue
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
    if (pkg.private === true || !pkg.name) continue
    out.push({ name: pkg.name, dir, relDir: `packages/${entry.name}`, version: String(pkg.version ?? '') })
  }
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Compare plain semver strings (x.y.z with an optional -prerelease).
 * Returns >0 when a is newer, <0 when older, 0 when equal.
 * @param {string} a @param {string} b
 */
function compareVersions(a, b) {
  const parse = (v) => {
    const [core = '', pre = ''] = String(v).split('-', 2)
    const nums = core.split('.').map((n) => Number.parseInt(n, 10) || 0)
    return { nums, pre }
  }
  const va = parse(a)
  const vb = parse(b)
  for (let i = 0; i < 3; i++) {
    const diff = (va.nums[i] ?? 0) - (vb.nums[i] ?? 0)
    if (diff !== 0) return diff
  }
  // A release outranks any prerelease of the same core version.
  if (va.pre === vb.pre) return 0
  if (!va.pre) return 1
  if (!vb.pre) return -1
  return va.pre < vb.pre ? -1 : 1
}

/** @param {string} ref @param {string} relDir */
function changedFiles(ref, relDir) {
  const out = tryRun('git', ['diff', '--name-only', `${ref}...HEAD`, '--', relDir])
  if (out === null) return []
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/** @param {string} ref @param {string} relDir */
function versionAtRef(ref, relDir) {
  const manifest = tryRun('git', ['show', `${ref}:${relDir}/package.json`])
  if (!manifest) return null
  try {
    return String(JSON.parse(manifest).version ?? '')
  } catch {
    return null
  }
}

/** @param {string} name */
function publishedVersions(name) {
  const out = tryRun('npm', ['view', name, 'versions', '--json'])
  if (!out) return []
  try {
    const parsed = JSON.parse(out)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return []
  }
}

const base = resolveBase()
const results = []
let errorCount = 0

for (const { name, relDir, version } of listWorkspacePackages()) {
  const entry = { name, version, status: 'unchanged', changedFiles: 0, baseVersion: null, errors: [] }

  const changed = changedFiles(base, relDir).filter((file) => affectsPublishedArtifact(file.slice(`${relDir}/`.length)))
  entry.changedFiles = changed.length

  if (changed.length === 0) {
    results.push(entry)
    continue
  }

  const baseVersion = versionAtRef(base, relDir)
  entry.baseVersion = baseVersion

  if (baseVersion === null) {
    entry.status = 'new package'
    results.push(entry)
    continue
  }

  const cmp = compareVersions(version, baseVersion)
  if (cmp === 0) {
    entry.status = 'NEEDS BUMP'
    entry.errors.push(
      `changed ${changed.length} file(s) since ${base} but version is still ${version} — bump it, or \`pnpm publish -r\` will silently skip this package`,
    )
    errorCount++
  } else if (cmp < 0) {
    entry.status = 'VERSION WENT BACKWARDS'
    entry.errors.push(`version ${version} is lower than ${baseVersion} at ${base}`)
    errorCount++
  } else {
    entry.status = `bumped ${baseVersion} → ${version}`
  }

  if (checkNpm && entry.errors.length === 0) {
    // A version that is already on npm cannot be published again: `pnpm publish -r`
    // skips it, so the change would never reach consumers.
    if (publishedVersions(name).includes(version)) {
      entry.status = 'ALREADY PUBLISHED'
      entry.errors.push(`version ${version} is already published on npm — bump before releasing`)
      errorCount++
    }
  }

  results.push(entry)
}

if (jsonOut) {
  console.log(JSON.stringify({ base, results, errorCount }, null, 2))
} else {
  console.log(`Checked ${results.length} package(s) for version bumps against ${base}\n`)
  for (const entry of results) {
    if (entry.status === 'unchanged') continue
    const mark = entry.errors.length ? '✖' : '✓'
    console.log(`${mark} ${entry.name} (${entry.status}, ${entry.changedFiles} file(s) changed)`)
    for (const error of entry.errors) console.log(`    error: ${error}`)
  }
  const unchanged = results.filter((r) => r.status === 'unchanged').length
  console.log(`\nOK: ${results.length - errorCount}/${results.length} (unchanged: ${unchanged}, errors: ${errorCount})`)
}

process.exit(errorCount > 0 ? 1 : 0)
