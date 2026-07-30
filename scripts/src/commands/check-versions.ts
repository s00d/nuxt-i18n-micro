import { defineCommand } from 'citty'
import {
  assertBaseResolvable,
  affectsPublishedArtifact,
  changedFiles,
  listWorkspacePackages,
  resolveBase,
  runCapture,
  tryRun,
} from '../utils/git-baseline'
import { compareVersions } from '../utils/semver'

/** One package's line in the report. Exported: it is the `--json` contract. */
export interface VersionEntry {
  name: string
  version: string
  status: string
  changedFiles: number
  baseVersion: string | null
  errors: string[]
}

function versionAtRef(ref: string, relDir: string): string | null {
  const manifest = tryRun('git', ['show', `${ref}:${relDir}/package.json`])
  if (!manifest) return null
  try {
    return String((JSON.parse(manifest) as { version?: string }).version ?? '')
  } catch {
    return null
  }
}

/** What `npm view <name> versions --json` writes to stdout. */
type NpmViewVersions = string | string[] | NpmViewError

interface NpmViewError {
  error: { code?: string; summary?: string; detail?: string }
}

function isNpmError(value: NpmViewVersions): value is NpmViewError {
  // `error` may be a string, or null — reading `.code` off either would throw before the
  // gate could report anything, which is the one outcome a release gate must not have.
  if (typeof value !== 'object' || value === null || Array.isArray(value) || !('error' in value)) return false
  const error = (value as { error: unknown }).error
  return typeof error === 'object' && error !== null
}

/**
 * Versions of `name` on npm, or `null` when the lookup itself failed.
 *
 * Three outcomes, and the difference between the last two is the whole point:
 * a list of versions, `[]` for a package the registry has never heard of, and `null`
 * when the registry could not be reached. Reading an unreachable registry as "nothing
 * published" lets an already-published version through the gate the check exists to
 * guard; reading a never-published package as a failure blocks the first release of
 * every new package.
 *
 * `npm view` reports both cases with a non-zero exit, so the JSON body decides:
 * E404 means the package does not exist, anything else means the lookup failed.
 */
export function publishedVersions(name: string): string[] | null {
  const { ok, stdout } = runCapture('npm', ['view', name, 'versions', '--json'])
  if (ok && !stdout) return []

  let parsed: NpmViewVersions
  try {
    parsed = JSON.parse(stdout) as NpmViewVersions
  } catch {
    return null
  }

  if (isNpmError(parsed)) return parsed.error.code === 'E404' ? [] : null
  if (!ok) return null

  if (Array.isArray(parsed)) return parsed
  if (typeof parsed === 'string') return [parsed]
  return null
}

export interface CheckVersionsReport {
  base: string
  results: VersionEntry[]
  errorCount: number
}

export const checkVersionsCommand = defineCommand({
  meta: {
    name: 'check-versions',
    description: [
      'Fail when a workspace package changed but its version was not bumped.',
      '',
      'Versions in `packages/*` are maintained by hand, and `pnpm publish -r` silently',
      '*skips* a package whose version already exists on npm. Forgetting a bump therefore',
      'does not error — it just leaves a stale package published while the rest of the',
      'release moves on. This turns that silent skip into a loud failure.',
      '',
      'Examples:',
      '  pnpm -C scripts cli check-versions',
      '  pnpm -C scripts cli check-versions --base v3.21.4',
      '  pnpm -C scripts cli check-versions --npm      # also reject versions already on npm',
      '  pnpm -C scripts cli check-versions --json',
    ].join('\n'),
  },
  args: {
    base: {
      type: 'string',
      description: 'Baseline ref (default: PR merge-base, else last tag, else origin/main)',
    },
    npm: {
      type: 'boolean',
      default: false,
      description: 'Also fail when the local version is already published',
    },
    json: {
      type: 'boolean',
      default: false,
      description: 'Print machine-readable output',
    },
  },
  setup({ args }) {
    const base = resolveBase(args.base)
    assertBaseResolvable(base)

    const results: VersionEntry[] = []
    let errorCount = 0

    /**
     * `--npm` only: a version already on npm cannot be published again — `pnpm publish -r`
     * skips it, so the change would never reach consumers. Applies to changed *and* newly
     * added packages.
     */
    const checkAlreadyPublished = (entry: VersionEntry, name: string, version: string): number => {
      if (!args.npm || entry.errors.length > 0) return 0

      const published = publishedVersions(name)
      if (published === null) {
        entry.status = 'NPM LOOKUP FAILED'
        entry.errors.push('could not read published versions from npm — refusing to pass the gate on an unknown registry state')
        return 1
      }

      if (!published.includes(version)) return 0
      entry.status = 'ALREADY PUBLISHED'
      entry.errors.push(`version ${version} is already published on npm — bump before releasing`)
      return 1
    }

    for (const { name, relDir, localVersion: version } of listWorkspacePackages()) {
      const entry: VersionEntry = { name, version, status: 'unchanged', changedFiles: 0, baseVersion: null, errors: [] }

      const changed = changedFiles(base, relDir).filter((file) => affectsPublishedArtifact(file.slice(`${relDir}/`.length)))
      entry.changedFiles = changed.length

      if (changed.length === 0) {
        results.push(entry)
        continue
      }

      const baseVersion = versionAtRef(base, relDir)
      entry.baseVersion = baseVersion

      if (baseVersion === null) {
        // New package: no baseline version to compare against, but it can still carry a
        // version npm already has (a re-added package, or one published from another
        // branch) — which `pnpm publish -r` would skip.
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

    if (args.json) {
      const report: CheckVersionsReport = { base, results, errorCount }
      console.log(JSON.stringify(report, null, 2))
    } else {
      console.log(`Checked ${results.length} package(s) for version bumps against ${base}\n`)
      for (const entry of results) {
        if (entry.status === 'unchanged') continue
        console.log(`${entry.errors.length ? '✖' : '✓'} ${entry.name} (${entry.status}, ${entry.changedFiles} file(s) changed)`)
        for (const error of entry.errors) console.log(`    error: ${error}`)
      }
      const unchanged = results.filter((r) => r.status === 'unchanged').length
      console.log(`\nOK: ${results.length - errorCount}/${results.length} (unchanged: ${unchanged}, errors: ${errorCount})`)
    }

    if (errorCount > 0) process.exit(1)
  },
})
