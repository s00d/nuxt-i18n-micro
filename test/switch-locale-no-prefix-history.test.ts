import type { PathStrategy } from '@i18n-micro/path-strategy'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { describe, expect, test, vi } from 'vitest'
import type { Router } from 'vue-router'
import { createNuxtI18nPluginApi, NuxtI18n, NuxtTranslationLoader } from '../src/runtime/utils/nuxt-i18n'

/**
 * Issue #238: under `no_prefix` the URL does not change on locale switch, so
 * `router.push` appends a duplicate history entry. Switching must `replace`.
 */
function makeApi(strategy: ModuleOptionsExtend['strategy'], switchApplies = true) {
  const push = vi.fn<(to?: unknown) => Promise<undefined>>(async () => undefined)
  const replace = vi.fn<(to?: unknown) => Promise<undefined>>(async () => undefined)
  const currentRoute = {
    path: '/',
    fullPath: '/',
    name: 'index',
    params: {},
    query: {},
    hash: '',
    matched: [],
    meta: {},
    redirectedFrom: undefined,
  }

  const router = {
    push,
    replace,
    currentRoute: { value: currentRoute },
    resolve: (to: unknown) => (typeof to === 'object' && to !== null ? { ...currentRoute, ...to } : currentRoute),
  } as unknown as Router

  const i18n = new NuxtI18n({ missingWarn: false })
  const loader = new NuxtTranslationLoader({
    i18n,
    loadOptions: { apiBaseUrl: '_locales', baseURL: '/' },
  })
  vi.spyOn(loader, 'switchContext').mockResolvedValue(switchApplies)
  const setLocale = vi.fn()

  const i18nStrategy = {
    switchLocaleRoute: () => ({ path: '/', name: 'index', force: undefined }),
    formatPathForResolve: (path: string) => path,
  } as unknown as PathStrategy

  const { provide } = createNuxtI18nPluginApi({
    i18n,
    loader,
    i18nStrategy,
    i18nConfig: {
      strategy,
      defaultLocale: 'en',
      locales: [
        { code: 'en', iso: 'en' },
        { code: 'es', iso: 'es' },
      ],
    } as ModuleOptionsExtend,
    router,
    getCurrentLocale: () => 'en',
    getEffectiveLocale: () => 'en',
    getPluginRouteName: () => 'index',
    getRouteName: () => 'index',
    i18nRouteParams: { value: {} },
    setLocale,
    isValidLocale: () => true,
    navigateTo: vi.fn(),
    setMissingHandler: vi.fn(),
  })

  return { provide, push, replace, setLocale }
}

describe('switchLocale history (#238)', () => {
  test('no_prefix replaces, prefixed strategies push, a superseded switch does nothing', async () => {
    // step 1: no_prefix → one forced replace to the same URL, no push (history.length does not grow)
    const noPrefix = makeApi('no_prefix')
    await noPrefix.provide.switchLocale('es')
    expect(noPrefix.replace).toHaveBeenCalledTimes(1)
    expect(noPrefix.push).not.toHaveBeenCalled()
    expect(noPrefix.replace.mock.calls[0]?.[0]).toEqual(expect.objectContaining({ force: true, path: '/' }))
    expect(noPrefix.setLocale).toHaveBeenCalled()

    // step 2: prefix → the URL changes, so a push
    const prefix = makeApi('prefix')
    await prefix.provide.switchLocale('es')
    expect(prefix.push).toHaveBeenCalledTimes(1)
    expect(prefix.replace).not.toHaveBeenCalled()

    // step 3: a newer switchContext superseded this one → no locale change, no navigation
    const superseded = makeApi('no_prefix', false)
    await superseded.provide.switchLocale('es')
    expect(superseded.setLocale).not.toHaveBeenCalled()
    expect(superseded.replace).not.toHaveBeenCalled()
    expect(superseded.push).not.toHaveBeenCalled()
  })
})
