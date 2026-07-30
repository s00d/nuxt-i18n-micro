import { defineCommand } from 'citty'
import { isWorkspaceProtocol } from '../utils/catalog'
import {
  assertBaseResolvable,
  affectsPublishedArtifact,
  changedFiles,
  listWorkspacePackages,
  resolveBase,
  runCapture,
  tryRun,
  type WorkspacePackage,
} from '../utils/git-baseline'
import { INSTALLED_DEPENDENCY_FIELDS } from '../utils/manifest'
import { compareVersions, versionSatisfiesRange } from '../utils/semver'

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

function publishedDependencies(name: string, version: string): Record<string, string> | null {
  const { ok, stdout } = runCapture('npm', ['view', `${name}@${version}`, 'dependencies', '--json'])
  if (!ok && !stdout) return null
  if (!stdout || stdout === 'null' || stdout === '{}') return {}

  try {
    const parsed = JSON.parse(stdout) as unknown
    if (isNpmError(parsed as NpmViewVersions)) {
      return (parsed as NpmViewError).error.code === 'E404' ? {} : null
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    return parsed as Record<string, string>
  } catch {
    return null
  }
}

function workspaceDependencyNames(pkg: WorkspacePackage['pkg'], workspaceNames: Set<string>): string[] {
  const names: string[] = []
  for (const field of INSTALLED_DEPENDENCY_FIELDS) {
    if (field === 'peerDependencies') continue
    for (const [dep, spec] of Object.entries(pkg[field] ?? {})) {
      if (workspaceNames.has(dep) && isWorkspaceProtocol(String(spec))) names.push(dep)
    }
  }
  return names
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
      'Also fails when a dependency was bumped but a dependent was not (so publish would',
      'leave an old pin on npm), and with `--npm` when an already-published version still',
      'pins an outdated exact workspace dependency.',
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
    const packages = listWorkspacePackages()
    const byName = new Map(packages.map((p) => [p.name, p]))
    const workspaceNames = new Set(byName.keys())
    const entryByName = new Map<string, VersionEntry>()

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

    for (const { name, relDir, localVersion: version } of packages) {
      const entry: VersionEntry = { name, version, status: 'unchanged', changedFiles: 0, baseVersion: null, errors: [] }
      entryByName.set(name, entry)

      const changed = changedFiles(base, relDir).filter((file) => affectsPublishedArtifact(file.slice(`${relDir}/`.length)))
      entry.changedFiles = changed.length
      entry.baseVersion = versionAtRef(base, relDir)

      if (changed.length === 0) {
        results.push(entry)
        continue
      }

      const baseVersion = entry.baseVersion

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

    // Cascade: if W was bumped (or needs a bump), every dependent D must also be bumped.
    // Otherwise `pnpm publish -r` republishes W with a new version while D keeps an old
    // tarball whose dependency pin still points at the previous W.
    const bumpedOrNeedsBump = new Set<string>()
    for (const entry of results) {
      const baseVersion = entry.baseVersion
      if (entry.status === 'NEEDS BUMP' || entry.status.startsWith('bumped ')) {
        bumpedOrNeedsBump.add(entry.name)
        continue
      }
      if (baseVersion && compareVersions(entry.version, baseVersion) > 0) {
        bumpedOrNeedsBump.add(entry.name)
      }
    }

    for (const pkg of packages) {
      const entry = entryByName.get(pkg.name)!
      for (const dep of workspaceDependencyNames(pkg.pkg, workspaceNames)) {
        if (!bumpedOrNeedsBump.has(dep)) continue
        const depPkg = byName.get(dep)!
        const baseVersion = entry.baseVersion
        if (baseVersion && compareVersions(entry.version, baseVersion) > 0) continue
        if (entry.errors.some((e) => e.includes(`depends on ${dep}`))) continue
        const hadErrors = entry.errors.length > 0
        entry.status = 'NEEDS BUMP'
        entry.errors.push(
          `depends on ${dep} which was bumped to ${depPkg.localVersion} — bump ${pkg.name} so publish rewrites the dependency pin (workspace:^ → ^${depPkg.localVersion})`,
        )
        if (!hadErrors) errorCount++
        bumpedOrNeedsBump.add(pkg.name)
      }
    }

    // `--npm`: version already on the registry would be skipped — if that frozen tarball
    // still pins an outdated exact (or unsatisfiable) workspace dependency, fail loudly.
    if (args.npm) {
      for (const pkg of packages) {
        const entry = entryByName.get(pkg.name)!
        const published = publishedVersions(pkg.name)
        if (published === null) {
          if (entry.errors.length === 0) {
            entry.status = 'NPM LOOKUP FAILED'
            entry.errors.push('could not read published versions from npm — refusing to pass the gate on an unknown registry state')
            errorCount++
          }
          continue
        }
        if (!published.includes(pkg.localVersion)) continue

        const npmDeps = publishedDependencies(pkg.name, pkg.localVersion)
        if (npmDeps === null) {
          entry.status = 'NPM LOOKUP FAILED'
          entry.errors.push(`could not read ${pkg.name}@${pkg.localVersion} dependencies from npm`)
          errorCount++
          continue
        }

        for (const dep of workspaceDependencyNames(pkg.pkg, workspaceNames)) {
          const pin = npmDeps[dep]
          if (!pin) continue
          const localDepVersion = byName.get(dep)!.localVersion
          const exact = /^\d/.test(pin.trim())
          const staleExact = exact && pin.trim() !== localDepVersion
          const unsatisfiedRange = !exact && !versionSatisfiesRange(localDepVersion, pin)
          if (!staleExact && !unsatisfiedRange) continue
          entry.status = 'STALE DEP PIN'
          entry.errors.push(
            `${pkg.name}@${pkg.localVersion} on npm pins ${dep}@${pin} but workspace has ${localDepVersion} — bump ${pkg.name} to republish (workspace:^), or \`pnpm publish -r\` will keep the old pin`,
          )
          errorCount++
        }
      }
    }

    if (args.json) {
      const report: CheckVersionsReport = { base, results, errorCount }
      console.log(JSON.stringify(report, null, 2))
    } else {
      console.log(`Checked ${results.length} package(s) for version bumps against ${base}\n`)
      for (const entry of results) {
        if (entry.status === 'unchanged' && entry.errors.length === 0) continue
        console.log(`${entry.errors.length ? '✖' : '✓'} ${entry.name} (${entry.status}, ${entry.changedFiles} file(s) changed)`)
        for (const error of entry.errors) console.log(`    error: ${error}`)
      }
      const unchanged = results.filter((r) => r.status === 'unchanged' && r.errors.length === 0).length
      console.log(`\nOK: ${results.length - errorCount}/${results.length} (unchanged: ${unchanged}, errors: ${errorCount})`)
    }

    if (errorCount > 0) process.exit(1)
  },
})
