import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineCommand } from 'citty'
import { indexSnapshot, indexSurface, readSurface, renderSurface } from '../utils/api-surface'
import { listWorkspacePackages } from '../utils/git-baseline'
import { repoRoot } from '../utils/workspace'

export interface SurfaceChange {
  pkg: string
  kind: 'removed' | 'changed' | 'added'
  symbol: string
  detail: string
}

export interface ApiSurfaceReport {
  packages: string[]
  breaking: SurfaceChange[]
  additions: SurfaceChange[]
  missingSnapshots: string[]
}

const SNAPSHOT_DIR = 'scripts/api-surface'

const snapshotName = (pkgName: string): string => `${pkgName.replace('@', '').replace('/', '__')}.api.txt`

export const apiSurfaceCommand = defineCommand({
  meta: {
    name: 'api-surface',
    description: [
      "Compare every package's exported API against a committed snapshot.",
      '',
      'Removing an export or changing its type breaks consumers, and nothing else in this',
      'repo notices: the package still builds, still passes its tests, and still',
      'publishes. This turns that into a diff a reviewer can read, and a list to paste',
      'into the release notes.',
      '',
      'The surface is read from `src` through the TypeScript program, so no build is',
      'needed and a stale `dist` cannot hide a change.',
      '',
      'Examples:',
      '  pnpm -C scripts cli api-surface',
      '  pnpm -C scripts cli api-surface --update    # accept the current surface',
      '  pnpm -C scripts cli api-surface --json',
    ].join('\n'),
  },
  args: {
    update: { type: 'boolean', default: false, description: 'Rewrite the snapshots instead of comparing' },
    package: { type: 'string', description: 'Only this package (directory name)' },
    json: { type: 'boolean', default: false, description: 'Print machine-readable output' },
  },
  setup({ args }) {
    const snapshotDir = join(repoRoot, SNAPSHOT_DIR)
    mkdirSync(snapshotDir, { recursive: true })

    const packages = listWorkspacePackages(args.package ?? null)
    const report: ApiSurfaceReport = { packages: [], breaking: [], additions: [], missingSnapshots: [] }
    const written = new Set<string>()

    for (const { name, dir, pkg } of packages) {
      const surface = readSurface(dir, pkg)
      if (surface.length === 0) continue

      report.packages.push(name)
      const file = join(snapshotDir, snapshotName(name))
      written.add(snapshotName(name))
      const rendered = renderSurface(surface)

      if (args.update) {
        writeFileSync(file, rendered)
        continue
      }

      if (!existsSync(file)) {
        report.missingSnapshots.push(name)
        continue
      }

      const before = indexSnapshot(readFileSync(file, 'utf8'))
      const after = indexSurface(surface)

      for (const [key, signature] of before) {
        const current = after.get(key)
        if (current === undefined) {
          report.breaking.push({ pkg: name, kind: 'removed', symbol: key, detail: signature })
        } else if (current !== signature) {
          report.breaking.push({ pkg: name, kind: 'changed', symbol: key, detail: `${signature}  ->  ${current}` })
        }
      }

      for (const [key, signature] of after) {
        if (!before.has(key)) report.additions.push({ pkg: name, kind: 'added', symbol: key, detail: signature })
      }
    }

    // Only prune when the whole workspace was inspected; --package sees one snapshot.
    if (args.update && !args.package) {
      for (const file of readdirSync(snapshotDir)) {
        if (file.endsWith('.api.txt') && !written.has(file)) rmSync(join(snapshotDir, file))
      }
    }

    if (args.json) {
      console.log(JSON.stringify(report, null, 2))
    } else if (args.update) {
      console.log(`Wrote ${report.packages.length} snapshot(s) to ${SNAPSHOT_DIR}/`)
    } else {
      console.log(`Compared ${report.packages.length} package(s) against ${SNAPSHOT_DIR}/\n`)

      for (const change of report.breaking) console.log(`  x ${change.pkg} ${change.kind} ${change.symbol}\n      ${change.detail}`)
      for (const change of report.additions) console.log(`  + ${change.pkg} ${change.symbol}: ${change.detail}`)
      for (const name of report.missingSnapshots) console.log(`  ? ${name} has no snapshot - run with --update`)

      if (report.breaking.length > 0) {
        console.log(`\n${report.breaking.length} breaking change(s). If intended, describe them in docs/news and run --update.`)
      } else {
        console.log(`\nNo breaking changes. Additions: ${report.additions.length}.`)
      }
    }

    if (!args.update && (report.breaking.length > 0 || report.missingSnapshots.length > 0)) process.exit(1)
  },
})
