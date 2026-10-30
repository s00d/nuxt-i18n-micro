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
})
