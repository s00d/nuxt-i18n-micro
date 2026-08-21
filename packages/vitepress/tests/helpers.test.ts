import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createI18n } from '../src/runtime/node-create'
import { buildVitePressLocales } from '../src/plugin/vitepress-locales'

const dirs: string[] = []

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe('createI18n (node entry)', () => {
  it('loads translations and exposes path methods on the same instance', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'i18n-vp-t-'))
    dirs.push(tmp)
    writeFileSync(join(tmp, 'en.json'), JSON.stringify({ hi: 'Hi', nested: { a: 'A' } }))
    writeFileSync(join(tmp, 'fr.json'), JSON.stringify({ hi: 'Salut' }))

    const i18n = createI18n({
      locale: 'fr',
      fallbackLocale: 'en',
      translationDir: tmp,
      locales: ['en', 'fr'],
      defaultLocale: 'en',
    })
    await i18n.loadTranslations()

    expect(i18n.t('hi')).toBe('Salut')
    expect(i18n.t('nested.a')).toBe('A')
    i18n.locale = 'de'
    expect(i18n.t('hi')).toBe('Hi')
    expect(i18n.localizePath('/guide', 'fr')).toBe('/fr/guide')
    expect(i18n.switchLocalePath('/fr/guide', 'en')).toBe('/guide')
    expect(i18n.getLocaleFromPath('/fr/guide')).toBe('fr')
  })
})

describe('buildVitePressLocales', () => {
  it('maps default to root and others to prefixed links', () => {
    const locales = buildVitePressLocales(
      [
        { code: 'en', iso: 'en-US', displayName: 'English' },
        { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
      ],
      'en',
    )
    expect(locales).toEqual({
      root: { label: 'English', lang: 'en-US' },
      fr: { label: 'Français', lang: 'fr-FR', link: '/fr/' },
    })
  })

  it('honors localeKeyToCode for URL keys', () => {
    const locales = buildVitePressLocales(
      [
        { code: 'en-US', iso: 'en-US', displayName: 'English' },
        { code: 'fr-FR', iso: 'fr-FR', displayName: 'Français' },
      ],
      'en-US',
      { localeKeyToCode: { root: 'en-US', fr: 'fr-FR' } },
    )
    expect(locales.root).toEqual({ label: 'English', lang: 'en-US' })
    expect(locales.fr).toEqual({ label: 'Français', lang: 'fr-FR', link: '/fr/' })
  })
})
