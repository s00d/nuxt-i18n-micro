import { describe, expect, it } from 'vitest'
import { compareVersions } from '../src/utils/semver'

const newer = (a: string, b: string) => expect(Math.sign(compareVersions(a, b))).toBe(1)
const equal = (a: string, b: string) => expect(compareVersions(a, b)).toBe(0)

describe('compareVersions', () => {
  it('orders core versions by each component', () => {
    newer('3.21.4', '3.21.3')
    newer('3.22.0', '3.21.99')
    newer('4.0.0', '3.99.99')
    equal('3.21.4', '3.21.4')
  })

  it('treats a release as newer than any prerelease of the same core', () => {
    newer('3.21.4', '3.21.4-beta.1')
    newer('3.21.4', '3.21.4-rc.99')
  })

  it('orders prereleases by identifier, numerically where both are numeric', () => {
    newer('3.21.4-beta.10', '3.21.4-beta.9')
    newer('3.21.4-beta.2', '3.21.4-alpha.99')
    // Fewer identifiers sort lower when the shared prefix matches.
    newer('3.21.4-beta.1', '3.21.4-beta')
  })

  it('ranks alphanumeric identifiers above numeric ones', () => {
    newer('3.21.4-alpha', '3.21.4-1')
  })

  it('ignores build metadata', () => {
    equal('3.21.4+build.7', '3.21.4+build.8')
    equal('3.21.4+build.7', '3.21.4')
  })

  it('keeps numeric identifiers past Number.MAX_SAFE_INTEGER distinct', () => {
    // Both round to 9007199254740992 as doubles; comparing as numbers reports them equal
    // and lets an older build win the release gate.
    newer('1.0.0-build.9007199254740993', '1.0.0-build.9007199254740992')
    newer('1.0.0-build.90071992547409931', '1.0.0-build.9007199254740993')
  })
})
