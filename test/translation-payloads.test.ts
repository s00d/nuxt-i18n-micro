import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveTranslationPayloadOptions, resolveTranslationPayloadPublicDir } from '../src/module'

describe('translationPayloads build options', () => {
  it('keeps all local payload outputs enabled by default', () => {
    expect(resolveTranslationPayloadOptions({})).toEqual({
      serverAssets: true,
      serverHandler: true,
      publicAssets: true,
      prerenderRoutes: true,
      publicDir: undefined,
    })
  })

  it('can disable individual local payload outputs', () => {
    expect(
      resolveTranslationPayloadOptions({
        translationPayloads: {
          serverAssets: false,
          serverHandler: false,
          publicAssets: false,
          prerenderRoutes: false,
          publicDir: '_payloads',
        },
      }),
    ).toEqual({
      serverAssets: false,
      serverHandler: false,
      publicAssets: false,
      prerenderRoutes: false,
      publicDir: '_payloads',
    })
  })

  it('resolves the public payload directory from publicDir, translationDir, or locales', () => {
    expect(resolveTranslationPayloadPublicDir('/dist/public', {})).toBe(join('/dist/public', 'locales'))
    expect(resolveTranslationPayloadPublicDir('/dist/public', { translationDir: 'i18n/locales' })).toBe(join('/dist/public', 'i18n/locales'))
    expect(resolveTranslationPayloadPublicDir('/dist/public', { translationPayloads: { publicDir: '_payloads' } })).toBe(
      join('/dist/public', '_payloads'),
    )
  })
})
