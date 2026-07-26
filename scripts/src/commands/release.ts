import { execFileSync } from 'node:child_process'
import { defineCommand } from 'citty'
import { resolveFromTag } from '../utils/release-tag'
import { repoRoot } from '../utils/workspace'

const BUMPS = ['auto', 'patch', 'minor', 'major'] as const
type Bump = (typeof BUMPS)[number]

export const releaseCommand = defineCommand({
  meta: {
    name: 'release',
    description: [
      'Run `changelogen --release` against a safe `--from` ref.',
      '',
      'Without an explicit `--from`, changelogen can bind to a legacy v1.x tag and write',
      'a changelog thousands of lines long, so the tag is resolved first.',
      '',
      'Examples:',
      '  pnpm -C scripts cli release',
      '  pnpm -C scripts cli release --bump minor',
      '  pnpm -C scripts cli release --bump auto',
    ].join('\n'),
  },
  args: {
    bump: {
      type: 'string',
      default: 'patch',
      description: `Version bump: ${BUMPS.join(' | ')} ("auto" infers it from conventional commits)`,
    },
  },
  setup({ args }) {
    const bump = args.bump as Bump
    if (!BUMPS.includes(bump)) {
      console.error(`Unknown bump "${args.bump}". Expected one of: ${BUMPS.join(', ')}`)
      process.exit(1)
    }

    const from = resolveFromTag('release')
    const changelogenArgs = ['exec', 'changelogen', '--release', '--from', from]
    if (bump !== 'auto') changelogenArgs.push(`--${bump}`)

    console.log(`Releasing from ${from} (${bump})`)
    execFileSync('pnpm', changelogenArgs, { stdio: 'inherit', cwd: repoRoot })
  },
})
