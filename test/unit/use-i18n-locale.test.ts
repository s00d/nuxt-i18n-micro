import { beforeEach, describe, expect, test, vi } from 'vitest'
import { useI18nLocale } from '../../src/runtime/composables/useI18nLocale'

const refs = vi.hoisted(() => ({
  state: { value: null as string | null },
  cookie: { value: null as string | null },
  cookieCalls: [] as [string, Record<string, unknown>][],
  config: { locales: [{ code: 'en' }, { code: 'de' }], localeCookie: 'user-locale' } as Record<string, unknown>,
}))

// every Nuxt path is one stub in unit tests, so one mock answers them all
vi.mock('#app/nuxt', () => ({
  cookies: true,
  useCookie: (name: string, options: Record<string, unknown>) => {
    refs.cookieCalls.push([name, options])
    return refs.cookie
  },
  useNuxtApp: () => ({}),
  useState: () => refs.state,
}))
vi.mock('../../src/runtime/utils/i18n-config', () => ({
  useResolvedI18nConfig: () => refs.config,
}))

describe('useI18nLocale', () => {
  beforeEach(() => {
    refs.state.value = null
    refs.cookie.value = null
  })

  test('getPreferredLocale: a stale value counts as none', () => {
    const { getPreferredLocale } = useI18nLocale()
    expect(getPreferredLocale()).toBeNull()
    refs.cookie.value = 'xx'
    expect(getPreferredLocale()).toBeNull()
    refs.state.value = 'de'
    expect(getPreferredLocale()).toBe('de')
  })

  test('resolveInitialLocale: the URL wins over the state and the server, then state, server, route', () => {
    const { resolveInitialLocale } = useI18nLocale()
    const fromRoute = () => 'en'
    refs.state.value = 'de'
    expect(resolveInitialLocale({ route: {}, urlLocale: 'en', serverLocale: 'de', getLocaleFromRoute: fromRoute })).toBe('en')
    expect(refs.state.value).toBe('de')
    expect(resolveInitialLocale({ route: {}, urlLocale: null, serverLocale: 'en', getLocaleFromRoute: fromRoute })).toBe('de')

    refs.state.value = 'xx'
    expect(resolveInitialLocale({ route: {}, urlLocale: 'de', serverLocale: 'en', getLocaleFromRoute: fromRoute })).toBe('de')
    expect(refs.state.value).toBe('de')

    refs.state.value = null
    expect(resolveInitialLocale({ route: {}, serverLocale: 'de', getLocaleFromRoute: () => 'en' })).toBe('de')
    refs.state.value = null
    expect(resolveInitialLocale({ route: {}, getLocaleFromRoute: () => 'en' })).toBe('en')

    // a URL bound to a locale renders it, the state keeps the visitor's
    refs.state.value = null
    expect(resolveInitialLocale({ route: {}, urlLocale: 'de', preference: 'en', getLocaleFromRoute: fromRoute })).toBe('de')
    expect(refs.state.value).toBe('en')
  })
})

describe('useI18nLocale cookie options', () => {
  test('the browser writes the cookie with localeCookieOptions, and with the defaults without them', () => {
    refs.cookieCalls.length = 0
    useI18nLocale()
    expect(refs.cookieCalls[0]).toEqual(['user-locale', expect.objectContaining({ path: '/', sameSite: 'lax', maxAge: 31536000 })])
    expect(refs.cookieCalls[0]![1]).not.toHaveProperty('domain')
    const config = refs.config
    refs.config = { ...config, localeCookieOptions: { domain: '.example.com', secure: true, sameSite: 'none', maxAge: 60 } }
    try {
      refs.cookieCalls.length = 0
      useI18nLocale()
      expect(refs.cookieCalls[0]![1]).toMatchObject({ domain: '.example.com', secure: true, sameSite: 'none', maxAge: 60, path: '/' })
    } finally {
      refs.config = config
    }
  })
})
