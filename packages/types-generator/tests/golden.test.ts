/** Characterization of the generated declaration, from a tree holding every odd shape a locale dir can. */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { getTypesString } from '../src/core/generator'

let root: string
const write = (file: string, data: string) => {
  const full = join(root, 'locales', file)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, data)
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'i18n-types-golden-'))
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  rmSync(root, { recursive: true, force: true })
  vi.restoreAllMocks()
})

test('types-generator characterization', async () => {
  write(
    'en.json',
    '{"hello":"Hello","a":{"b":"AB","c":{"d":"D"}},"n":1,"yes":true,"nil":null,"list":["x"],"empty":{},"__proto__":{"evil":"x"},"flat.key":"F"}',
  )
  write('de.json', '{"onlyDe":"x"}')
  write('pages/about/en.json', '{"title":"About"}')
  write('notes/meta.json', '{"notATranslation":true}')
  write('bad.json', '{')
  write('list.json', '[1]')
  await expect(await getTypesString({ srcDir: root, translationDir: 'locales' })).toMatchFileSnapshot('./__golden__/types.md')
})
