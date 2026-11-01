import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { createI18nConfigResolver } from '../src/runtime-config'
import { describe, expect, it, vi } from 'vitest'

function createBaseConfig(): ModuleOptionsExtend {
  return {
    locales: [{ code: 'en' }, { code: 'fr' }, { code: 'de' }],
    defaultLocale: 'en',
    fallbackLocale: 'en',
    strategy: 'prefix',
    dateBuild: 'test',
    hashMode: false,
    apiBaseUrl: '_locales',
    disablePageLocales: false,
    redirects: true,
  }
}

describe('createI18nConfigResolver', () => {
  it('overrides default/fallback locale and disabled locales from runtimeConfig', () => {
    const config = createI18nConfigResolver(vi.fn())(createBaseConfig(), {
      i18nRuntime: {
        defaultLocale: 'fr',
        fallbackLocale: 'de',
        disabledLocales: ['en'],
      },
    })

    expect(config.defaultLocale).toBe('fr')
    expect(config.fallbackLocale).toBe('de')
    expect(config.locales?.find((locale) => locale.code === 'en')?.disabled).toBe(true)
    expect(config.locales?.find((locale) => locale.code === 'fr')?.disabled).toBeFalsy()
  })

  it('no override: locales all disabled at build are no override to warn about', () => {
    const warn = vi.fn()
    const base = { ...createBaseConfig(), locales: [] }
    createI18nConfigResolver(warn)(base, {})
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('would disable all locales'))
  })

  it('ignores strategy override and warns', () => {
    const warn = vi.fn()
    const config = createI18nConfigResolver(warn)(createBaseConfig(), { i18nRuntime: { strategy: 'no_prefix' } })

    expect(config.strategy).toBe('prefix')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('strategy override is ignored'))
  })

  it('rejects disabling all locales and keeps original locales', () => {
    const warn = vi.fn()
    const base = createBaseConfig()
    const config = createI18nConfigResolver(warn)(base, { i18nRuntime: { disabledLocales: ['en', 'fr', 'de'] } })

    expect(config.locales?.every((locale) => !locale.disabled)).toBe(true)
    expect(config.defaultLocale).toBe('en')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('would disable all locales'))
  })

  it('falls back to first enabled locale when defaultLocale is disabled', () => {
    const warn = vi.fn()
    const config = createI18nConfigResolver(warn)(createBaseConfig(), { i18nRuntime: { disabledLocales: ['en'] } })

    expect(config.defaultLocale).toBe('fr')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('defaultLocale "en" is disabled'))
  })
})
