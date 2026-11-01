import { execFileSync } from 'node:child_process'
import { defineCommand } from 'citty'
import { run, runCapture, tryRun } from '../utils/git-baseline'
import { repoRoot } from '../utils/workspace'
import { BUMP_LEVELS, requireBumpLevel } from './release'

/** Everything a publish needs besides the tests. Read-only: a gate that rewrites files leaves a dirty tree for `pnpm publish`. */
const CHECKS = [['format:check'], ['lint'], ['typecheck'], ['check:versions', '--', '--npm'], ['release:source'], ['compare:published']]

interface CiRun {
  databaseId: number
  name: string
  status: string
  conclusion: string
  url: string
}

type CiVerdict = { kind: 'passed' } | { kind: 'failed'; reason: string } | { kind: 'unknown'; reason: string }

/** The job that runs the tests in `ci.yml`. A run's own conclusion is not enough: closing a PR gives a green run with this job skipped. */
const TEST_JOB = 'ci'

/** `gh`'s JSON for these arguments, or why there is none. */
function ghJson<T>(args: string[]): { value: T } | { reason: string } {
  const { ok, stdout, stderr } = runCapture('gh', args)
  if (!ok) return { reason: `gh is missing, not logged in, or GitHub cannot be reached${stderr ? `: ${stderr}` : ''}` }
  try {
    return { value: JSON.parse(stdout) as T }
  } catch {
    return { reason: 'gh returned something other than JSON' }
  }
}

/** Did the test job itself pass in this run? */
function testJobPassed(run: CiRun): { value: boolean } | { reason: string } {
  const view = ghJson<{ jobs: { name: string; conclusion: string }[] }>(['run', 'view', String(run.databaseId), '--json', 'jobs'])
  if ('reason' in view) return view
  return { value: view.value.jobs.some((job) => job.name === TEST_JOB && job.conclusion === 'success') }
}

/** CI for `sha`: every run of `ci.yml`. A cancelled run says nothing, a superseded one is cancelled on purpose. */
export function ciVerdict(sha: string): CiVerdict {
  const list = ghJson<CiRun[]>(['run', 'list', '--commit', sha, '--workflow', 'ci.yml', '--json', 'databaseId,name,status,conclusion,url'])
  if ('reason' in list) return { kind: 'unknown', reason: list.reason }
  const runs = list.value

  const bad = runs.find((r) => r.status === 'completed' && !['success', 'cancelled', 'skipped'].includes(r.conclusion))
  if (bad) return { kind: 'failed', reason: `CI ${bad.conclusion} on ${sha}: ${bad.url}` }
  if (runs.some((r) => r.status !== 'completed')) return { kind: 'failed', reason: `CI is still running on ${sha}` }
  for (const run of runs.filter((r) => r.conclusion === 'success')) {
    const job = testJobPassed(run)
    if ('reason' in job) return { kind: 'unknown', reason: job.reason }
    if (job.value) return { kind: 'passed' }
  }
  return { kind: 'failed', reason: `no passed CI run for ${sha}. Push it and wait for CI` }
}

function refuse(message: string): never {
  console.error(`Refusing --ci-passed: ${message}. Rerun without the flag to run the tests here.`)
  process.exit(1)
}

/** The flag claims CI tested what ships, so the tree has to be the commit CI saw. */
function assertCiPassed(force: boolean): void {
  if (tryRun('git', ['status', '--porcelain'])) refuse('the working tree has uncommitted changes, which CI did not test')

  const sha = run('git', ['rev-parse', 'HEAD'])
  const verdict = ciVerdict(sha)
  if (verdict.kind === 'failed') refuse(verdict.reason)
  if (verdict.kind === 'unknown' && !force) {
    console.error(`Cannot check CI: ${verdict.reason}. Run \`gh auth login\`, or pass --force to confirm by hand that CI passed on ${sha}.`)
    process.exit(1)
  }

  const why = verdict.kind === 'passed' ? `CI passed on ${sha}` : `--force confirms CI passed on ${sha}, unchecked`
  console.log(`Skipping local tests: ${why}.`)
}

function step(args: string[]): void {
  console.log(`\n> pnpm ${args.join(' ')}`)
  execFileSync('pnpm', args, { stdio: 'inherit', cwd: repoRoot })
}

export const publishCommand = defineCommand({
  meta: {
    name: 'publish',
    description: [
      'Check, build, and publish: the one command behind `release:*`.',
      '',
      'Order: npm auth, prepack, format, lint, typecheck, check-versions --npm,',
      'ensure-release-source, compare-published, tests, the root bump when `--bump` is',
      'given, `pnpm publish -r`, `git push --follow-tags`. Without `--bump` the root stays',
      'where it is and only packages whose version is not on npm ship.',
      '',
      '`--ci-passed` skips the tests and nothing else, after checking with `gh` that the',
      '`ci` job passed on HEAD. A failed or missing run refuses, and so does a run with that',
      'job skipped (a closed PR). When `gh` cannot answer, `--force` is your confirmation;',
      'it does not override a failed run.',
      '',
      'Examples:',
      '  pnpm -C scripts cli publish --bump minor',
      '  pnpm -C scripts cli publish --bump minor --ci-passed',
      '  pnpm -C scripts cli publish --ci-passed',
      '  pnpm -C scripts cli publish --check-only',
    ].join('\n'),
  },
  args: {
    bump: { type: 'string', description: `Root version bump: ${BUMP_LEVELS.join(' | ')}. Omit to publish packages only` },
    ciPassed: { type: 'boolean', default: false, description: 'Skip local tests: CI already passed on HEAD (checked with gh)' },
    force: { type: 'boolean', default: false, description: 'With --ci-passed: confirm by hand when gh cannot check' },
    checkOnly: { type: 'boolean', default: false, description: 'Stop after the checks: no bump, no publish, no push' },
  },
  setup({ args }) {
    const { bump, ciPassed, force, checkOnly } = args
    if (bump !== undefined) requireBumpLevel(bump, 'bump', ', or no --bump for packages only')
    if (force && !ciPassed) {
      console.error('--force only confirms --ci-passed')
      process.exit(1)
    }

    if (ciPassed) assertCiPassed(force)

    if (!checkOnly) step(['run', 'release:auth'])
    step(['run', 'prepack'])
    for (const check of CHECKS) step(['run', ...check])
    if (!ciPassed) step(['run', 'test'])
    if (checkOnly) return

    // `pnpm publish` refuses a dirty tree, and by then the bump commit and the tag would exist
    if (tryRun('git', ['status', '--porcelain'])) refuse('the working tree has uncommitted changes, nothing was bumped or published')
    if (bump) step(['-C', 'scripts', 'cli', 'release', '--bump', bump])
    step(['publish', '-r'])
    console.log('\n> git push --follow-tags')
    execFileSync('git', ['push', '--follow-tags'], { stdio: 'inherit', cwd: repoRoot })
  },
})
