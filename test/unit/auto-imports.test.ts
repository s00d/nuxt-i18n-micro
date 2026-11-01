import { readdirSync, readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

/** What `addImportsDir` publishes from a directory: an internal there takes the name from the app. */
function scanned(dir: string): string[] {
  const root = new URL(`../../src/runtime/${dir}/`, import.meta.url)
  return readdirSync(root)
    .flatMap((file) =>
      [...readFileSync(new URL(file, root), 'utf8').matchAll(/^export (?:async )?(?:const|function|class) (\w+)/gm)].map(([, name]) => name!),
    )
    .sort()
}

test('the public composables, and nothing else', () => {
  expect(scanned('composables')).toEqual(['useI18n', 'useI18nHead', 'useI18nLocale', 'useLocaleHead'])
})

test('the server auto-imports are the documented helpers, by name: each one is an API, and an internal would take the name from the app', () => {
  const source = readFileSync(new URL('../../src/module.ts', import.meta.url), 'utf8')
  const names = [...source.matchAll(/\{ name: '(\w+)', from: resolver\.resolve\('\.\/runtime\/server\//g)].map(([, name]) => name!)
  expect(names.sort()).toEqual(['detectCurrentLocale', 'loadTranslationsFromServer', 'useLocaleServerMiddleware', 'useTranslationServerMiddleware'])
  expect(source).not.toContain('addServerImportsDir')
})
