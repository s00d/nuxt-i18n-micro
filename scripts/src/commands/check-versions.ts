import { defineCommand } from 'citty'
import { assertBaseResolvable, affectsPublishedArtifact, changedFiles, listWorkspacePackages, resolveBase, tryRun } from '../utils/git-baseline'
import { compareVersions } from '../utils/semver'

interface Entry {
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

function publishedVersions(name: string): string[] {
  const out = tryRun('npm', ['view', name, 'versions', '--json'])
  if (!out) return []
  try {
    const parsed = JSON.parse(out) as string | string[]
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return []
  }
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

    const results: Entry[] = []
    let errorCount = 0

    /**
     * `--npm` only: a version already on npm cannot be published again — `pnpm publish -r`
     * skips it, so the change would never reach consumers. Applies to changed *and* newly
     * added packages.
     */
    const checkAlreadyPublished = (entry: Entry, name: string, version: string): number => {
      if (!args.npm || entry.errors.length > 0) return 0
      if (!publishedVersions(name).includes(version)) return 0
      entry.status = 'ALREADY PUBLISHED'
      entry.errors.push(`version ${version} is already published on npm — bump before releasing`)
      return 1
    }

    for (const { name, relDir, localVersion: version } of listWorkspacePackages()) {
      const entry: Entry = { name, version, status: 'unchanged', changedFiles: 0, baseVersion: null, errors: [] }

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
      console.log(JSON.stringify({ base, results, errorCount }, null, 2))
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
