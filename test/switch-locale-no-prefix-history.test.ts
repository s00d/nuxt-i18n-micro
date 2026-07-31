import type { PathStrategy } from '@i18n-micro/path-strategy'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { describe, expect, it, vi } from 'vitest'
import type { Router } from 'vue-router'
import { createNuxtI18nPluginApi, NuxtI18n, NuxtTranslationLoader } from '../src/runtime/utils/nuxt-i18n'

/**
 * Issue #238: under `no_prefix` the URL does not change on locale switch, so
 * `router.push` appends a duplicate history entry. Switching must `replace`.
 */
function makeApi(strategy: ModuleOptionsExtend['strategy']) {
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
  vi.spyOn(loader, 'switchContext').mockResolvedValue(undefined)

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
    setLocale: vi.fn(),
    isValidLocale: () => true,
    navigateTo: vi.fn(),
    setMissingHandler: vi.fn(),
  })

  return { provide, push, replace }
}

describe('switchLocale history (#238)', () => {
  it('uses router.replace under no_prefix so history.length does not grow', async () => {
    const { provide, push, replace } = makeApi('no_prefix')

    await provide.switchLocale('es')

    expect(replace).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
    const arg = replace.mock.calls[0]?.[0] as { force?: boolean; path?: string } | undefined
    expect(arg).toEqual(expect.objectContaining({ force: true, path: '/' }))
  })

  it('keeps router.push for prefixed strategies', async () => {
    const { provide, push, replace } = makeApi('prefix')

    await provide.switchLocale('es')

    expect(push).toHaveBeenCalledTimes(1)
    expect(replace).not.toHaveBeenCalled()
  })
})
