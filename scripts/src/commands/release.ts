import { execFileSync } from 'node:child_process'
import { defineCommand } from 'citty'
import { resolveFromTag } from '../utils/release-tag'
import { repoRoot } from '../utils/workspace'

/** The maintainer names the level on every release: there is no default, and nothing reads it off commits. */
export const BUMP_LEVELS = ['patch', 'minor', 'major'] as const
export type BumpLevel = (typeof BUMP_LEVELS)[number]

export function isBumpLevel(value: unknown): value is BumpLevel {
  return BUMP_LEVELS.includes(value as BumpLevel)
}

export const releaseCommand = defineCommand({
  meta: {
    name: 'release',
    description: [
      'Bump the root version with `changelogen --release` against a safe `--from` ref.',
      '',
      'Without a level changelogen infers one from the commit messages, so `--bump` is',
      'required. Without an explicit `--from` it can bind to a legacy v1.x tag and write',
      'a changelog thousands of lines long, so the tag is resolved first.',
      '',
      'Examples:',
      '  pnpm -C scripts cli release --bump patch',
      '  pnpm -C scripts cli release --bump minor',
      '  pnpm -C scripts cli release --bump major',
    ].join('\n'),
  },
  args: {
    bump: {
      type: 'string',
      description: `Version bump, required: ${BUMP_LEVELS.join(' | ')}`,
    },
  },
  setup({ args }) {
    const bump = args.bump
    if (!isBumpLevel(bump)) {
      console.error(`Unknown bump "${bump ?? ''}". Pass --bump ${BUMP_LEVELS.join(' | ')}`)
      process.exit(1)
    }

    const from = resolveFromTag('release')

    console.log(`Releasing from ${from} (${bump})`)
    execFileSync('pnpm', ['exec', 'changelogen', '--release', '--from', from, `--${bump}`], { stdio: 'inherit', cwd: repoRoot })
  },
})
