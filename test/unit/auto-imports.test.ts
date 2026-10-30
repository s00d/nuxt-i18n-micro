import { readdirSync, readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

/** What `addImportsDir` / `addServerImportsDir` publish from a directory: an internal there takes the name from the app. */
function scanned(dir: string): string[] {
  const root = new URL(`../../src/runtime/${dir}/`, import.meta.url)
  return readdirSync(root)
    .flatMap((file) => [...readFileSync(new URL(file, root), 'utf8').matchAll(/^export (?:async )?(?:const|function|class) (\w+)/gm)].map(([, name]) => name!))
    .sort()
}

test('the public composables, and nothing else', () => {
  expect(scanned('composables')).toEqual(['useI18n', 'useI18nHead', 'useI18nLocale', 'useLocaleHead'])
})
