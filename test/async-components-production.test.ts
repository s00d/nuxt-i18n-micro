/**
 * `nuxi generate` of the async-components fixture. The journey (test/journeys/loading-async-components.spec.ts)
 * covers the same pages on a server build in a browser; this pins what only a static build shows:
 * every locale's home is prerendered with its translations, and the `ssr: false` route rules are
 * localized, so `/ru/...` and `/de/...` are SPA shells just like the unprefixed routes.
 */
import { existsSync, readFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { runCommand } from './helpers/subprocess'

const FIXTURE = fileURLToPath(new URL('./fixtures/async-components', import.meta.url))
const PUBLIC = join(FIXTURE, '.output/public')
const page = (path: string) => readFileSync(join(PUBLIC, path, 'index.html'), 'utf-8')

describe('async components after nuxi generate', () => {
  test('prerendered homes per locale, localized SPA routes', { timeout: 300_000 }, async () => {
    await rm(join(FIXTURE, '.nuxt'), { recursive: true, force: true })
    await rm(join(FIXTURE, '.output'), { recursive: true, force: true })
    await runCommand('npx', ['nuxi', 'generate'], { cwd: FIXTURE })

    // step 1: / is prerendered in en with the async component links and the switcher
    const home = page('/')
    for (const text of [
      'Async Components Test Suite',
      'Testing async components with i18n translations',
      'Async Components Test 1',
      'Async Components Test 2',
    ]) {
      expect(home).toContain(text)
    }
    for (const label of ['English', 'Русский', 'Deutsch']) expect(home).toContain(label)

    // step 2: /ru and /de are prerendered with their own translations
    expect(page('/ru')).toContain('Набор Тестов Асинхронных Компонентов')
    expect(page('/de')).toContain('Async-Komponenten Test-Suite')

    // step 3: the ssr:false pages are SPA shells in every locale (the route rule was localized)
    for (const locale of ['', 'ru/', 'de/']) {
      for (const name of ['async-components-test', 'async-components-test-2']) {
        const path = `${locale}${name}`
        expect(existsSync(join(PUBLIC, path, 'index.html'))).toBe(true)
        const html = page(path)
        expect(html).toContain('<div id="__nuxt"></div>')
        expect(html).toContain('data-ssr="false"')
      }
    }
  })
})
