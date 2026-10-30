import { describe, expect, test } from 'vitest'
import { TranslationHelper } from '../src/storage'

describe('leaf cache', () => {
  test('a page with thousands of keys hits on the second render', () => {
    const keys = Array.from({ length: 3125 }, (_, i) => `section.key${i}`)
    let reads = 0
    const section = new Proxy(Object.fromEntries(keys.map((key) => [key.slice('section.'.length), key])), {
      get(target, prop, receiver) {
        reads++
        return Reflect.get(target, prop, receiver)
      },
    })
    const helper = new TranslationHelper()
    helper.setTranslations('en', { section })

    for (const key of keys) expect(helper.getTranslation('en', 'index', key)).toBe(key)
    expect(reads).toBeGreaterThan(0)

    reads = 0
    for (const key of keys) helper.getTranslation('en', 'index', key)
    expect(reads).toBe(0)
  })
})
