import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { describe, expect, it, vi } from 'vitest'
import { detectLocaleFromAcceptLanguage, parseAcceptLanguage } from '../src/accept-language'
import { isInternalPath } from '../src/app-path'
import { shouldAttemptLocaleRedirect } from '../src/auto-detect-path'
import { decodeCookieValue, getLocaleCookieOptions, getPreferenceCookieName } from '../src/cookie'
import { explicitLocale, firstQueryValue, localeFromPath, resolveLocale } from '../src/resolve-locale'
import { applyI18nRuntimeOverrides, createI18nConfigResolver } from '../src/runtime-config'

describe('Accept-Language (F5: q, F6: matching)', () => {
  it.each([
    ['de;q=0.1, en;q=0.9', ['en', 'de', 'fr'], 'en'],
    ['fr;q=0, en', ['en', 'de', 'fr'], 'en'],
    ['de;q=0', ['en', 'de', 'fr'], null],
    ['fr;q=NaN, de', ['en', 'de', 'fr'], 'de'],
    ['fr;q=2, de', ['en', 'de', 'fr'], 'de'],
    ['en-US', ['en', 'en-US'], 'en-US'],
    ['pt-BR', ['pt', 'pt-BR'], 'pt-BR'],
    ['pt', ['pt-BR'], 'pt-BR'],
    ['zh-Hant-TW', ['zh-Hant', 'zh'], 'zh-Hant'],
    ['zh-Hant-TW', ['zh', 'zh-Hant'], 'zh-Hant'],
    ['en', ['en-US', 'de'], 'en-US'],
    ['en_US', ['en'], 'en'],
    ['EN-us', ['en-US'], 'en-US'],
    ['*', ['en', 'de'], null],
    // RFC 9110 qvalues only: 0x1, 1e-1, .5 are not qvalues (the entry is ignored)
    ['de;q=0x1, en;q=0.5', ['en', 'de'], 'en'],
    ['de;q=1e-1, en;q=0.05', ['en', 'de'], 'en'],
    ['de;q=.5, en;q=0.1', ['en', 'de'], 'en'],
    ['de;q=1.000, en', ['en', 'de'], 'de'],
    ['de;Q=0.500, en;q=0.4', ['en', 'de'], 'de'],
    // same language, never across scripts
    ['zh-CN', ['zh-Hant', 'en'], null],
    ['zh-Hans', ['zh-Hant', 'en'], null],
    ['zh-TW', ['zh-Hans', 'zh-Hant-HK'], 'zh-Hant-HK'],
    ['zh-SG', ['zh-Hant', 'zh-Hans-CN'], 'zh-Hans-CN'],
    ['zh', ['zh-Hant'], 'zh-Hant'],
    ['zh-CN', ['zh', 'zh-Hant'], 'zh'],
  ] as const)('%s with %j → %s', (header, locales, expected) => {
    expect(detectLocaleFromAcceptLanguage(header, locales)).toBe(expected)
  })

  it('orders by q, stable for equal q', () => {
    expect(parseAcceptLanguage('a;q=0.5, b, c;q=0.5, d')).toEqual(['b', 'd', 'a', 'c'])
  })
})

describe('resolveLocale: one precedence', () => {
  const base = { defaultLocale: 'en', validLocales: ['en', 'de', 'fr'], acceptLanguage: 'fr' }

  it('url → query → state → cookie → Accept-Language → default', () => {
    const all = { ...base, autoDetectLanguage: true, url: 'de', query: 'fr', state: 'en', cookie: 'fr' }
    expect(resolveLocale(all)).toBe('de')
    expect(resolveLocale({ ...all, url: null })).toBe('fr')
    expect(resolveLocale({ ...all, url: null, query: null })).toBe('en')
    expect(resolveLocale({ ...all, url: null, query: null, state: null })).toBe('fr')
    expect(resolveLocale({ ...base, autoDetectLanguage: true })).toBe('fr')
    expect(resolveLocale(base)).toBe('en')
  })

  it('server API order: ?locale before the URL', () => {
    expect(resolveLocale({ ...base, url: 'de', query: 'fr', queryFirst: true })).toBe('fr')
    expect(resolveLocale({ ...base, url: 'de', query: 'xx', queryFirst: true })).toBe('de')
  })

  it('explicitLocale: an invalid state does not hide a valid cookie', () => {
    expect(explicitLocale({ validLocales: base.validLocales, state: 'xx', cookie: 'de' })).toBe('de')
    expect(explicitLocale({ validLocales: base.validLocales, state: 'xx', cookie: 'yy' })).toBeNull()
  })

  it('skips invalid and inherited values', () => {
    expect(resolveLocale({ ...base, url: 'xx', query: 'toString', cookie: '__proto__' })).toBe('en')
  })

  it('a repeated ?locale is its first value (F15)', () => {
    expect(firstQueryValue(['de', 'fr'])).toBe('de')
    expect(firstQueryValue('de')).toBe('de')
    expect(firstQueryValue(undefined)).toBeNull()
    expect(firstQueryValue({})).toBeNull()
  })

  it('reads the first path segment only', () => {
    expect(localeFromPath('/de/about', base.validLocales)).toBe('de')
    expect(localeFromPath('/de', base.validLocales)).toBe('de')
    expect(localeFromPath('/deutsch', base.validLocales)).toBeNull()
    expect(localeFromPath('/about/de', base.validLocales)).toBeNull()
    expect(localeFromPath('/', base.validLocales)).toBeNull()
  })
})

describe('cookies (D2, D7)', () => {
  it('a malformed cookie is absent, not a throw', () => {
    expect(decodeCookieValue('%E0%A4%A')).toBeNull()
    expect(decodeCookieValue('de')).toBe('de')
    expect(getLocaleCookieOptions().decode('%E0%A4%A')).toBeNull()
  })

  it('hashMode reads the hash cookie on every side', () => {
    expect(getPreferenceCookieName({ hashMode: true } as ModuleOptionsExtend)).toBe('hash-locale')
    expect(getPreferenceCookieName({ localeCookie: 'lang' } as ModuleOptionsExtend)).toBe('lang')
    expect(getPreferenceCookieName({ localeCookie: null } as ModuleOptionsExtend)).toBeNull()
  })
})

describe('path gating (F14)', () => {
  it('uses the configured apiBaseUrl', () => {
    expect(isInternalPath('/api/_i18n/index/en/data.json', [], 'api/_i18n')).toBe(true)
    expect(isInternalPath('/translations/index/en/data.json', [], 'translations')).toBe(true)
    expect(isInternalPath('/translations-page', [], 'translations')).toBe(false)
  })

  it('a string pattern matches whole segments', () => {
    expect(isInternalPath('/admin', ['/admin'])).toBe(true)
    expect(isInternalPath('/admin/users', ['/admin'])).toBe(true)
    expect(isInternalPath('/administrator', ['/admin'])).toBe(false)
  })

  it('a glob is anchored', () => {
    expect(isInternalPath('/admin/x', ['/admin/*'])).toBe(true)
    expect(isInternalPath('/de/admin/x', ['/admin/*'])).toBe(false)
  })

  it('autoDetectPath with a trailing slash names the same page', () => {
    expect(shouldAttemptLocaleRedirect('/welcome', { autoDetectPath: '/welcome/' })).toBe(true)
    expect(shouldAttemptLocaleRedirect('/welcome/', { autoDetectPath: '/welcome/' })).toBe(true)
  })
})

describe('runtime overrides (F12)', () => {
  const base: ModuleOptionsExtend = {
    locales: [{ code: 'en' }, { code: 'de' }, { code: 'fr' }, { code: 'it', disabled: true }],
    defaultLocale: 'en',
    fallbackLocale: 'en',
    strategy: 'prefix',
  } as ModuleOptionsExtend

  it('runtime disabledLocales add to build-time disabled, never re-enable', () => {
    const config = applyI18nRuntimeOverrides(base, { disabledLocales: ['fr'] }, vi.fn())
    expect(config.locales?.filter((l) => l.disabled).map((l) => l.code)).toEqual(['fr', 'it'])
  })

  it('fallbackLocale must be enabled', () => {
    const warn = vi.fn()
    expect(applyI18nRuntimeOverrides(base, { fallbackLocale: 'it' }, warn).fallbackLocale).toBe('en')
    expect(applyI18nRuntimeOverrides(base, { disabledLocales: ['en'] }, warn).fallbackLocale).toBeUndefined()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('fallbackLocale "it" is not an enabled locale'))
  })

  it('under prefix_except_default / prefix_and_default the default locale is fixed at build (F1)', () => {
    for (const strategy of ['prefix_except_default', 'prefix_and_default'] as const) {
      const warn = vi.fn()
      const config = applyI18nRuntimeOverrides({ ...base, strategy }, { defaultLocale: 'de', disabledLocales: ['en', 'fr'] }, warn)
      expect(config.defaultLocale).toBe('en')
      expect(config.locales?.filter((l) => l.disabled).map((l) => l.code)).toEqual(['fr', 'it'])
      expect(warn).toHaveBeenCalledTimes(1)
      // every ignored override in the one warning
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('defaultLocale "de" and disabledLocales entry "en" ignored'))
    }
    expect(applyI18nRuntimeOverrides({ ...base, strategy: 'no_prefix' }, { defaultLocale: 'de' }).defaultLocale).toBe('de')
  })

  it('a default disabled at build is replaced without overrides too', () => {
    const disabledDefault = { ...base, locales: [{ code: 'en', disabled: true }, { code: 'de' }] } as ModuleOptionsExtend
    expect(applyI18nRuntimeOverrides(disabledDefault, {}, vi.fn()).defaultLocale).toBe('de')
  })

  it('no overrides: the build config itself, inputs untouched', () => {
    expect(applyI18nRuntimeOverrides(base, {})).toBe(base)
    const before = JSON.stringify(base)
    applyI18nRuntimeOverrides(base, { disabledLocales: ['de'], defaultLocale: 'fr' }, vi.fn())
    expect(JSON.stringify(base)).toBe(before)
  })
})

describe('createI18nConfigResolver (shared server config)', () => {
  const base = { locales: [{ code: 'en' }, { code: 'de' }], defaultLocale: 'en', strategy: 'prefix' } as ModuleOptionsExtend

  it('one object while base and overrides are unchanged; warnings once; deep-frozen in dev', () => {
    const warn = vi.fn()
    const resolve = createI18nConfigResolver(warn)
    const first = resolve(base, { i18nRuntime: { defaultLocale: 'xx' } })
    // another request: a new runtimeConfig object with the same values
    expect(resolve(base, { i18nRuntime: { defaultLocale: 'xx' } })).toBe(first)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(Object.isFrozen(first) && Object.isFrozen(first.locales) && Object.isFrozen(first.locales![0])).toBe(true)
    expect(() => {
      ;(first.locales![0] as { disabled?: boolean }).disabled = true
    }).toThrow(TypeError)
    expect(resolve(base, { i18nRuntime: { defaultLocale: 'de' } }).defaultLocale).toBe('de')
  })
})
