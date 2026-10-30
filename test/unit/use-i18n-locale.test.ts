import { beforeEach, describe, expect, test, vi } from 'vitest'
import { useI18nLocale } from '../../src/runtime/composables/useI18nLocale'

const refs = vi.hoisted(() => ({ state: { value: null as string | null }, cookie: { value: null as string | null } }))

vi.mock('#app', () => ({
  useCookie: () => refs.cookie,
  useNuxtApp: () => ({}),
  useState: () => refs.state,
}))
vi.mock('../../src/runtime/utils/i18n-config', () => ({
  useResolvedI18nConfig: () => ({ locales: [{ code: 'en' }, { code: 'de' }], localeCookie: 'user-locale' }),
}))

describe('useI18nLocale', () => {
  beforeEach(() => {
    refs.state.value = null
    refs.cookie.value = null
  })

  test('getLocaleWithServerFallback: a stale value does not hide the server locale', () => {
    const { getLocaleWithServerFallback } = useI18nLocale()
    expect(getLocaleWithServerFallback('en')).toBe('en')
    refs.cookie.value = 'xx'
    expect(getLocaleWithServerFallback('en')).toBe('en')
    refs.state.value = 'de'
    expect(getLocaleWithServerFallback('en')).toBe('de')
    refs.state.value = null
    expect(getLocaleWithServerFallback()).toBeNull()
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
  })
})
