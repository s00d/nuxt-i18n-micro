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
 * Baseline resolution, diffing and the "does this file affect the published
 * artifact" rule live in ./lib/git-baseline.mjs, shared with
 * compare-published-dist.mjs so the two cannot drift apart.
 *
 * Usage:
 *   node scripts/check-package-versions.mjs
 *   node scripts/check-package-versions.mjs --base v3.21.4
 *   node scripts/check-package-versions.mjs --npm     # also reject versions already on npm
 *   node scripts/check-package-versions.mjs --json
 */
import {
  affectsPublishedArtifact,
  assertBaseResolvable,
  changedFiles,
  listWorkspacePackages,
  readOptionValue,
  resolveBase,
  tryRun,
} from './lib/git-baseline.mjs'

const args = process.argv.slice(2)
const jsonOut = args.includes('--json')
const checkNpm = args.includes('--npm')
const explicitBase = readOptionValue(args, '--base')

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

const base = resolveBase(explicitBase)
assertBaseResolvable(base)

const results = []
let errorCount = 0

for (const { name, relDir, localVersion: version } of listWorkspacePackages()) {
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
