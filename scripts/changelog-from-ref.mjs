#!/usr/bin/env node
/**
 * Resolves --from for changelogen: pick the highest v3+ semver tag that is an
 * ancestor of HEAD. The repo has hundreds of legacy v1.x tags; plain
 * `git describe` / changelogen's default can bind to v1.1.x and generate a
 * multi-thousand-line changelog.
 */
import { execSync } from 'node:child_process'

function semverCmp(a, b) {
  const va = a.slice(1).split('.').map((n) => Number.parseInt(n, 10))
  const vb = b.slice(1).split('.').map((n) => Number.parseInt(n, 10))
  for (let i = 0; i < 3; i++) {
    const da = va[i] ?? 0
    const db = vb[i] ?? 0
    if (da !== db) return da - db
  }
  return 0
}

function isAncestor(tag, head = 'HEAD') {
  try {
    execSync(`git merge-base --is-ancestor "${tag}" "${head}"`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function main() {
  let raw
  try {
    raw = execSync('git tag -l', { encoding: 'utf8' }).trim().split(/\n/).filter(Boolean)
  } catch (e) {
    console.error('changelog-from-ref: not a git repository or git failed:', e.message)
    process.exit(1)
  }

  const semverLike = raw.filter((t) => /^v\d+\.\d+\.\d+$/.test(t))
  const fromV3 = semverLike.filter((t) => {
    const major = Number.parseInt(t.slice(1).split('.')[0], 10)
    return Number.isFinite(major) && major >= 3
  })

  fromV3.sort((a, b) => semverCmp(b, a))

  for (const tag of fromV3) {
    if (isAncestor(tag)) {
      process.stdout.write(tag)
      return
    }
  }

  console.error(
    'changelog-from-ref: no v3+ semver tag found on the ancestry of HEAD. Tag a release first.',
  )
  process.exit(1)
}

main()
