import { describe, expect, it } from 'vitest'
import { compareTags, releaseTags } from '../src/utils/release-tag'

describe('releaseTags', () => {
  it('drops the legacy v1/v2 tags the repo is full of', () => {
    expect(releaseTags(['v1.9.0', 'v2.0.4', 'v3.0.0'])).toEqual(['v3.0.0'])
  })

  it('drops anything that is not vX.Y.Z', () => {
    expect(releaseTags(['v3.1.0', 'nightly', 'v3.1', 'v3.1.0-beta.1', 'release-3.2.0'])).toEqual(['v3.1.0'])
  })

  it('returns newest first, numerically not lexically', () => {
    expect(releaseTags(['v3.9.0', 'v3.10.0', 'v3.21.4'])).toEqual(['v3.21.4', 'v3.10.0', 'v3.9.0'])
  })
})

describe('compareTags', () => {
  it('compares each component as a number', () => {
    expect(Math.sign(compareTags('v3.10.0', 'v3.9.0'))).toBe(1)
    expect(compareTags('v3.9.0', 'v3.9.0')).toBe(0)
  })
})
