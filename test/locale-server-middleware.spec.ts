import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  },
})

test.describe('locale server middleware', () => {
  test('should return locale information for English locale', async ({ request }) => {
    const response = await request.get('/api/locale-info?locale=en')
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.current).toBe('en')
    expect(body.data.default).toBe('en')
    expect(body.data.available).toContain('en')
    expect(body.data.available).toContain('ru')
    expect(body.data.isDefault).toBe(true)
    expect(body.data.isFallback).toBe(true)
    expect(body.data.locale).toBeDefined()
  })

  test('should return locale information for Russian locale', async ({ request }) => {
    const response = await request.get('/api/locale-info?locale=ru')
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.current).toBe('ru')
    expect(body.data.default).toBe('en')
    expect(body.data.available).toContain('en')
    expect(body.data.available).toContain('ru')
    expect(body.data.isDefault).toBe(false)
    expect(body.data.isFallback).toBe(false)
    expect(body.data.locale).toBeDefined()
  })

  test('should detect locale from Accept-Language header', async ({ request }) => {
    const response = await request.get('/api/locale-info', {
      headers: {
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
      },
    })
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.current).toBe('ru-RU')
  })

  test('should detect locale from cookie', async ({ request }) => {
    const response = await request.get('/api/locale-info', {
      headers: {
        Cookie: 'user-locale=ru',
      },
    })
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.current).toBe('ru')
  })

  test('should fallback to default locale when no locale detected', async ({ request }) => {
    const response = await request.get('/api/locale-info')
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.current).toBe('en')
    expect(body.data.isDefault).toBe(true)
  })

  test('should return correct locale structure', async ({ request }) => {
    const response = await request.get('/api/locale-info?locale=ru')
    expect(response.status()).toBe(200)

    const body = await response.json()
    const { data } = body

    // Check required fields
    expect(data).toHaveProperty('current')
    expect(data).toHaveProperty('default')
    expect(data).toHaveProperty('fallback')
    expect(data).toHaveProperty('available')
    expect(data).toHaveProperty('locale')
    expect(data).toHaveProperty('isDefault')
    expect(data).toHaveProperty('isFallback')

    // Check types
    expect(typeof data.current).toBe('string')
    expect(typeof data.default).toBe('string')
    expect(typeof data.fallback).toBe('string')
    expect(Array.isArray(data.available)).toBe(true)
    expect(typeof data.isDefault).toBe('boolean')
    expect(typeof data.isFallback).toBe('boolean')

    // Check locale object structure
    if (data.locale) {
      expect(data.locale).toHaveProperty('code')
      expect(typeof data.locale.code).toBe('string')
    }
  })
})
