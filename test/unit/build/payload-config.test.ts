import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  domainPayloadFilter,
  getTranslationPayloadMisconfigurationWarnings,
  getTranslationPayloadSizeWarning,
  resolveTranslationPayloadOptions,
  resolveTranslationPayloadPublicDir,
  resolveTranslationPayloadPublicRel,
  shouldCopyTranslationPayloadsToPublic,
  shouldReadPayloadsFromPublicDir,
  shouldRegisterNitroServerAssets,
} from '../../../src/build/payload-config'

describe('translationPayloads build options', () => {
  test('defaults, the public directory, and where each deploy target reads payloads from', () => {
    // step 1: defaults → every local output on except prerender
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
    // source mode keeps publicAssets off unless set explicitly (a leaked module default must not turn it on)
    const source = { mode: 'source', serverAssets: true, serverHandler: true, prerenderRoutes: false } as const
    expect(resolveTranslationPayloadOptions({ translationPayloads: source }).publicAssets).toBe(false)
    expect(resolveTranslationPayloadOptions({ translationPayloads: { ...source, publicAssets: true } }).publicAssets).toBe(true)

    // step 2: the public directory follows publicDir, else apiBaseUrl (slashes trimmed), never translationDir
    expect(resolveTranslationPayloadPublicRel({})).toBe('_locales')
    expect(resolveTranslationPayloadPublicRel({ apiBaseUrl: 'i18n-data' })).toBe('i18n-data')
    expect(resolveTranslationPayloadPublicRel({ translationDir: 'i18n/locales' })).toBe('_locales')
    expect(resolveTranslationPayloadPublicRel({ translationPayloads: { publicDir: '_payloads' } })).toBe('_payloads')
    expect(resolveTranslationPayloadPublicDir('/dist/public', {})).toBe(join('/dist/public', '_locales'))
    expect(resolveTranslationPayloadPublicDir('/dist/public', { apiBaseUrl: '/_locales/' })).toBe(join('/dist/public', '_locales'))
    expect(resolveTranslationPayloadPublicDir('/dist/public', { translationPayloads: { publicDir: '_payloads' } })).toBe(
      join('/dist/public', '_payloads'),
    )

    // step 3: node-server / dev / prerender serve public/ from disk; function platforms, Edge and
    // inlined public/ do not
    for (const serveStatic of [true, 'node', 'deno'] as const) expect(shouldReadPayloadsFromPublicDir({ node: true, serveStatic })).toBe(true)
    expect(shouldReadPayloadsFromPublicDir({ node: true, serveStatic: false })).toBe(false)
    expect(shouldReadPayloadsFromPublicDir({ node: false, serveStatic: false })).toBe(false)
    expect(shouldReadPayloadsFromPublicDir({ node: true, serveStatic: 'inline' })).toBe(false)

    // step 4: so a server-only setup copies to public/ where SSR reads it, embeds server assets elsewhere
    expect(shouldRegisterNitroServerAssets(resolveTranslationPayloadOptions({}), false)).toBe(true)
    const serverOnly = resolveTranslationPayloadOptions({ translationPayloads: { serverAssets: true, publicAssets: false } })
    expect(shouldCopyTranslationPayloadsToPublic(serverOnly, true)).toBe(true)
    expect(shouldCopyTranslationPayloadsToPublic(serverOnly, false)).toBe(false)
    expect(shouldRegisterNitroServerAssets(serverOnly, true)).toBe(false)
    expect(shouldRegisterNitroServerAssets(serverOnly, false)).toBe(true)
    const withPublic = resolveTranslationPayloadOptions({ translationPayloads: { serverAssets: true, publicAssets: true } })
    expect(shouldCopyTranslationPayloadsToPublic(withPublic, false)).toBe(true)
  })

  test('a per-domain build publishes its own locales, in both layouts', () => {
    const linkLocales = [{ code: 'en' }, { code: 'de', fallbackLocale: 'nl' }, { code: 'nl' }, { code: 'fr' }]
    const base = { root: '/tmp/i18n', served: [{ code: 'de', fallbackLocale: 'nl' }, { code: 'fr' }], linkLocales }

    // step 1: premerged: <page>/<locale>/ — a fallback is already merged, a page named like a locale stays
    const premerged = domainPayloadFilter({ ...base, mode: 'premerged' })
    expect(premerged('/tmp/i18n/index/de')).toBe(true)
    expect(premerged('/tmp/i18n/index/en')).toBe(false)
    expect(premerged('/tmp/i18n/index/nl')).toBe(false)
    expect(premerged('/tmp/i18n/en')).toBe(true)

    // step 2: source: <locale>.json and pages/<page>/<locale>.json — the server merges, so a fallback stays
    const source = domainPayloadFilter({ ...base, mode: 'source' })
    expect(source('/tmp/i18n/de.json')).toBe(true)
    expect(source('/tmp/i18n/en.json')).toBe(false)
    expect(source('/tmp/i18n/pages/about/en.json')).toBe(false)
    expect(source('/tmp/i18n/nl.json')).toBe(true)
    expect(source('/tmp/i18n/pages/en')).toBe(true)

    // step 3: a global fallback of another domain stays too
    expect(domainPayloadFilter({ ...base, mode: 'source', fallbackLocale: 'en' })('/tmp/i18n/en.json')).toBe(true)

    // step 4: no domain: everything
    expect(domainPayloadFilter({ root: '/tmp/i18n', mode: 'source', served: linkLocales })('/tmp/i18n/en.json')).toBe(true)
  })

  test('build warnings: outputs switched off, payloads too large', () => {
    const warn = (translationPayloads: Parameters<typeof resolveTranslationPayloadOptions>[0]['translationPayloads'], hosts = {}) =>
      getTranslationPayloadMisconfigurationWarnings({ translationPayloads: resolveTranslationPayloadOptions({ translationPayloads }), ...hosts })
    const nothingLocal = { serverAssets: false, serverHandler: false, publicAssets: false, prerenderRoutes: false }

    // step 1: no server or public copy → SSR needs apiBaseServerHost; no local output at all → both hosts
    expect(warn({ serverAssets: false, publicAssets: false }).some((w) => w.includes('apiBaseServerHost'))).toBe(true)
    expect(warn(nothingLocal)).toEqual(
      expect.arrayContaining([expect.stringContaining('apiBaseServerHost'), expect.stringContaining('apiBaseClientHost')]),
    )

    // step 2: external hosts configured, or the compact source defaults → no warning
    expect(warn(nothingLocal, { apiBaseClientHost: 'https://cdn.example.com', apiBaseServerHost: 'https://cdn.example.com' })).toEqual([])
    expect(warn({ mode: 'source' })).toEqual([])

    // step 3: size warning past the file-count or byte threshold only
    const tenMb = 10 * 1024 * 1024
    expect(getTranslationPayloadSizeWarning({ fileCount: 100, totalBytes: 1024 * 1024 })).toBeNull()
    expect(getTranslationPayloadSizeWarning({ fileCount: 600, totalBytes: 1024 }, { warnFileCount: 500 })).toMatch(/600/)
    expect(getTranslationPayloadSizeWarning({ fileCount: 10, totalBytes: tenMb + 1 }, { warnSizeBytes: tenMb })).toMatch(/10\.0 MB/)
  })
})
