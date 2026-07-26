import { defineCommand } from 'citty'
import { run, tryRun } from '../utils/git-baseline'

/** Compare `vX.Y.Z` tags numerically. */
function compareTags(a: string, b: string): number {
  const parse = (tag: string) =>
    tag
      .slice(1)
      .split('.')
      .map((n) => Number.parseInt(n, 10))
  const va = parse(a)
  const vb = parse(b)
  for (let i = 0; i < 3; i++) {
    const diff = (va[i] ?? 0) - (vb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

export const changelogFromRefCommand = defineCommand({
  meta: {
    name: 'changelog-from-ref',
    description: [
      'Print the tag changelogen should generate from: the highest v3+ tag on the',
      'ancestry of HEAD.',
      '',
      'The repo carries hundreds of legacy v1.x tags, and both `git describe` and',
      "changelogen's own default happily bind to one of them — which produces a",
      'changelog thousands of lines long.',
      '',
      'Example:',
      '  pnpm -C scripts cli changelog-from-ref',
    ].join('\n'),
  },
  setup() {
    let tags: string[]
    try {
      tags = run('git', ['tag', '-l']).split('\n').filter(Boolean)
    } catch (error) {
      console.error('changelog-from-ref: not a git repository or git failed:', (error as Error).message)
      process.exit(1)
    }

    const fromV3 = tags
      .filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag))
      .filter((tag) => Number.parseInt(tag.slice(1).split('.')[0]!, 10) >= 3)
      .sort((a, b) => compareTags(b, a))

    for (const tag of fromV3) {
      if (tryRun('git', ['merge-base', '--is-ancestor', tag, 'HEAD']) !== null) {
        process.stdout.write(tag)
        return
      }
    }

    console.error('changelog-from-ref: no v3+ semver tag found on the ancestry of HEAD. Tag a release first.')
    process.exit(1)
  },
})
