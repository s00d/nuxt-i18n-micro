import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineCommand } from 'citty'
import { assertBaseResolvable, run, tryRun } from '../utils/git-baseline'
import { parseManifest } from '../utils/manifest'
import { resolveFromTag } from '../utils/release-tag'
import { repoRoot } from '../utils/workspace'

/** Changelogen subject written by `pnpm -C scripts cli release`. */
export const RELEASE_COMMIT_SUBJECT = /^chore\(release\):\s*v?\d+\.\d+\.\d+\s*$/

export interface ReleaseSourceViolation {
  kind: 'local-dirty' | 'manual-version' | 'manual-changelog' | 'release-mismatch'
  message: string
}

export interface ReleaseSourceReport {
  ok: boolean
  from: string
  violations: ReleaseSourceViolation[]
}

function abort(violations: ReleaseSourceViolation[]): never {
  console.error('Release aborted: root version / CHANGELOG.md may only change via `pnpm -C scripts cli release`.')
  for (const v of violations) {
    console.error(`  - ${v.message}`)
  }
  process.exit(1)
}

function porcelainPaths(): string[] {
  const out = tryRun('git', ['status', '--porcelain', '--', 'package.json', 'CHANGELOG.md'])
  if (!out) return []
  // Porcelain is "XY path" — keep the leading status columns; trim only after slice.
  return out
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => line.slice(3).trim()) // " M path" / "M  path" / "MM path"
}

function commitsTouching(from: string, path: string): string[] {
  const out = tryRun('git', ['log', '--format=%H', `${from}..HEAD`, '--', path])
  if (!out) return []
  return out.split('\n').filter(Boolean)
}

function commitSubject(sha: string): string {
  return run('git', ['log', '-1', '--format=%s', sha])
}

function versionAt(ref: string): string | null {
  const raw = tryRun('git', ['show', `${ref}:package.json`])
  if (!raw) return null
  try {
    return String(parseManifest(raw).version ?? '')
  } catch {
    return null
  }
}

function short(sha: string): string {
  return sha.slice(0, 8)
}

/**
 * Root `package.json` version and `CHANGELOG.md` must only move through changelogen
 * (`pnpm -C scripts cli release`). Catches hand-edits in the working tree and in git
 * history since the previous release tag.
 */
export function checkReleaseSource(from?: string): ReleaseSourceReport {
  const baseline = from ?? resolveFromTag('ensure-release-source')
  assertBaseResolvable(baseline)

  const violations: ReleaseSourceViolation[] = []

  // --- local ---
  for (const line of porcelainPaths()) {
    const path = line.includes(' -> ') ? line.split(' -> ').pop()! : line
    if (path === 'CHANGELOG.md') {
      violations.push({
        kind: 'local-dirty',
        message: 'CHANGELOG.md has uncommitted changes. Revert them or produce the next entry with `pnpm -C scripts cli release`.',
      })
    }
    if (path === 'package.json') {
      const headVersion = versionAt('HEAD')
      const workVersion = String(parseManifest(readFileSync(join(repoRoot, 'package.json'), 'utf8')).version ?? '')
      if (headVersion && workVersion && headVersion !== workVersion) {
        violations.push({
          kind: 'local-dirty',
          message: `package.json version is ${workVersion} locally but ${headVersion} on HEAD — bump only via \`pnpm -C scripts cli release\`.`,
        })
      } else {
        violations.push({
          kind: 'local-dirty',
          message: 'package.json has uncommitted changes. Commit unrelated edits first, or leave version bumps to `pnpm -C scripts cli release`.',
        })
      }
    }
  }

  // --- git: CHANGELOG.md ---
  for (const sha of commitsTouching(baseline, 'CHANGELOG.md')) {
    const subject = commitSubject(sha)
    if (!RELEASE_COMMIT_SUBJECT.test(subject)) {
      violations.push({
        kind: 'manual-changelog',
        message: `${short(sha)} changed CHANGELOG.md outside the release CLI (${subject}).`,
      })
    }
  }

  // --- git: package.json version field ---
  for (const sha of commitsTouching(baseline, 'package.json')) {
    const before = versionAt(`${sha}^`)
    const after = versionAt(sha)
    if (!before || !after || before === after) continue

    const subject = commitSubject(sha)
    if (!RELEASE_COMMIT_SUBJECT.test(subject)) {
      violations.push({
        kind: 'manual-version',
        message: `${short(sha)} bumped root version ${before} → ${after} by hand (${subject}). Use \`pnpm -C scripts cli release\`.`,
      })
      continue
    }

    const expected = subject.match(/v?(\d+\.\d+\.\d+)/)?.[1]
    if (expected && expected !== after) {
      violations.push({
        kind: 'release-mismatch',
        message: `${short(sha)} subject is "${subject}" but package.json version is ${after}.`,
      })
    }
  }

  return { ok: violations.length === 0, from: baseline, violations }
}

export const ensureReleaseSourceCommand = defineCommand({
  meta: {
    name: 'ensure-release-source',
    description: [
      'Fail when root version or CHANGELOG.md were changed outside the release CLI.',
      '',
      'Root `package.json` version and `CHANGELOG.md` must only move through',
      '`pnpm -C scripts cli release` (changelogen). This checks the working tree and',
      'every commit since the previous release tag.',
      '',
      'Examples:',
      '  pnpm -C scripts cli ensure-release-source',
      '  pnpm -C scripts cli ensure-release-source --base v3.24.0',
      '  pnpm -C scripts cli ensure-release-source --json',
    ].join('\n'),
  },
  args: {
    base: {
      type: 'string',
      description: 'Baseline tag/ref (default: previous v3+ release tag on HEAD ancestry)',
    },
    json: { type: 'boolean', default: false, description: 'Print machine-readable output' },
  },
  setup({ args }) {
    const report = checkReleaseSource(args.base || undefined)

    if (args.json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
    }

    if (!report.ok) abort(report.violations)

    if (!args.json) {
      console.log(`release source ok (since ${report.from})`)
    }
  },
})
