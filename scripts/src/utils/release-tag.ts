/**
 * Which tag a release counts from.
 *
 * The repo carries hundreds of legacy v1.x tags, and both `git describe` and
 * changelogen's own default happily bind to one of them — which produces a changelog
 * thousands of lines long. Hence: highest `vX.Y.Z` with X >= 3 that is an ancestor
 * of HEAD.
 *
 * Shared by `release` and `changelog-from-ref` so the version they bump from and the
 * range the changelog covers cannot drift apart.
 */
import { run, tryRun } from './git-baseline'

const SEMVER_TAG = /^v\d+\.\d+\.\d+$/

/** Compare `vX.Y.Z` tags numerically. */
export function compareTags(a: string, b: string): number {
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

/** v3+ semver tags, newest first. Legacy v1/v2 tags are dropped. */
export function releaseTags(tags: string[]): string[] {
  return tags
    .filter((tag) => SEMVER_TAG.test(tag))
    .filter((tag) => Number.parseInt(tag.slice(1).split('.')[0]!, 10) >= 3)
    .sort((a, b) => compareTags(b, a))
}

/** Highest v3+ tag on the ancestry of HEAD. Exits when there is none. */
export function resolveFromTag(command: string): string {
  let tags: string[]
  try {
    tags = run('git', ['tag', '-l']).split('\n').filter(Boolean)
  } catch (error) {
    console.error(`${command}: not a git repository or git failed:`, (error as Error).message)
    process.exit(1)
  }

  for (const tag of releaseTags(tags)) {
    if (tryRun('git', ['merge-base', '--is-ancestor', tag, 'HEAD']) !== null) return tag
  }

  console.error(`${command}: no v3+ semver tag found on the ancestry of HEAD. Tag a release first.`)
  process.exit(1)
}
