import { describe, expect, it } from 'vitest'
import { isTranslationFile } from './helpers/is-translation-file'

describe('isTranslationFile (#237 fair split)', () => {
  it('counts all chunks/raw files as translations (hashed @nuxtjs/i18n + micro)', () => {
    expect(isTranslationFile('/app/.output/public/_nuxt/chunks/raw/AbCdEf12.mjs')).toBe(true)
    expect(isTranslationFile('/app/.output/public/_nuxt/chunks/raw/en4.mjs')).toBe(true)
    expect(isTranslationFile('/app/.output/server/chunks/raw/de-hash.mjs')).toBe(true)
  })

  it('counts locale JSON under locales/', () => {
    expect(isTranslationFile('/app/.output/public/_locales/en/pages/index.json')).toBe(true)
    expect(isTranslationFile('/app/.output/public/locales/en.json')).toBe(true)
  })

  it('counts locale-prefixed chunks/_ and chunks/build', () => {
    expect(isTranslationFile('/app/.output/public/_nuxt/chunks/_/en.mjs')).toBe(true)
    expect(isTranslationFile('/app/.output/public/_nuxt/chunks/_/ja.mjs')).toBe(true)
    expect(isTranslationFile('/app/.output/public/_nuxt/chunks/build/de-DNSlf_yQ.mjs')).toBe(true)
    expect(isTranslationFile('/app/.output/public/_nuxt/chunks/build/zh-CN-abc123.mjs')).toBe(true)
  })

  it('does not count ordinary app chunks as translations', () => {
    expect(isTranslationFile('/app/.output/public/_nuxt/entry.mjs')).toBe(false)
    expect(isTranslationFile('/app/.output/public/_nuxt/chunks/build/Page-abc123.mjs')).toBe(false)
    expect(isTranslationFile('/app/.output/server/chunks/nitro/nitro.mjs')).toBe(false)
  })
})
