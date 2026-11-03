import { describe, expect, it } from 'vitest'
import { tv as tvUpstream } from 'tailwind-variants'
import { tv } from './tv'

describe('tv re-export', () => {
  it('is the same function as tailwind-variants', () => {
    expect(tv).toBe(tvUpstream)
  })

  it('merges conflicting utilities by default', () => {
    const recipe = tv({
      base: 'p-2',
      variants: {
        size: {
          lg: 'p-4',
        },
      },
    })
    expect(recipe({ size: 'lg' })).toBe('p-4')
  })
})
