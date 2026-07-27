import { execFileSync } from 'node:child_process'
import { defineCommand } from 'citty'
import { listWorkspacePackages, tryRun } from '../utils/git-baseline'
import { releaseTags } from '../utils/release-tag'
import { repoRoot, scriptsDir } from '../utils/workspace'

export interface GateResult {
  name: string
  ok: boolean
  skipped: boolean
  detail: string
}

export interface PreflightReport {
  gates: GateResult[]
  failed: number
  wouldPublish: { name: string; version: string }[]
  from: string | null
}

interface Gate {
  name: string
  args: string[]
  /** Why this gate might not apply to the current run. */
  skip?: () => string | null
}

/** Every gate a release has to pass, in the order that fails cheapest first. */
function gatesFor(options: { npm: boolean; offline: boolean; budget: boolean }): Gate[] {
  const registryOnly = () => (options.offline ? 'offline' : null)

  return [
    { name: 'deps-audit', args: ['deps-audit'] },
    { name: 'verify-packages', args: ['verify-packages', '--publint'] },
    { name: 'api-surface', args: ['api-surface'] },
    { name: 'docs-audit', args: ['docs-audit'] },
    { name: 'docs-generate', args: ['docs-generate', '--check'] },
    // `--strict` or the audit exits 0 on its own findings and the verdict would disagree
    // with the report printed above it.
    { name: 'fixtures-audit', args: ['fixtures-audit', '--strict'] },
    // `check-versions` resolves its baseline with `git fetch` under GITHUB_BASE_REF, so
    // it is a network gate even without --npm.
    { name: 'check-versions', args: options.npm ? ['check-versions', '--npm'] : ['check-versions'], skip: registryOnly },
    { name: 'ensure-npm-auth', args: ['ensure-npm-auth'], skip: options.npm ? registryOnly : () => 'needs --npm' },
    // Last on purpose: it builds an application, and discovering a packaging failure
    // after a ten-minute build defeats the point of ordering the gates at all.
    ...(options.budget ? [{ name: 'payload-budget', args: ['payload-budget'] }] : []),
  ]
}

export const preflightCommand = defineCommand({
  meta: {
    name: 'preflight',
    description: [
      'Run every release gate, publish nothing, and print one verdict.',
      '',
      'The release scripts chain these with `&&`, which stops at the first failure — so a',
      'run that fails on the first gate tells you nothing about the other five, and the',
      'fix-and-retry loop runs the whole chain again each time. This runs them all and',
      'reports together.',
      '',
      'Examples:',
      '  pnpm -C scripts cli preflight',
      '  pnpm -C scripts cli preflight --npm       # also check the registry and auth',
      '  pnpm -C scripts cli preflight --offline   # skip everything needing the network',
      '  pnpm -C scripts cli preflight --budget    # also build and check the payload budget',
    ].join('\n'),
  },
  args: {
    npm: { type: 'boolean', default: false, description: 'Include the gates that talk to the registry' },
    budget: { type: 'boolean', default: false, description: 'Also build the playground and check the payload budget' },
    offline: { type: 'boolean', default: false, description: 'Skip every gate that needs the network' },
    json: { type: 'boolean', default: false, description: 'Print machine-readable output' },
  },
  setup({ args }) {
    const report: PreflightReport = { gates: [], failed: 0, wouldPublish: [], from: null }

    for (const gate of gatesFor({ npm: args.npm, offline: args.offline, budget: args.budget })) {
      const skipReason = gate.skip?.() ?? null
      if (skipReason) {
        report.gates.push({ name: gate.name, ok: true, skipped: true, detail: skipReason })
        continue
      }

      try {
        execFileSync('pnpm', ['exec', 'tsx', './src/run.ts', ...gate.args], { cwd: scriptsDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
        report.gates.push({ name: gate.name, ok: true, skipped: false, detail: 'ok' })
      } catch (error) {
        const err = error as { stdout?: Buffer | string; stderr?: Buffer | string }
        const output = `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`.trim()
        // The gate's own summary is the last thing it prints; the build noise above it is not.
        const detail = output.split('\n').filter(Boolean).slice(-3).join(' | ') || 'failed'
        report.gates.push({ name: gate.name, ok: false, skipped: false, detail })
        report.failed++
      }
    }

    report.from = changelogBase()
    report.wouldPublish = listWorkspacePackages().map(({ name, localVersion }) => ({ name, version: localVersion }))

    if (args.json) {
      console.log(JSON.stringify(report, null, 2))
    } else {
      console.log('Release preflight\n')
      for (const gate of report.gates) {
        const mark = gate.skipped ? '-' : gate.ok ? 'ok' : 'x'
        console.log(`  ${mark.padEnd(3)}${gate.name.padEnd(18)}${gate.skipped ? `skipped (${gate.detail})` : gate.ok ? '' : gate.detail}`)
      }

      console.log(`\nWould publish ${report.wouldPublish.length} package(s)${report.from ? ` (changelog from ${report.from})` : ''}:`)
      for (const entry of report.wouldPublish) console.log(`  ${entry.name}@${entry.version}`)

      console.log(
        report.failed === 0
          ? '\nAll gates passed. Safe to release.'
          : `\n${report.failed} gate(s) failed. Rerun each one directly for its full output.`,
      )
    }

    if (report.failed > 0) process.exit(1)
  },
})

/**
 * The changelog base, or null when there is none.
 *
 * Not `resolveFromTag`: that exits the process when no v3+ tag is on the ancestry, which
 * in a preflight means the run dies before printing the verdict it was asked for.
 */
function changelogBase(): string | null {
  const tags = tryRun('git', ['tag', '-l'])
  if (!tags) return null

  for (const tag of releaseTags(tags.split('\n').filter(Boolean))) {
    if (tryRun('git', ['merge-base', '--is-ancestor', tag, 'HEAD']) !== null) return tag
  }
  return null
}
