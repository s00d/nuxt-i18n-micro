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
 * Compare dot-separated prerelease identifiers per SemVer §11.4: numeric
 * identifiers compare numerically and rank lower than alphanumeric ones, and a
 * shorter set of identifiers ranks lower when all preceding ones are equal.
 * Comparing the whole string lexically would order `beta.10` before `beta.2`.
 * @param {string} a @param {string} b
 */
function comparePrerelease(a, b) {
  const idsA = a.split('.')
  const idsB = b.split('.')
  const length = Math.max(idsA.length, idsB.length)

  for (let i = 0; i < length; i++) {
    const idA = idsA[i]
    const idB = idsB[i]
    if (idA === undefined) return -1
    if (idB === undefined) return 1
    if (idA === idB) continue

    const numA = /^\d+$/.test(idA) ? Number(idA) : null
    const numB = /^\d+$/.test(idB) ? Number(idB) : null
    if (numA !== null && numB !== null) return numA - numB
    // Numeric identifiers always have lower precedence than alphanumeric ones.
    if (numA !== null) return -1
    if (numB !== null) return 1
    return idA < idB ? -1 : 1
  }
  return 0
}

/**
 * Compare semver strings (x.y.z with an optional -prerelease; build metadata ignored).
 * Returns >0 when a is newer, <0 when older, 0 when equal.
 * @param {string} a @param {string} b
 */
function compareVersions(a, b) {
  const parse = (v) => {
    const [withoutBuild = ''] = String(v).split('+', 1)
    const dashAt = withoutBuild.indexOf('-')
    const core = dashAt === -1 ? withoutBuild : withoutBuild.slice(0, dashAt)
    const pre = dashAt === -1 ? '' : withoutBuild.slice(dashAt + 1)
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
  return comparePrerelease(va.pre, vb.pre)
}

/**
 * Files changed in `relDir` between the baseline and HEAD.
 * Throws when git itself fails: swallowing the error would report every package
 * as unchanged and make this guard pass vacuously (e.g. on a shallow clone or a
 * baseline ref that does not exist locally).
 * @param {string} ref @param {string} relDir
 */
function changedFiles(ref, relDir) {
  const out = run('git', ['diff', '--name-only', `${ref}...HEAD`, '--', relDir])
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

/**
 * `--npm` only: a version that already exists on npm cannot be published again —
 * `pnpm publish -r` skips it, so the change would never reach consumers.
 * Applies to changed *and* newly added packages.
 * @param {{ status: string, errors: string[] }} entry
 * @param {string} name @param {string} version
 * @returns {number} number of errors added
 */
function checkAlreadyPublished(entry, name, version) {
  if (!checkNpm || entry.errors.length > 0) return 0
  if (!publishedVersions(name).includes(version)) return 0
  entry.status = 'ALREADY PUBLISHED'
  entry.errors.push(`version ${version} is already published on npm — bump before releasing`)
  return 1
}

const base = resolveBase()

// Fail loudly on an unusable baseline. Without this the git diffs below would
// throw mid-run (or, worse, a swallowed failure would mark everything unchanged
// and let unbumped packages through).
if (tryRun('git', ['rev-parse', '--verify', '--quiet', `${base}^{commit}`]) === null) {
  console.error(
    `Cannot resolve baseline "${base}". ` + `Fetch it first (CI needs full history: actions/checkout with fetch-depth: 0) or pass --base <ref>.`,
  )
  process.exit(1)
}

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
    // New package: there is no baseline version to compare against, but it can
    // still carry a version that npm already has (e.g. a re-added package, or one
    // published from another branch) — which `pnpm publish -r` would skip.
    entry.status = 'new package'
    errorCount += checkAlreadyPublished(entry, name, version)
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

  errorCount += checkAlreadyPublished(entry, name, version)

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
