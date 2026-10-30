import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

describe('journey: routing variants — hash mode + prefix + trailing slash', () => {
  test.override({ harness: 'strategy-hash-prefix-slash' })

  test('the redirect into the hash follows the slash rule', async ({ baseURL }) => {
    // step 1: a document moves to the same URL a link would have, query kept
    expect((await ssr(baseURL, '/en?q=1')).location).toBe('/#/en/?q=1')
  })
})
