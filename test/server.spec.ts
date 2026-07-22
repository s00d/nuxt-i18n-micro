import { describe, expect, setupE2E, test } from './setup/vitest-e2e'

await setupE2E({ shared: 'basic' })

describe('server', () => {
  test('test server-side translations', async ({ request }) => {
    // Test for English locale
    const responseEn = await request.get('/api/server?locale=en')
    expect(responseEn.status()).toBe(200)
    const bodyEn = await responseEn.json()
    expect(bodyEn).toEqual({ hello: 'test_val_en' }) // Check the response for English locale

    // Test for Russian locale
    const responseRu = await request.get('/api/server?locale=ru')
    expect(responseRu.status()).toBe(200)
    const bodyRu = await responseRu.json()
    expect(bodyRu).toEqual({ hello: 'test_val_ru' }) // Check the response for Russian locale
  })
})
