import { resolveTranslationPayloadMode, resolveTranslationPayloadOptions } from '../src/payload-config'

describe('translationPayloads mode', () => {
  it('defaults to premerged mode', () => {
    expect(resolveTranslationPayloadMode({})).toBe('premerged')
    expect(resolveTranslationPayloadOptions({}).mode).toBe('premerged')
  })

  it('uses compact defaults for source mode', () => {
    expect(
      resolveTranslationPayloadOptions({
        translationPayloads: { mode: 'source' },
      }),
    ).toEqual({
      mode: 'source',
      serverAssets: true,
      serverHandler: true,
      publicAssets: false,
      prerenderRoutes: false,
      publicDir: undefined,
      warnFileCount: undefined,
      warnSizeBytes: undefined,
    })
  })

  it('allows overriding source mode output flags explicitly', () => {
    expect(
      resolveTranslationPayloadOptions({
        translationPayloads: {
          mode: 'source',
          publicAssets: true,
          prerenderRoutes: true,
        },
      }).publicAssets,
    ).toBe(true)
  })
})
