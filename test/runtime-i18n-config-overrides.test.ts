import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { describe, expect, it, vi } from 'vitest'
import { resolveI18nConfigWithRuntimeOverrides } from '../src/runtime/utils/runtime-i18n-config'

function createBaseConfig(): ModuleOptionsExtend {
  return {
    locales: [{ code: 'en' }, { code: 'fr' }, { code: 'de' }],
    defaultLocale: 'en',
    fallbackLocale: 'en',
    strategy: 'prefix_except_default',
    dateBuild: 'test',
    hashMode: false,
    isSSG: false,
    apiBaseUrl: '_locales',
    disablePageLocales: false,
    redirects: true,
  }
}

describe('resolveI18nConfigWithRuntimeOverrides', () => {
  it('overrides default/fallback locale and disabled locales from runtimeConfig', () => {
    const config = resolveI18nConfigWithRuntimeOverrides(createBaseConfig(), {
      i18nRuntime: {
        defaultLocale: 'fr',
        fallbackLocale: 'de',
        disabledLocales: ['en'],
      },
    })

    expect(config.defaultLocale).toBe('fr')
    expect(config.fallbackLocale).toBe('de')
    expect(config.locales?.find((locale) => locale.code === 'en')?.disabled).toBe(true)
    expect(config.locales?.find((locale) => locale.code === 'fr')?.disabled).toBe(false)
  })

  it('ignores strategy override and warns', () => {
    const warn = vi.fn()
    const config = resolveI18nConfigWithRuntimeOverrides(createBaseConfig(), { i18nRuntime: { strategy: 'no_prefix' } }, warn)

    expect(config.strategy).toBe('prefix_except_default')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('strategy override is ignored'))
  })

  it('rejects disabling all locales and keeps original locales', () => {
    const warn = vi.fn()
    const base = createBaseConfig()
    const config = resolveI18nConfigWithRuntimeOverrides(base, { i18nRuntime: { disabledLocales: ['en', 'fr', 'de'] } }, warn)

    expect(config.locales?.every((locale) => !locale.disabled)).toBe(true)
    expect(config.defaultLocale).toBe('en')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('would disable all locales'))
  })

  it('falls back to first enabled locale when defaultLocale is disabled', () => {
    const warn = vi.fn()
    const config = resolveI18nConfigWithRuntimeOverrides(createBaseConfig(), { i18nRuntime: { disabledLocales: ['en'] } }, warn)

    expect(config.defaultLocale).toBe('fr')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('defaultLocale "en" is disabled'))
  })
})
