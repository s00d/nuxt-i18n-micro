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

/** Stops the command unless `value` is a level. `hint` ends the message. */
export function requireBumpLevel(value: unknown, flag: string, hint = ''): BumpLevel {
  if (isBumpLevel(value)) return value
  console.error(`Unknown ${flag} "${value ?? ''}". Pass --${flag} ${BUMP_LEVELS.join(' | ')}${hint}`)
  process.exit(1)
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
    const bump = requireBumpLevel(args.bump, 'bump')

    const from = resolveFromTag('release')

    console.log(`Releasing from ${from} (${bump})`)
    // `--no-github`: here the tag is not pushed yet. With a token GitHub would create `v<version>` on the
    // remote default branch (and the later `git push --follow-tags` is rejected); without one changelogen
    // opens a releases/new URL carrying the whole changelog. After the push: `changelogen gh release`.
    execFileSync('pnpm', ['exec', 'changelogen', '--release', '--no-github', '--from', from, `--${bump}`], {
      shell: process.platform === 'win32',
      stdio: 'inherit',
      cwd: repoRoot,
    })
  },
})
