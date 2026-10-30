/** Characterization of @i18n-micro/node and @i18n-micro/runtime: one `call → result` line per behaviour. */
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { Recorder } from '../../core/tests/characterization/record'
import { createI18n, loadTranslations } from '../src'

let dir: string
const write = (file: string, data: string) => {
  const full = join(dir, file)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, data)
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'i18n-node-golden-'))
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'log').mockImplementation(() => {})
})
afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
  vi.restoreAllMocks()
})

async function report(): Promise<string> {
  const rec = new Recorder()
  write('en.json', '{"hello":"Hello","a":{"b":"AB"}}')
  write('de.json', '﻿{"hello":"Hallo"}')
  write('list.json', '[1,2]')
  write('null.json', 'null')
  write('pages/about/en.json', '{"title":"About"}')
  write('pages/user/profile/de.json', '{"title":"Profil"}')
  write('pages/constructor/en.json', '{"x":1}')
  write('pages/__proto__/en.json', '{"polluted":true}')
  write('notes/meta.json', '{"notATranslation":true}')
  mkdirSync(join(dir, 'other'))
  writeFileSync(join(dir, 'other', 'fr.json'), '{"hello":"Salut"}')
  symlinkSync(join(dir, 'other', 'fr.json'), join(dir, 'fr.json'))

  rec.section('loader')
  const buckets = await loadTranslations(dir)
  rec.value('root locales', Object.keys(buckets.root).sort())
  rec.value('root.en', buckets.root.en)
  rec.value('root.de', buckets.root.de)
  rec.value('root.fr', buckets.root.fr)
  rec.value('route names', Object.keys(buckets.routes).sort())
  rec.value('({}).polluted', ({} as Record<string, unknown>).polluted)
  rec.value('missing dir', await loadTranslations(join(dir, 'nope')))

  rec.section('instance')
  const i18n = createI18n({ locale: 'en', translationDir: dir, missingWarn: false })
  rec.value('load', await i18n.loadTranslations().then(() => 'ok', (error: Error) => error.message))
  rec.run('t', () => [i18n.t('hello'), i18n.t('a.b'), i18n.t('title', undefined, undefined, 'about')])
  i18n.locale = 'de'
  rec.run('t de', () => i18n.t('hello'))
  rec.run('has', () => [i18n.has('hello'), i18n.hasTranslation('title')])
  write('en.json', '{"hello":"Changed"}')
  i18n.locale = 'en'
  rec.value('reload', await i18n.reload().then(() => 'ok', (error: Error) => error.message))
  rec.run('after reload', () => [i18n.t('hello'), i18n.t('a.b')])
  return rec.toString()
}

test('node characterization', async () => {
  await expect(await report()).toMatchFileSnapshot('./__golden__/node.md')
})
