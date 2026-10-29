import { describe, expect, test } from 'untestutils/vitest'

describe('server', () => {
  test.override({ harness: 'basic' })
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

  test('a page without its own folder gets the root dictionary; made-up and oversized names stay bounded', async ({ request }) => {
    const index = await (await request.get('/_locales/index/en/data.json')).json()
    const unknown = await request.get('/_locales/no-such-page-123/en/data.json')
    expect(unknown.status()).toBe(200)
    const root = await unknown.json()
    // the root keys every page has, without index's own ones
    expect(Object.keys(root).length).toBeGreaterThan(0)
    expect(Object.keys(root).every((key) => key in index)).toBe(true)
    const oversized = await request.get(`/_locales/${'x'.repeat(201)}/en/data.json`)
    expect(oversized.status()).toBe(404)
  })
})
