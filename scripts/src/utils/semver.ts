/**
 * Just enough semver to compare two published versions.
 *
 * A dependency would be overkill for one comparison, but the ordering rules that
 * matter here are easy to get wrong: numeric identifiers compare numerically, a
 * release outranks any prerelease of the same core version, and build metadata is
 * ignored entirely.
 */
function comparePrerelease(a: string, b: string): number {
  const idsA = a.split('.')
  const idsB = b.split('.')
  const length = Math.max(idsA.length, idsB.length)

  for (let i = 0; i < length; i++) {
    const idA = idsA[i]
    const idB = idsB[i]
    if (idA === undefined) return -1
    if (idB === undefined) return 1
    if (idA === idB) continue

    const numA = /^\d+$/.test(idA) ? idA.replace(/^0+(?=\d)/, '') : null
    const numB = /^\d+$/.test(idB) ? idB.replace(/^0+(?=\d)/, '') : null
    if (numA !== null && numB !== null) {
      // Compared as digit strings, not numbers: a build-stamp identifier can exceed
      // Number.MAX_SAFE_INTEGER, and past that `Number()` rounds two different
      // identifiers to the same value and reports them equal.
      if (numA.length !== numB.length) return numA.length - numB.length
      return numA === numB ? 0 : numA < numB ? -1 : 1
    }
    // Numeric identifiers always have lower precedence than alphanumeric ones.
    if (numA !== null) return -1
    if (numB !== null) return 1
    return idA < idB ? -1 : 1
  }
  return 0
}

/**
 * Does `version` satisfy a tiny subset of npm ranges used in published workspace pins:
 * exact `1.2.3`, caret `^1.2.3`, tilde `~1.2.3`.
 */
export function versionSatisfiesRange(version: string, range: string): boolean {
  const pin = String(range).trim()
  if (!pin || pin === '*' || pin === 'x' || pin === 'X') return true

  if (/^\d/.test(pin)) return compareVersions(version, pin) === 0

  const caret = /^\^(\d+\.\d+\.\d+(?:-[\w.-]+)?)/.exec(pin)
  if (caret) {
    const base = caret[1]!
    if (compareVersions(version, base) < 0) return false
    const [maj = 0, min = 0] = base.split('.').map((n) => Number.parseInt(n, 10) || 0)
    const [vMaj = 0, vMin = 0] = String(version)
      .split('.')
      .map((n) => Number.parseInt(n, 10) || 0)
    if (maj === 0) return vMaj === 0 && vMin === min
    return vMaj === maj
  }

  const tilde = /^~(\d+\.\d+\.\d+(?:-[\w.-]+)?)/.exec(pin)
  if (tilde) {
    const base = tilde[1]!
    if (compareVersions(version, base) < 0) return false
    const [maj = 0, min = 0] = base.split('.').map((n) => Number.parseInt(n, 10) || 0)
    const [vMaj = 0, vMin = 0] = String(version)
      .split('.')
      .map((n) => Number.parseInt(n, 10) || 0)
    return vMaj === maj && vMin === min
  }

  return false
}

/** >0 when `a` is newer, <0 when older, 0 when equal. */
export function compareVersions(a: string, b: string): number {
  const parse = (version: string) => {
    const [withoutBuild = ''] = String(version).split('+', 1)
    const dashAt = withoutBuild.indexOf('-')
    const core = dashAt === -1 ? withoutBuild : withoutBuild.slice(0, dashAt)
    const pre = dashAt === -1 ? '' : withoutBuild.slice(dashAt + 1)
    const nums = core.split('.').map((n) => Number.parseInt(n, 10) || 0)
    return { nums, pre }
  }

  const va = parse(a)
  const vb = parse(b)
  for (let i = 0; i < 3; i++) {
    const diff = (va.nums[i] ?? 0) - (vb.nums[i] ?? 0)
    if (diff !== 0) return diff
  }

  // A release outranks any prerelease of the same core version.
  if (va.pre === vb.pre) return 0
  if (!va.pre) return 1
  if (!vb.pre) return -1
  return comparePrerelease(va.pre, vb.pre)
}
