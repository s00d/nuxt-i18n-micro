import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

describe('journey: prefix_and_default answers the same to everyone', () => {
  test.override({ harness: 'strategy-prefix-and-default' })

  test('no Vary on an unprefixed URL', async ({ baseURL }) => {
    // step 1: / never redirects, with or without a preference
    const res = await ssr(baseURL, '/', { cookie: 'user-locale=de', accept: 'text/html' })
    expect(res.status).toBe(200)
    expect(res.headers.get('vary') ?? '').not.toContain('Cookie')
  })
})
