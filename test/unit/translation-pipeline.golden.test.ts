/**
 * Characterization of the translation pipeline: the same locale files read the three ways the
 * module serves them — premerged (build, prod default), source (build layers + runtime merge)
 * and dev (live files) — for every locale and page. The golden records each mode's dictionary
 * and whether the three agree.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { createTranslationDirReader, mergeDevTranslations, resolveLiveTranslationDirs } from '@i18n-micro/hmr/watcher'
import { buildTranslationSourceLayers, preMergeLocales } from '@i18n-micro/utils/build'
import { normalizeConfiguredLocales, PREMERGED_ROOT_PAGE, toPremergedStorageKey } from '@i18n-micro/utils/merge-source'
import { loadSourceTranslationsFromStorage } from '@i18n-micro/utils/source-loader'
import { afterAll, describe, expect, test, vi } from 'vitest'

const FILES: Record<string, unknown> = {
  'app/locales/en.json': { a: { b: { c: 'en-c', d: 'en-d' } }, shared: { deep: { x: 'en-x', y: 'en-y' } }, onlyEn: 'E', list: ['en'] },
  'app/locales/de.json': { a: { b: { c: 'de-c' } }, shared: { deep: { x: 'de-x' } }, list: ['de'] },
  'app/locales/fr.json': '{ broken json',
  'layer/locales/en.json': { layer: 'L', a: { b: { e: 'layer-e' } } },
  'layer/locales/de.json': { layer: 'L-de' },
  'app/extra/en.json': { extra: 'X', a: { b: { c: 'extra-c' } } },
  'app/locales/pages/about/en.json': { title: 'About', shared: { deep: { y: 'about-y' } } },
  'app/locales/pages/about/de.json': { title: 'Über', a: { b: { z: 'about-z' } } },
  'layer/locales/pages/about/en.json': { layerTitle: 'Layer about' },
  'app/locales/pages/user/profile/en.json': { nested: 'nested page' },
  'app/locales/pages/index/en.json': { home: 'Home' },
}

const LOCALES = [{ code: 'en' }, { code: 'de', fallbackLocale: 'en' }, { code: 'fr', fallbackLocale: 'de' }, { code: 'es' }]
const PAGES = ['index', 'about', 'contact', 'user-profile', 'user/profile']

const root = mkdtempSync(join(tmpdir(), 'i18n-pipeline-'))
afterAll(() => rmSync(root, { recursive: true, force: true }))
for (const [file, content] of Object.entries(FILES)) {
  const path = join(root, file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, typeof content === 'string' ? content : JSON.stringify(content))
}
const rootDirs = [join(root, 'app'), join(root, 'layer')]

const readJson = (path: string): Record<string, unknown> => {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>
  } catch {
    return {}
  }
}

/** Same reads as server-loader: the page payload, else the root alone. */
async function premerged(disablePageLocales: boolean) {
  const out = join(root, `premerged-${disablePageLocales}`)
  await preMergeLocales(rootDirs, 'locales', out, LOCALES, undefined, disablePageLocales, ['extra'])
  return (locale: string, page: string) => {
    const own = readJson(join(out, toPremergedStorageKey(disablePageLocales ? 'index' : page, locale)))
    return Object.keys(own).length ? own : readJson(join(out, toPremergedStorageKey(PREMERGED_ROOT_PAGE, locale)))
  }
}

async function source(disablePageLocales: boolean) {
  const out = join(root, `source-${disablePageLocales}`)
  await buildTranslationSourceLayers(rootDirs, 'locales', out, ['extra'])
  return (locale: string, page: string) =>
    loadSourceTranslationsFromStorage(
      { getItem: async (key) => readJson(join(out, key)) },
      { locale, pageName: page, locales: normalizeConfiguredLocales(LOCALES), disablePageLocales },
    )
}

function dev(disablePageLocales: boolean) {
  const { translationRoots, additionalRoots } = resolveLiveTranslationDirs({
    rootDirs,
    translationDir: 'locales',
    additionalTranslationDirs: ['extra'],
  })
  const readLocaleFile = createTranslationDirReader(translationRoots, additionalRoots)
  return (locale: string, page: string) => mergeDevTranslations({ locale, pageName: page, locales: LOCALES, disablePageLocales, readLocaleFile })
}

async function report(disablePageLocales: boolean): Promise<string> {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const modes = { premerged: await premerged(disablePageLocales), source: await source(disablePageLocales), dev: dev(disablePageLocales) }
  const lines: string[] = [`# disablePageLocales: ${disablePageLocales}`, '']
  for (const locale of LOCALES.map((l) => l.code))
    for (const page of PAGES) {
      const results = Object.fromEntries(
        await Promise.all(
          Object.entries(modes).map(async ([mode, read]) => {
            try {
              return [mode, JSON.stringify(await read(locale, page))]
            } catch (error) {
              return [mode, `throws ${(error as Error).name}`]
            }
          }),
        ),
      )
      const same = new Set(Object.values(results)).size === 1
      lines.push(`## ${locale} · ${page} — ${same ? 'modes agree' : 'MODES DIFFER'}`, '')
      for (const [mode, json] of Object.entries(results)) lines.push(`- ${mode}: ${json}`)
      lines.push('')
    }
  lines.push(`warnings: ${warn.mock.calls.length}`)
  warn.mockRestore()
  return `${lines.join('\n')}\n`
}

describe('translation pipeline characterization', () => {
  test('pages translations', async () => {
    await expect(await report(false)).toMatchFileSnapshot('./__golden__/translation-pipeline.md')
  })
  test('disablePageLocales', async () => {
    await expect(await report(true)).toMatchFileSnapshot('./__golden__/translation-pipeline.disable-page-locales.md')
  })
})
