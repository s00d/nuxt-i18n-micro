import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, test, vi } from 'vitest'
import { generateHmrPlugin, TRANSLATIONS_HMR_EVENT } from '../../../src/hmr-plugin'
import {
  createTranslationDirReader,
  handleTranslationWatchChange,
  mergeDevTranslations,
  readTranslationFile,
  resolveLiveTranslationDirs,
  TranslationContentTracker,
  translationRelativePath,
} from '../../../src/runtime/server/utils/translation-watcher'

describe('dev translation watcher', () => {
  const root = mkdtempSync(join(tmpdir(), 'i18n-hmr-'))
  afterAll(() => rmSync(root, { recursive: true, force: true }))

  test('a saved file: is it a translation, did it change, what to drop, what to serve', async () => {
    // step 1: the watched roots, additional dirs ordered by configured dir first (as the build does)
    const { additionalRoots } = resolveLiveTranslationDirs({
      rootDirs: ['/layer-a', '/app'],
      translationDir: 'locales',
      additionalTranslationDirs: ['common', 'shared'],
    })
    expect(additionalRoots).toEqual(['/layer-a/common', '/app/common', '/layer-a/shared', '/app/shared'])

    // step 2: which saved files count — any .json under a translationDir root (any depth, any
    // layer), only top-level {locale}.json in an additional root, nothing else
    const dirs = { translationRoots: ['/app/locales', '/layer/locales'], additionalRoots: ['/app/extra'] }
    expect(translationRelativePath('/app/locales/en.json', dirs)).toBe('en.json')
    expect(translationRelativePath('/layer/locales/pages/contact/de.json', dirs)).toBe('pages/contact/de.json')
    expect(translationRelativePath('/app/extra/fr.json', dirs)).toBe('fr.json')
    expect(translationRelativePath('/app/extra/nested/fr.json', dirs)).toBeNull()
    expect(translationRelativePath('/app/pages/index.vue', dirs)).toBeNull()
    // an additional root nested in a translation root is still global, not a page file
    expect(translationRelativePath('/p/locales/common/fr.json', { translationRoots: ['/p/locales'], additionalRoots: ['/p/locales/common'] })).toBe(
      'fr.json',
    )
    expect(translationRelativePath('/app/locales/readme.md', dirs)).toBeNull()
    expect(translationRelativePath('/app/locales-old/en.json', dirs)).toBeNull()

    // step 3: a rewrite without a byte changed is skipped; forgotten (unlink) → processed again;
    // an unreadable file is processed rather than swallowed
    const file = join(root, 'en.json')
    writeFileSync(file, JSON.stringify({ greeting: 'Hello' }))
    const tracker = new TranslationContentTracker()
    expect(tracker.shouldProcess(file)).toBe(true)
    expect(tracker.shouldProcess(file)).toBe(false)
    tracker.forget(file)
    expect(tracker.shouldProcess(file)).toBe(true)
    expect(tracker.shouldProcess(join(root, 'gone.json'))).toBe(true)

    // step 4: an unconfigured locale is ignored; a root file drops every cached dictionary
    // (other locales fall back to it); a page file drops them too
    const server = new Map([
      ['en:contact', 1],
      ['de:index', 2],
    ])
    const storage = new Map([['en:about', 3]])
    expect(await handleTranslationWatchChange({ relativePath: 'xx.json', configuredLocales: new Set(['en']), serverCache: server })).toBe('ignored')
    expect(server.size).toBe(2)
    const change = await handleTranslationWatchChange({
      relativePath: 'en.json',
      configuredLocales: new Set(['en', 'de']),
      serverCache: server,
      storageCache: storage,
    })
    expect(change).toBe('root')
    expect(server.size + storage.size).toBe(0)
    server.set('en:about', 4)
    expect(await handleTranslationWatchChange({ relativePath: 'pages/about/en.json', configuredLocales: new Set(['en']), serverCache: server })).toBe(
      'page',
    )
    expect(server.size).toBe(0)

    // step 5: a missing file reads {}; a broken one reads {} and warns once, not once per read
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const broken = join(root, 'broken.json')
    writeFileSync(broken, '{ "a": "x')
    expect(readTranslationFile(join(root, 'nope.json'))).toEqual({})
    expect(readTranslationFile(broken)).toEqual({})
    expect(readTranslationFile(broken)).toEqual({})
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]![0]).toContain(broken)
    warn.mockRestore()

    // step 6: the next request merges the live files: the project layer over an extended layer,
    // translationDir over an additional root, the page over the root file
    const layer = join(root, 'layer')
    const app = join(root, 'app')
    const extra = join(root, 'extra')
    mkdirSync(join(app, 'pages', 'about'), { recursive: true })
    mkdirSync(layer, { recursive: true })
    mkdirSync(extra, { recursive: true })
    writeFileSync(join(extra, 'en.json'), JSON.stringify({ shared: 'EXTRA', extraOnly: 'extra', title: 'EXTRA' }))
    writeFileSync(join(layer, 'en.json'), JSON.stringify({ shared: 'LAYER', layerOnly: 'layer' }))
    writeFileSync(join(app, 'en.json'), JSON.stringify({ shared: 'APP', title: 'Root title' }))
    writeFileSync(join(app, 'pages', 'about', 'en.json'), JSON.stringify({ title: 'About' }))
    const readLocaleFile = createTranslationDirReader([layer, app], [extra])
    expect(await mergeDevTranslations({ locale: 'en', pageName: 'about', readLocaleFile })).toEqual({
      shared: 'APP',
      extraOnly: 'extra',
      layerOnly: 'layer',
      title: 'About',
    })

    // step 7: an edit shows on the next merge (nothing is cached between reads)
    writeFileSync(join(app, 'pages', 'about', 'en.json'), JSON.stringify({ title: 'About v2' }))
    expect(await mergeDevTranslations({ locale: 'en', pageName: 'about', readLocaleFile })).toMatchObject({ title: 'About v2' })
  })

  test('the client plugin reloads through its own nuxtApp on the custom event', () => {
    const code = generateHmrPlugin()
    expect(code).toContain(`import.meta.hot.on(${JSON.stringify(TRANSLATIONS_HMR_EVENT)}`)
    expect(code).toContain('nuxtApp.$clearCache()')
    // accept() on JSON nothing imports makes Vite full-reload: the plugin must not register it
    expect(code).not.toContain('accept(')
    expect(code).not.toContain('useNuxtApp')
  })
})
