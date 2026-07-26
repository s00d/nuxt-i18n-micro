import { execFileSync } from 'node:child_process'
import { defineCommand } from 'citty'
import { run, tryRun } from '../utils/git-baseline'
import { repoRoot } from '../utils/workspace'

const BUMPS = ['auto', 'patch', 'minor', 'major'] as const
type Bump = (typeof BUMPS)[number]

/** Highest v3+ tag on the ancestry of HEAD — see the `changelog-from-ref` command. */
function resolveFromTag(): string {
  const tags = run('git', ['tag', '-l']).split('\n').filter(Boolean)
  const candidates = tags
    .filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag))
    .filter((tag) => Number.parseInt(tag.slice(1).split('.')[0]!, 10) >= 3)
    .sort((a, b) => {
      const parse = (tag: string) =>
        tag
          .slice(1)
          .split('.')
          .map((n) => Number.parseInt(n, 10))
      const va = parse(b)
      const vb = parse(a)
      for (let i = 0; i < 3; i++) {
        const diff = (va[i] ?? 0) - (vb[i] ?? 0)
        if (diff !== 0) return diff
      }
      return 0
    })

  for (const tag of candidates) {
    if (tryRun('git', ['merge-base', '--is-ancestor', tag, 'HEAD']) !== null) return tag
  }

  console.error('release: no v3+ semver tag found on the ancestry of HEAD. Tag a release first.')
  process.exit(1)
}

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

    const from = resolveFromTag()
    const changelogenArgs = ['exec', 'changelogen', '--release', '--from', from]
    if (bump !== 'auto') changelogenArgs.push(`--${bump}`)

    console.log(`Releasing from ${from} (${bump})`)
    execFileSync('pnpm', changelogenArgs, { stdio: 'inherit', cwd: repoRoot })
  },
})
