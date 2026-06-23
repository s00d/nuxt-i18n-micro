import { resolveOgLocale, warnUnresolvedOgLocale } from '../src/resolve-og-locale'

describe('resolveOgLocale', () => {
  it('returns explicit og when set', () => {
    expect(resolveOgLocale({ code: 'en', iso: 'en-US', og: 'en_GB' })).toBe('en_GB')
  })

  it('converts BCP 47 iso with region to OG format', () => {
    expect(resolveOgLocale({ code: 'en', iso: 'en-US' })).toBe('en_US')
    expect(resolveOgLocale({ code: 'ar', iso: 'ar-AE' })).toBe('ar_AE')
    expect(resolveOgLocale({ code: 'de', iso: 'de-DE' })).toBe('de_DE')
  })

  it('normalizes legacy underscore iso values', () => {
    expect(resolveOgLocale({ code: 'en', iso: 'en_EN' })).toBe('en_EN')
    expect(resolveOgLocale({ code: 'de', iso: 'de_DE' })).toBe('de_DE')
  })

  it('returns null when iso cannot be mapped safely', () => {
    expect(resolveOgLocale({ code: 'en', iso: 'en' })).toBeNull()
    expect(resolveOgLocale({ code: 'zh', iso: 'zh-Hans' })).toBeNull()
    expect(resolveOgLocale({ code: 'zh', iso: 'zh-Hans-CN' })).toBeNull()
    expect(resolveOgLocale({ code: 'en' })).toBeNull()
  })

  it('ignores empty og string', () => {
    expect(resolveOgLocale({ code: 'en', iso: 'en-US', og: '   ' })).toBe('en_US')
  })
})

describe('warnUnresolvedOgLocale', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    jest.restoreAllMocks()
  })

  it('warns in development when og locale cannot be resolved', () => {
    process.env.NODE_ENV = 'development'
    const warn = jest.spyOn(console, 'warn').mockImplementation()

    warnUnresolvedOgLocale({ code: 'zh', iso: 'zh-Hans' })

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("locale 'zh'"))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('og:locale'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("iso: 'zh-Hans'"))
  })

  it('does not warn when og locale resolves', () => {
    process.env.NODE_ENV = 'development'
    const warn = jest.spyOn(console, 'warn').mockImplementation()

    warnUnresolvedOgLocale({ code: 'en', iso: 'en-US' })

    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn in production', () => {
    process.env.NODE_ENV = 'production'
    const warn = jest.spyOn(console, 'warn').mockImplementation()

    warnUnresolvedOgLocale({ code: 'en', iso: 'en' })

    expect(warn).not.toHaveBeenCalled()
  })

  it('respects missingWarn: false', () => {
    process.env.NODE_ENV = 'development'
    const warn = jest.spyOn(console, 'warn').mockImplementation()

    warnUnresolvedOgLocale({ code: 'en', iso: 'en' }, { missingWarn: false })

    expect(warn).not.toHaveBeenCalled()
  })
})
