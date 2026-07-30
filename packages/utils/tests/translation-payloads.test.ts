import { join } from 'node:path'
import {
  resolveTranslationPayloadOptions,
  resolveTranslationPayloadPublicDir,
  resolveTranslationPayloadPublicRel,
  shouldCopyTranslationPayloadsToPublic,
  shouldRegisterNitroServerAssets,
} from '../src/payload-config'
import { describe, expect, it } from 'vitest'

describe('translationPayloads build options', () => {
  it('keeps local payload outputs enabled by default (except prerender)', () => {
    expect(resolveTranslationPayloadOptions({})).toEqual({
      mode: 'premerged',
      serverAssets: true,
      serverHandler: true,
      publicAssets: true,
      prerenderRoutes: false,
      publicDir: undefined,
      warnFileCount: undefined,
      warnSizeBytes: undefined,
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
      mode: 'premerged',
      serverAssets: false,
      serverHandler: false,
      publicAssets: false,
      prerenderRoutes: false,
      publicDir: '_payloads',
      warnFileCount: undefined,
      warnSizeBytes: undefined,
    })
  })

  it('resolves the public payload directory from publicDir or apiBaseUrl', () => {
    expect(resolveTranslationPayloadPublicRel({})).toBe('_locales')
    expect(resolveTranslationPayloadPublicRel({ apiBaseUrl: 'i18n-data' })).toBe('i18n-data')
    expect(resolveTranslationPayloadPublicRel({ translationDir: 'i18n/locales' })).toBe('_locales')
    expect(resolveTranslationPayloadPublicRel({ translationPayloads: { publicDir: '_payloads' } })).toBe('_payloads')
    expect(resolveTranslationPayloadPublicDir('/dist/public', {})).toBe(join('/dist/public', '_locales'))
    expect(resolveTranslationPayloadPublicDir('/dist/public', { apiBaseUrl: '/_locales/' })).toBe(join('/dist/public', '_locales'))
    expect(resolveTranslationPayloadPublicDir('/dist/public', { translationPayloads: { publicDir: '_payloads' } })).toBe(
      join('/dist/public', '_payloads'),
    )
  })

  it('copies to public on Node when serverAssets forces SSR, but not on Edge', () => {
    const serverOnly = resolveTranslationPayloadOptions({
      translationPayloads: { serverAssets: true, publicAssets: false },
    })
    expect(shouldCopyTranslationPayloadsToPublic(serverOnly, true)).toBe(true)
    expect(shouldCopyTranslationPayloadsToPublic(serverOnly, false)).toBe(false)
    expect(shouldRegisterNitroServerAssets(serverOnly, true)).toBe(false)
    expect(shouldRegisterNitroServerAssets(serverOnly, false)).toBe(true)
  })

  it('keeps source-mode publicAssets off even if nested module defaults leaked true', () => {
    // Simulates Nuxt deep-merge of defineNuxtModule defaults + user { mode: 'source' }
    // when defaults incorrectly included publicAssets: true.
    expect(
      resolveTranslationPayloadOptions({
        translationPayloads: {
          mode: 'source',
          serverAssets: true,
          serverHandler: true,
          publicAssets: true,
          prerenderRoutes: false,
        },
      }).publicAssets,
    ).toBe(true)

    expect(
      resolveTranslationPayloadOptions({
        translationPayloads: {
          mode: 'source',
          serverAssets: true,
          serverHandler: true,
          prerenderRoutes: false,
        },
      }).publicAssets,
    ).toBe(false)
  })
})
