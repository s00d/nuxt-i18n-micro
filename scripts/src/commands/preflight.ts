import { execFileSync } from 'node:child_process'
import { defineCommand } from 'citty'
import { listWorkspacePackages, tryRun } from '../utils/git-baseline'
import { resolveFromTag } from '../utils/release-tag'
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
function gatesFor(options: { npm: boolean; offline: boolean }): Gate[] {
  const registryOnly = () => (options.offline ? 'offline' : null)

  return [
    { name: 'deps-audit', args: ['deps-audit'] },
    { name: 'verify-packages', args: ['verify-packages', '--publint'] },
    { name: 'api-surface', args: ['api-surface'] },
    { name: 'docs-audit', args: ['docs-audit'] },
    { name: 'docs-data', args: ['docs-data', '--check'] },
    { name: 'check-versions', args: options.npm ? ['check-versions', '--npm'] : ['check-versions'], skip: options.npm ? registryOnly : undefined },
    { name: 'ensure-npm-auth', args: ['ensure-npm-auth'], skip: options.npm ? registryOnly : () => 'needs --npm' },
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
    ].join('\n'),
  },
  args: {
    npm: { type: 'boolean', default: false, description: 'Include the gates that talk to the registry' },
    offline: { type: 'boolean', default: false, description: 'Skip every gate that needs the network' },
    json: { type: 'boolean', default: false, description: 'Print machine-readable output' },
  },
  setup({ args }) {
    const report: PreflightReport = { gates: [], failed: 0, wouldPublish: [], from: null }

    for (const gate of gatesFor({ npm: args.npm, offline: args.offline })) {
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

    report.from = tryRun('git', ['tag', '-l']) === null ? null : resolveFromTagSafely()
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

/** `resolveFromTag` exits the process when there is no tag; preflight only wants the label. */
function resolveFromTagSafely(): string | null {
  const tags = tryRun('git', ['tag', '-l'])
  if (!tags) return null
  try {
    return resolveFromTag('preflight')
  } catch {
    return null
  }
}
