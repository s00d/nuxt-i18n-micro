import { describe, expect, it } from 'vitest'
import { compare as compareVersions, satisfies, valid } from 'semver'

const newer = (a: string, b: string) => expect(Math.sign(compareVersions(a, b))).toBe(1)
const equal = (a: string, b: string) => expect(compareVersions(a, b)).toBe(0)

describe('semver (scripts use the package, not a DIY parser)', () => {
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

  it('orders prereleases by identifier', () => {
    newer('3.21.4-beta.10', '3.21.4-beta.9')
    newer('3.21.4-beta.2', '3.21.4-alpha.99')
    newer('3.21.4-beta.1', '3.21.4-beta')
  })

  it('ignores build metadata', () => {
    equal('3.21.4+build.7', '3.21.4+build.8')
    equal('3.21.4+build.7', '3.21.4')
  })

  it('satisfies caret/tilde and rejects malformed exact pins', () => {
    expect(satisfies('1.0.11', '^1.0.8')).toBe(true)
    expect(satisfies('1.1.0', '~1.0.8')).toBe(false)
    expect(valid('6.0.3')).toBe('6.0.3')
    expect(valid('6.0.3-')).toBeNull()
    expect(valid('6.0.3-_')).toBeNull()
    expect(valid('^6.0.3')).toBeNull()
  })
})
