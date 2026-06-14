import {
  getTranslationPayloadMisconfigurationWarnings,
  getTranslationPayloadSizeWarning,
  hasLocalTranslationPayloadOutput,
  resolveTranslationPayloadOptions,
} from '../src/payload-config'

describe('hasLocalTranslationPayloadOutput', () => {
  it('returns true when any local output remains enabled', () => {
    expect(hasLocalTranslationPayloadOutput(resolveTranslationPayloadOptions({}))).toBe(true)
    expect(
      hasLocalTranslationPayloadOutput(
        resolveTranslationPayloadOptions({
          translationPayloads: { serverAssets: false, publicAssets: false, prerenderRoutes: false },
        }),
      ),
    ).toBe(true)
  })

  it('returns false when all local outputs are disabled', () => {
    expect(
      hasLocalTranslationPayloadOutput(
        resolveTranslationPayloadOptions({
          translationPayloads: {
            serverAssets: false,
            serverHandler: false,
            publicAssets: false,
            prerenderRoutes: false,
          },
        }),
      ),
    ).toBe(false)
  })
})

describe('getTranslationPayloadMisconfigurationWarnings', () => {
  it('warns when all local outputs are disabled without external hosts', () => {
    const warnings = getTranslationPayloadMisconfigurationWarnings({
      translationPayloads: resolveTranslationPayloadOptions({
        translationPayloads: {
          serverAssets: false,
          serverHandler: false,
          publicAssets: false,
          prerenderRoutes: false,
        },
      }),
    })

    expect(warnings).toEqual(expect.arrayContaining([expect.stringContaining('apiBaseServerHost'), expect.stringContaining('apiBaseClientHost')]))
  })

  it('does not warn when external hosts are configured', () => {
    expect(
      getTranslationPayloadMisconfigurationWarnings({
        translationPayloads: resolveTranslationPayloadOptions({
          translationPayloads: {
            serverAssets: false,
            serverHandler: false,
            publicAssets: false,
            prerenderRoutes: false,
          },
        }),
        apiBaseClientHost: 'https://cdn.example.com',
        apiBaseServerHost: 'https://cdn.example.com',
      }),
    ).toEqual([])
  })

  it('does not warn for source mode compact defaults', () => {
    expect(
      getTranslationPayloadMisconfigurationWarnings({
        translationPayloads: resolveTranslationPayloadOptions({
          translationPayloads: { mode: 'source' },
        }),
      }),
    ).toEqual([])
  })

  it('does not warn for default all-in-one setup', () => {
    expect(
      getTranslationPayloadMisconfigurationWarnings({
        translationPayloads: resolveTranslationPayloadOptions({}),
      }),
    ).toEqual([])
  })
})

describe('getTranslationPayloadSizeWarning', () => {
  it('returns null below default thresholds', () => {
    expect(getTranslationPayloadSizeWarning({ fileCount: 100, totalBytes: 1024 * 1024 })).toBeNull()
  })

  it('warns when file count exceeds threshold', () => {
    expect(getTranslationPayloadSizeWarning({ fileCount: 600, totalBytes: 1024 }, { warnFileCount: 500 })).toMatch(/600/)
  })

  it('warns when total size exceeds threshold', () => {
    const tenMb = 10 * 1024 * 1024
    expect(getTranslationPayloadSizeWarning({ fileCount: 10, totalBytes: tenMb + 1 }, { warnSizeBytes: tenMb })).toMatch(/10\.0 MB/)
  })
})
