import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseTranslationRelativePath } from '@i18n-micro/utils/parse-path'
import {
  createTranslationDirReader,
  handleTranslationWatchChange,
  mergeDevTranslations,
  readTranslationFile,
  resolveLiveTranslationDirs,
} from '../src/watcher'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('resolveLiveTranslationDirs', () => {
  it('orders additional roots by configured dir first (matches build)', () => {
    const { additionalRoots } = resolveLiveTranslationDirs({
      rootDirs: ['/layer-a', '/app'],
      translationDir: 'locales',
      additionalTranslationDirs: ['common', 'shared'],
    })
    expect(additionalRoots).toEqual(['/layer-a/common', '/app/common', '/layer-a/shared', '/app/shared'])
  })
})

describe('handleTranslationWatchChange', () => {
  const caches = () => {
    const server = new Map([
      ['en:contact', 1],
      ['de:index', 2],
    ])
    const storage = new Map([['en:about', 3]])
    return { server, storage }
  }

  it('drops every cached dictionary on a page file change', async () => {
    const { server, storage } = caches()
    const result = await handleTranslationWatchChange({
      relativePath: 'pages/contact/en.json',
      configuredLocales: new Set(['en']),
      serverCache: server,
      storageCache: storage,
    })
    expect(result).toBe('page')
    expect(server.size + storage.size).toBe(0)
  })

  it('drops every cached dictionary on a root file change (other locales fall back to it)', async () => {
    const { server, storage } = caches()
    const result = await handleTranslationWatchChange({
      relativePath: 'en.json',
      configuredLocales: new Set(['en', 'de']),
      serverCache: server,
      storageCache: storage,
    })
    expect(result).toBe('root')
    expect(server.size + storage.size).toBe(0)
  })

  it('ignores files of locales that are not configured', async () => {
    const { server } = caches()
    expect(await handleTranslationWatchChange({ relativePath: 'xx.json', configuredLocales: new Set(['en']), serverCache: server })).toBe('ignored')
    expect(server.size).toBe(2)
  })
})

describe('readTranslationFile', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'i18n-hmr-'))
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('reads a locale file', () => {
    const file = join(dir, 'en.json')
    writeFileSync(file, JSON.stringify({ hello: 'Hello' }))
    expect(readTranslationFile(file)).toEqual({ hello: 'Hello' })
  })

  it('treats an absent file as empty — a page without its own locale file is normal', () => {
    expect(readTranslationFile(join(dir, 'nope.json'))).toEqual({})
  })

  it('warns once and reads {} for a file that does not parse (nothing is cached in dev, the next read is fresh)', () => {
    const file = join(dir, 'partial.json')
    writeFileSync(file, '{ "hello": "Hel')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(readTranslationFile(file)).toEqual({})
    expect(readTranslationFile(file)).toEqual({})
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })
})

describe('mergeDevTranslations vs stale buildDir snapshot', () => {
  let liveRoot: string
  let staleBuildDir: string

  beforeEach(() => {
    liveRoot = mkdtempSync(join(tmpdir(), 'i18n-live-'))
    staleBuildDir = mkdtempSync(join(tmpdir(), 'i18n-stale-'))
    mkdirSync(join(liveRoot, 'pages', 'about'), { recursive: true })
    mkdirSync(join(staleBuildDir, 'about', 'en'), { recursive: true })
    writeFileSync(join(liveRoot, 'en.json'), JSON.stringify({ shared: 'LIVE' }))
    writeFileSync(join(liveRoot, 'pages', 'about', 'en.json'), JSON.stringify({ title: 'About LIVE' }))
    // Stale premerged snapshot left by build:before — HMR never rewrites this.
    writeFileSync(join(staleBuildDir, 'about', 'en', 'data.json'), JSON.stringify({ shared: 'STALE', title: 'About STALE' }))
  })

  afterEach(() => {
    rmSync(liveRoot, { recursive: true, force: true })
    rmSync(staleBuildDir, { recursive: true, force: true })
  })

  it('live merge returns edited values while disk snapshot stays stale', async () => {
    const staleDisk = JSON.parse(readFileSync(join(staleBuildDir, 'about', 'en', 'data.json'), 'utf-8')) as Record<string, unknown>
    expect(staleDisk).toEqual({ shared: 'STALE', title: 'About STALE' })

    const readLocaleFile = createTranslationDirReader(liveRoot)
    const live = await mergeDevTranslations({
      locale: 'en',
      pageName: 'about',
      readLocaleFile,
    })
    expect(live).toEqual({ shared: 'LIVE', title: 'About LIVE' })
  })

  it('applies fallbackLocale for locales that only exist under additional dirs', async () => {
    const additional = mkdtempSync(join(tmpdir(), 'i18n-add-'))
    writeFileSync(join(additional, 'fr.json'), JSON.stringify({ fromCommon: 'FR' }))
    writeFileSync(join(liveRoot, 'en.json'), JSON.stringify({ hello: 'Hello EN', sharedRoot: 'Shared EN' }))

    const readLocaleFile = createTranslationDirReader(liveRoot, [additional])
    const live = await mergeDevTranslations({
      locale: 'fr',
      pageName: 'index',
      locales: [{ code: 'en' }, { code: 'fr' }],
      fallbackLocale: 'en',
      readLocaleFile,
    })
    expect(live).toMatchObject({
      fromCommon: 'FR',
      hello: 'Hello EN',
      sharedRoot: 'Shared EN',
    })
    rmSync(additional, { recursive: true, force: true })
  })

  it('merges Nuxt layer translation roots (last wins)', async () => {
    const layerRoot = mkdtempSync(join(tmpdir(), 'i18n-layer-'))
    writeFileSync(join(layerRoot, 'en.json'), JSON.stringify({ shared: 'LAYER', onlyLayer: 'yes' }))
    writeFileSync(join(liveRoot, 'en.json'), JSON.stringify({ shared: 'APP' }))

    const readLocaleFile = createTranslationDirReader([layerRoot, liveRoot])
    const live = await mergeDevTranslations({
      locale: 'en',
      pageName: 'about',
      readLocaleFile,
    })
    expect(live).toMatchObject({
      shared: 'APP',
      onlyLayer: 'yes',
      title: 'About LIVE',
    })
    // Path parsing stays in utils — no HMR re-export wrapper.
    expect(parseTranslationRelativePath('pages/about/en.json')).toEqual({
      type: 'page',
      pageName: 'about',
      locale: 'en',
    })
    rmSync(layerRoot, { recursive: true, force: true })
  })
})
