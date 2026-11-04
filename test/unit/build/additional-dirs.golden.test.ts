/**
 * Characterization of `additionalTranslationDirs` readers: every call is one `call → result` line in
 * `__golden__/additional-dirs.md`, with the temp root as `<root>`. Relative dirs are read in every layer.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, expect, test } from 'vitest'
import { listAdditionalRootLocales, mergeAdditionalRootLocaleFiles } from '../../../src/build/build'
import { hashTranslationSources } from '../../../src/build/payload-stats'
import { resolveLiveTranslationDirs } from '../../../src/runtime/server/internal/translation-watcher'

const base = mkdtempSync(join(tmpdir(), 'i18n-additional-'))
afterAll(() => rmSync(base, { recursive: true, force: true }))

const write = (path: string, data: unknown) => {
  mkdirSync(join(base, path, '..'), { recursive: true })
  writeFileSync(join(base, path), JSON.stringify(data))
}

// two layers (extends first), a relative `common` in both, a module's absolute `vendor/locales`
write('layer/locales/en.json', { layer: 'L' })
write('layer/common/en.json', { common: 'layer common', shared: 'layer' })
write('app/locales/en.json', { app: 'A' })
write('app/common/en.json', { common: 'app common' })
write('app/common/de.json', { common: 'app common de' })
write('vendor/locales/en.json', { vendor: 'V', shared: 'vendor' })
write('vendor/locales/fr.json', { vendor: 'V fr' })

const rootDirs = [join(base, 'layer'), join(base, 'app')]
const absolute = join(base, 'vendor/locales')
const show = (value: unknown) => JSON.stringify(value).replaceAll(base, '<root>')

test('additional dirs characterization', async () => {
  const lines: string[] = []
  const run = (label: string, fn: () => unknown) => {
    let out: string
    try {
      out = show(fn())
    } catch (error) {
      out = `throws ${(error as Error).name}`
    }
    lines.push(`- \`${label.replaceAll(base, '<root>')}\` → ${out}`)
  }
  for (const dirs of [[], ['common'], [absolute], ['common', absolute]]) {
    run(`listAdditionalRootLocales(${show(dirs)})`, () => listAdditionalRootLocales(rootDirs, dirs).sort())
    run(`mergeAdditionalRootLocaleFiles(${show(dirs)}, en)`, () => mergeAdditionalRootLocaleFiles(rootDirs, dirs, 'en', { app: 'A' }))
    run(`mergeAdditionalRootLocaleFiles(${show(dirs)}, fr)`, () => mergeAdditionalRootLocaleFiles(rootDirs, dirs, 'fr'))
    run(`hashTranslationSources(${show(dirs)})`, () => hashTranslationSources(rootDirs, 'locales', dirs))
    run(`resolveLiveTranslationDirs(${show(dirs)})`, () =>
      resolveLiveTranslationDirs({ rootDirs, translationDir: 'locales', additionalTranslationDirs: dirs }),
    )
  }
  await expect(`${lines.join('\n')}\n`).toMatchFileSnapshot('../__golden__/additional-dirs.md')
})
