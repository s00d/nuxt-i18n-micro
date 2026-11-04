import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { preMergeLocales } from '../../../src/build/build'

const dirs: string[] = []
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

function project() {
  const root = mkdtempSync(join(tmpdir(), 'i18n-linked-'))
  dirs.push(root)
  mkdirSync(join(root, 'locales', 'pages', 'about'), { recursive: true })
  writeFileSync(join(root, 'locales', 'en.json'), JSON.stringify({ name: 'Ada', greet: 'Hi @:name', broken: '@:nope' }))
  writeFileSync(join(root, 'locales', 'de.json'), JSON.stringify({ greetDe: 'Hallo @.upper:name' }))
  writeFileSync(join(root, 'locales', 'pages', 'about', 'en.json'), JSON.stringify({ about: 'About @:name', name: 'Bob' }))
  return root
}

const read = (dir: string, page: string, locale: string) => JSON.parse(readFileSync(join(dir, page, locale, 'data.json'), 'utf-8'))

it('linkedMessages resolves every chunk; the delta is taken between resolved trees; each warning once per build', async () => {
  const root = project()
  const outputDir = join(root, 'out')
  const warnings: string[] = []
  await preMergeLocales({
    rootDirs: [root],
    translationDirName: 'locales',
    outputDir,
    locales: [{ code: 'en' }, { code: 'de', fallbackLocale: 'en', iso: 'de-DE' }],
    rootDelta: true,
    linkedMessages: true,
    warn: (message) => warnings.push(message),
  })

  // root: resolved against the root; the mark makes it the base of every delta
  expect(read(outputDir, '__root', 'en')).toMatchObject({ name: 'Ada', greet: 'Hi Ada', broken: '@:nope' })
  // the page names Bob: its links resolve in the page's chunk, and the root's greet changes with it
  const about = read(outputDir, 'about', 'en')
  expect(about).toMatchObject({ about: 'About Bob', name: 'Bob', greet: 'Hi Bob' })
  // de: the fallback's keys are its to link, with de's case rules
  expect(read(outputDir, '__root', 'de')).toMatchObject({ greetDe: 'Hallo ADA', greet: 'Hi Ada' })
  // one warning per message and locale, not one per page
  expect(warnings.filter((message) => message.includes('"broken"'))).toEqual([
    expect.stringContaining('[i18n] en:'),
    expect.stringContaining('[i18n] de:'),
  ])
})

it('without linkedMessages the chunks are the files as written', async () => {
  const root = project()
  const outputDir = join(root, 'out')
  await preMergeLocales({ rootDirs: [root], translationDirName: 'locales', outputDir, locales: [{ code: 'en' }] })
  expect(read(outputDir, 'about', 'en')).toEqual({ name: 'Bob', greet: 'Hi @:name', broken: '@:nope', about: 'About @:name' })
})
