import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { defineCommand } from 'citty'
import { walkFiles } from '../utils/fs-walk'
import { repoRoot } from '../utils/workspace'

/**
 * Build leftovers worth reporting. `node_modules` is deliberately absent: fixtures are
 * workspace packages (`test/fixtures/**` in pnpm-workspace.yaml), so pnpm installs into
 * every one of them and flagging that would bury the real findings.
 */
const STALE_DIRS = ['.nuxt', '.output', '.output-shared', '.nuxt-test', 'test-results']

const VITEST_CONFIGS = [
  'vitest.config.ts',
  'vitest.unit.config.ts',
  'vitest.integration.config.ts',
  'vitest.e2e.config.ts',
  'vitest.packages.config.ts',
  'vitest.performance.config.ts',
]

export interface FixtureEntry {
  name: string
  references: number
  staleDirs: string[]
}

export interface FixturesAuditReport {
  fixtures: FixtureEntry[]
  unreferenced: string[]
  withStaleDirs: string[]
}

/**
 * Fixture names mentioned anywhere in the test sources.
 *
 * Deliberately a substring search over the whole corpus rather than a path match: a
 * fixture can be reached through a variant table or a composed path, and a stricter
 * matcher would report those as unused. The cost of that choice is that a fixture whose
 * name is a substring of another (`basic` inside `basic-no-ssr`) is never reported —
 * which is the safe direction for a command whose output invites deletion.
 */
function referenceCounts(names: string[], searchRoots: string[]): Map<string, number> {
  const counts = new Map(names.map((name) => [name, 0]))

  for (const root of searchRoots) {
    if (!existsSync(root)) continue
    const files = statSync(root).isDirectory()
      ? walkFiles(root, {
          extensions: ['.ts', '.mts', '.js', '.mjs', '.json', '.yml', '.yaml'],
          skipDirs: new Set(['fixtures', 'node_modules', '.nuxt', '.output']),
        }).map((f) => join(root, f))
      : [root]

    for (const file of files) {
      const text = readFileSync(file, 'utf8')
      for (const name of names) {
        if (text.includes(name)) counts.set(name, counts.get(name)! + 1)
      }
    }
  }
  return counts
}

export const fixturesAuditCommand = defineCommand({
  meta: {
    name: 'fixtures-audit',
    description: [
      'Report test fixtures nothing references, and build leftovers committed inside them.',
      '',
      'There are dozens of fixtures and each one is a full Nuxt app, so a fixture that',
      'outlived the test it was written for is invisible — it just makes every full-suite',
      'run slower and every config change bigger.',
      '',
      'Reports; never deletes. A name can be composed at runtime, so a fixture listed here',
      'is a candidate to check, not a verdict.',
      '',
      'Examples:',
      '  pnpm -C scripts cli fixtures-audit',
      '  pnpm -C scripts cli fixtures-audit --json',
      '  pnpm -C scripts cli fixtures-audit --strict   # exit 1 on any finding',
    ].join('\n'),
  },
  args: {
    dir: { type: 'string', default: 'test/fixtures', description: 'Fixtures directory' },
    strict: { type: 'boolean', default: false, description: 'Exit non-zero when anything is reported' },
    json: { type: 'boolean', default: false, description: 'Print machine-readable output' },
  },
  setup({ args }) {
    const fixturesDir = join(repoRoot, args.dir)
    // A fixture can be named from a vitest config, a package.json script or a workflow,
    // not only from a test file — searching test/ alone reports those as unused.
    const searchRoots = [
      join(repoRoot, 'test'),
      join(repoRoot, '.github'),
      join(repoRoot, 'package.json'),
      ...VITEST_CONFIGS.map((name) => join(repoRoot, name)),
    ]

    if (!existsSync(fixturesDir)) {
      console.error(`No fixtures directory at ${fixturesDir}`)
      process.exit(1)
    }

    const names = walkFiles(fixturesDir, { extensions: ['package.json', 'nuxt.config.ts'], skipDirs: new Set([...STALE_DIRS, 'node_modules']) })
      .map((file) => file.split('/')[0]!)
      .filter((name, index, all) => all.indexOf(name) === index)
      .sort()

    const counts = referenceCounts(names, searchRoots)

    const fixtures: FixtureEntry[] = names.map((name) => ({
      name,
      references: counts.get(name) ?? 0,
      staleDirs: STALE_DIRS.filter((dir) => {
        const path = join(fixturesDir, name, dir)
        return existsSync(path) && statSync(path).isDirectory()
      }),
    }))

    const report: FixturesAuditReport = {
      fixtures,
      unreferenced: fixtures.filter((f) => f.references === 0).map((f) => f.name),
      withStaleDirs: fixtures.filter((f) => f.staleDirs.length > 0).map((f) => f.name),
    }

    if (args.json) {
      console.log(JSON.stringify(report, null, 2))
    } else {
      console.log(`Checked ${fixtures.length} fixture(s) in ${args.dir}\n`)

      if (report.unreferenced.length === 0) {
        console.log('✓ every fixture is referenced')
      } else {
        console.log(`Referenced by nothing in test/, .github/, package.json or a vitest config (${report.unreferenced.length}):`)
        for (const name of report.unreferenced) console.log(`  ? ${name}`)
      }

      if (report.withStaleDirs.length > 0) {
        console.log(`\nBuild leftovers inside fixtures (run \`pnpm run clean:test\`):`)
        for (const entry of fixtures.filter((f) => f.staleDirs.length > 0)) {
          console.log(`  ! ${entry.name} — ${entry.staleDirs.join(', ')}`)
        }
      }
      console.log()
    }

    if (args.strict && (report.unreferenced.length > 0 || report.withStaleDirs.length > 0)) process.exit(1)
  },
})
