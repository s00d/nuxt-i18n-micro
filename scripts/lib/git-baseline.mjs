/**
 * Shared "what changed since the baseline" helpers.
 *
 * Used by check-package-versions.mjs (is every changed package bumped?) and
 * compare-published-dist.mjs (only pack what changed). Keeping one copy avoids
 * the two drifting apart — notably the fail-open bug where a failed `git diff`
 * was read as "nothing changed".
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

/** @param {string} cmd @param {string[]} args */
export function run(cmd, args, options = {}) {
  return execFileSync(cmd, args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim()
}

/** @param {string} cmd @param {string[]} args @returns {string | null} */
export function tryRun(cmd, args) {
  try {
    return run(cmd, args)
  } catch {
    return null
  }
}

/**
 * Baseline ref, first match wins:
 *   explicit `--base` → PR merge-base (GITHUB_BASE_REF) → last tag → origin/main.
 * @param {string | null} explicitBase
 */
export function resolveBase(explicitBase = null) {
  if (explicitBase) return explicitBase

  const prBase = process.env.GITHUB_BASE_REF
  if (prBase) {
    tryRun('git', ['fetch', '--no-tags', '--quiet', 'origin', prBase])
    const mergeBase = tryRun('git', ['merge-base', 'HEAD', `origin/${prBase}`])
    if (mergeBase) return mergeBase
  }

  const lastTag = tryRun('git', ['describe', '--tags', '--abbrev=0'])
  if (lastTag) return lastTag

  return tryRun('git', ['rev-parse', 'origin/main']) ? 'origin/main' : 'HEAD~1'
}

/** Exit with a readable message when the baseline cannot be used. */
export function assertBaseResolvable(base) {
  if (tryRun('git', ['rev-parse', '--verify', '--quiet', `${base}^{commit}`]) === null) {
    console.error(
      `Cannot resolve baseline "${base}". ` + `Fetch it first (CI needs full history: actions/checkout with fetch-depth: 0) or pass --base <ref>.`,
    )
    process.exit(1)
  }
}

/**
 * Files changed under `relDir` between baseline and HEAD.
 * Throws on git failure: swallowing it would report "unchanged" and let callers
 * pass vacuously.
 * @param {string} ref @param {string} relDir
 */
export function changedFiles(ref, relDir) {
  return run('git', ['diff', '--name-only', `${ref}...HEAD`, '--', relDir])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/** Public (non-private) workspace packages under packages/. */
export function listWorkspacePackages(filter = null) {
  const packagesRoot = join(repoRoot, 'packages')
  const out = []
  for (const entry of readdirSync(packagesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (filter && entry.name !== filter && !entry.name.includes(filter)) continue
    const dir = join(packagesRoot, entry.name)
    const manifest = join(dir, 'package.json')
    if (!existsSync(manifest)) continue
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
    if (pkg.private === true || !pkg.name) continue
    out.push({ name: pkg.name, dir, relDir: `packages/${entry.name}`, localVersion: String(pkg.version ?? ''), pkg })
  }
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Files that cannot change what gets published.
 * Everything else counts (fail closed).
 * @param {string} relPath path relative to the package directory
 */
export function affectsPublishedArtifact(relPath) {
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

/** Names of packages whose publishable files changed since `base`. */
export function changedPackageNames(base) {
  const changed = new Set()
  for (const { name, relDir } of listWorkspacePackages()) {
    const files = changedFiles(base, relDir).filter((file) => affectsPublishedArtifact(file.slice(`${relDir}/`.length)))
    if (files.length > 0) changed.add(name)
  }
  return changed
}
