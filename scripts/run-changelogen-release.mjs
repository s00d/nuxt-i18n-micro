#!/usr/bin/env node
/**
 * Runs changelogen --release with a safe --from ref (see changelog-from-ref.mjs).
 * Usage: node scripts/run-changelogen-release.mjs [auto|patch|minor|major]
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const fromScript = fileURLToPath(new URL('./changelog-from-ref.mjs', import.meta.url))

const from = execFileSync(process.execPath, [fromScript], { encoding: 'utf8', cwd: root }).trim()
const mode = process.argv[2] ?? 'patch'

const args = ['exec', 'changelogen', '--release', '--from', from]

if (mode === 'auto') {
  // inferred bump from conventional commits
} else if (mode === 'patch' || mode === 'minor' || mode === 'major') {
  args.push(`--${mode}`)
} else {
  console.error('Usage: node scripts/run-changelogen-release.mjs [auto|patch|minor|major]')
  process.exit(1)
}

execFileSync('pnpm', args, { stdio: 'inherit', cwd: root })
