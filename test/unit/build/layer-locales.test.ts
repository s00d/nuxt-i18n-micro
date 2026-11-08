import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadNuxtConfig } from '@nuxt/kit'
import { RouteGenerator } from '@i18n-micro/route-strategy'
import type { Locale } from '@i18n-micro/types'
import { afterAll, describe, expect, test } from 'vitest'
import { localesByLayerPriority } from '../../../src/build/layer-locales'

// #314: the project and two layers define `en` with different `iso` values
const root = mkdtempSync(join(tmpdir(), 'i18n-layers-'))
const config = (locales: string) => `export default defineNuxtConfig(${locales})\n`
const write = (dir: string, body: string) => {
  mkdirSync(join(root, dir), { recursive: true })
  writeFileSync(join(root, dir, 'nuxt.config.ts'), body)
}
write('.', config(`{ extends: ['./layers/a', './layers/b'], i18n: { locales: [{ code: 'nl', iso: 'nl-NL' }, { code: 'en', iso: 'en-GB' }] } }`))
write('layers/a', config(`{ i18n: { locales: [{ code: 'en', iso: 'en-AU', dir: 'ltr' }, { code: 'nl', iso: 'nl-NL' }] } }`))
write('layers/b', config(`{ i18n: { locales: [{ code: 'nl', iso: 'nl-NL' }, { code: 'en', iso: 'en-US' }, { code: 'fr', iso: 'fr-FR' }] } }`))

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe('localesByLayerPriority', () => {
  test("the project's entry of a code wins, a layer fills the gaps", async () => {
    const nuxtConfig = await loadNuxtConfig({ cwd: root })
    const merged = (nuxtConfig.i18n as { locales: Locale[] }).locales
    // what Nuxt merges: the layers' entries first, the project's last
    expect(merged.map((l) => l.iso).at(-1)).toBe('en-GB')

    const generate = (locales: unknown) =>
      new RouteGenerator({
        locales,
        defaultLocaleCode: 'en',
        strategy: 'no_prefix',
        globalLocaleRoutes: {},
        filesLocaleRoutes: {},
        routeLocales: {},
      } as never)
    // the merged list alone gives the first layer's `en`
    expect(generate(merged).locales.find((l) => l.code === 'en')?.iso).toBe('en-AU')
    expect(generate(localesByLayerPriority(nuxtConfig._layers as never, merged)).locales).toEqual([
      { code: 'nl', iso: 'nl-NL' },
      { code: 'en', iso: 'en-GB', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR' },
    ])
  })

  test('inline module options come after every layer', () => {
    expect(localesByLayerPriority([{ config: { i18n: { locales: ['en'] } } }, { config: {} }], ['de'])).toEqual(['en', 'de'])
  })
})
