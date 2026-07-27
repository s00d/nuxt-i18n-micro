/**
 * Shared "what changed since the baseline" helpers.
 *
 * Used by `check-versions` (is every changed package bumped?) and `compare-published`
 * (only pack what changed). Keeping one copy avoids the two drifting apart — notably
 * the fail-open bug where a failed `git diff` was read as "nothing changed".
 */
import { execFileSync, type ExecFileSyncOptions } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parseManifest, type PackageManifest } from './manifest'
import { repoRoot } from './workspace'

export interface WorkspacePackage {
  name: string
  dir: string
  relDir: string
  localVersion: string
  pkg: PackageManifest
}

export function run(cmd: string, args: string[], options: ExecFileSyncOptions = {}): string {
  return execFileSync(cmd, args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options })
    .toString()
    .trim()
}

export interface CommandResult {
  ok: boolean
  stdout: string
  stderr: string
}

/**
 * Like `tryRun`, but keeps the output of a *failed* command.
 *
 * Some tools answer a legitimate question on a non-zero exit — `npm view` reports a
 * package that was never published as E404 while still printing a JSON body — so the
 * caller needs to see stdout before deciding whether the failure was meaningful.
 */
export function runCapture(cmd: string, args: string[]): CommandResult {
  try {
    return { ok: true, stdout: run(cmd, args), stderr: '' }
  } catch (error) {
    const err = error as { stdout?: Buffer | string; stderr?: Buffer | string }
    return { ok: false, stdout: (err.stdout?.toString() ?? '').trim(), stderr: (err.stderr?.toString() ?? '').trim() }
  }
}

export function tryRun(cmd: string, args: string[]): string | null {
  try {
    return run(cmd, args)
  } catch {
    return null
  }
}

/**
 * Baseline ref, first match wins:
 * explicit base → PR merge-base (`GITHUB_BASE_REF`) → last tag → `origin/main`.
 */
export function resolveBase(explicitBase?: string | null): string {
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
export function assertBaseResolvable(base: string): void {
  if (tryRun('git', ['rev-parse', '--verify', '--quiet', `${base}^{commit}`]) === null) {
    console.error(
      `Cannot resolve baseline "${base}". Fetch it first (CI needs full history: actions/checkout with fetch-depth: 0) or pass --base <ref>.`,
    )
    process.exit(1)
  }
}

/**
 * Files changed under `relDir` between baseline and HEAD.
 * Throws on git failure: swallowing it would report "unchanged" and let callers
 * pass vacuously.
 */
export function changedFiles(ref: string, relDir: string): string[] {
  return run('git', ['diff', '--name-only', `${ref}...HEAD`, '--', relDir])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/** Public (non-private) workspace packages under `packages/`. */
export function listWorkspacePackages(filter: string | null = null): WorkspacePackage[] {
  const packagesRoot = join(repoRoot, 'packages')
  const out: WorkspacePackage[] = []

  for (const entry of readdirSync(packagesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (filter && entry.name !== filter && !entry.name.includes(filter)) continue

    const dir = join(packagesRoot, entry.name)
    const manifest = join(dir, 'package.json')
    if (!existsSync(manifest)) continue

    const pkg = parseManifest(readFileSync(manifest, 'utf8'))
    if (pkg.private === true || !pkg.name) continue

    out.push({ name: pkg.name, dir, relDir: `packages/${entry.name}`, localVersion: String(pkg.version ?? ''), pkg })
  }

  return out.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Files that cannot change what gets published. Everything else counts (fail closed).
 * @param relPath path relative to the package directory
 */
export function affectsPublishedArtifact(relPath: string): boolean {
  const ignored = [
    /^tests?\//,
    /^__tests__\//,
    /^playground\//,
    /^examples?\//,
    /\.md$/i,
    /^vitest\..*\.?config\.[cm]?[jt]s$/,
    /^jest\..*config\./,
    /^CHANGELOG/i,
  ]
  return !ignored.some((re) => re.test(relPath))
}

/** Names of packages whose publishable files changed since `base`. */
export function changedPackageNames(base: string): Set<string> {
  const changed = new Set<string>()
  for (const { name, relDir } of listWorkspacePackages()) {
    const files = changedFiles(base, relDir).filter((file) => affectsPublishedArtifact(file.slice(`${relDir}/`.length)))
    if (files.length > 0) changed.add(name)
  }
  return changed
}
