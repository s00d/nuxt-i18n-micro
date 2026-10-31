import type { PathStrategy } from '@i18n-micro/path-strategy'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { describe, expect, test, vi } from 'vitest'
import { createMemoryHistory, createRouter, type RouteLocationRaw, type Router } from 'vue-router'
import { defaultPlural } from '@i18n-micro/core'
import { createNuxtI18nPluginApi, NuxtI18n, NuxtTranslationLoader } from '../src/runtime/utils/nuxt-i18n'

/**
 * Issue #238: under `no_prefix` the URL does not change on locale switch, so
 * `router.push` appends a duplicate history entry. Switching must `replace`.
 */
interface MakeApiOptions {
  trailingSlash?: 'append' | 'remove'
  switched?: Record<string, unknown>
  hash?: string
  isHydrating?: () => boolean
  onSwitch?: (route: { hash?: string; path: string; fullPath: string }) => unknown
}

function makeApi(strategy: ModuleOptionsExtend['strategy'], switchApplies = true, options: MakeApiOptions = {}) {
  const push = vi.fn<(to?: unknown) => Promise<undefined>>(async () => undefined)
  const replace = vi.fn<(to?: unknown) => Promise<undefined>>(async () => undefined)
  const currentRoute = {
    path: '/',
    fullPath: `/${options.hash ?? ''}`,
    name: 'index',
    params: {},
    query: {},
    hash: options.hash ?? '',
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
  const setLocaleState = vi.fn()
  const navigateTo = vi.fn()

  const i18nStrategy = {
    switchLocaleRoute: (_from: string, _to: string, route: { hash?: string; path: string; fullPath: string }) =>
      options.onSwitch?.(route) ?? options.switched ?? { path: '/', name: 'index', force: undefined },
    localeRoute: (_locale: string, to: string) => ({ path: `/de${to}`, fullPath: `/de${to}` }),
  } as unknown as PathStrategy

  const { provide } = createNuxtI18nPluginApi({
    i18n,
    loader,
    i18nStrategy,
    i18nConfig: {
      strategy,
      trailingSlash: options.trailingSlash,
      defaultLocale: 'en',
      locales: [
        { code: 'en', iso: 'en' },
        { code: 'es', iso: 'es', baseUrl: 'https://es.example' },
      ],
    } as ModuleOptionsExtend,
    router,
    getCurrentLocale: () => 'en',
    getEffectiveLocale: () => 'en',
    getPluginRouteName: () => 'index',
    getRouteName: () => 'index',
    i18nRouteParams: { value: {} },
    setLocale,
    setLocaleState,
    isValidLocale: () => true,
    navigateTo,
    setMissingHandler: vi.fn(),
    isHydrating: options.isHydrating ?? (() => false),
  })

  return { provide, push, replace, setLocale, setLocaleState, navigateTo }
}

describe('$switchLocale when the navigation does not commit', () => {
  const failure = (type: number) => Object.assign(new Error('navigation failure'), { type })

  test('a duplicate keeps the URL and the preference: an excluded page has one URL', async () => {
    const { provide, push, setLocale } = makeApi('prefix')
    push.mockResolvedValueOnce(failure(16) as never)
    await provide.switchLocale('de')
    expect(setLocale.mock.calls).toEqual([['de']])
  })

  test.each([
    ['cancelled', 8],
    ['aborted', 4],
  ])('a %s one stores nothing and puts the state back', async (_name, type) => {
    const { provide, push, setLocale, setLocaleState } = makeApi('prefix')
    push.mockResolvedValueOnce(failure(type) as never)
    await provide.switchLocale('de')
    expect(setLocale).not.toHaveBeenCalled()
    expect(setLocaleState.mock.calls).toEqual([['de'], ['']])
  })
})

describe('$switchLocale decides after the navigation', () => {
  const failure = (type: number) => Object.assign(new Error('navigation failure'), { type })

  test('a blocked switch to a locale with a `baseUrl` on this host stores nothing', async () => {
    const { provide, push, setLocale } = makeApi('prefix', true, { switched: { path: '/es', fullPath: '/es' } })
    push.mockResolvedValueOnce(failure(4) as never)
    await provide.switchLocale('es')
    expect(setLocale).not.toHaveBeenCalled()
  })

  test('a switch that leaves for another host stores it first: no commit will', async () => {
    const { provide, setLocale, navigateTo } = makeApi('prefix', true, { switched: { path: 'https://es.example/', fullPath: 'https://es.example/' } })
    await provide.switchLocale('es')
    expect(navigateTo).toHaveBeenCalledOnce()
    expect(setLocale.mock.calls).toEqual([['es']])
  })

  test('a thrown navigation puts the state back and stores nothing', async () => {
    const { provide, push, setLocale, setLocaleState } = makeApi('prefix')
    push.mockRejectedValueOnce(new Error('guard threw'))
    await expect(provide.switchLocale('de')).rejects.toThrow('guard threw')
    expect(setLocale).not.toHaveBeenCalled()
    expect(setLocaleState.mock.calls).toEqual([['de'], ['']])
  })

  test('no_prefix goes by name with no path: the router encodes, and two pages can share a path', async () => {
    const switched = { name: 'two-de', params: { id: 'a b' }, query: {}, hash: '', path: '/co/a%20b', fullPath: '/co/a%20b' }
    const { provide, replace } = makeApi('no_prefix', true, { switched })
    await provide.switchLocale('es')
    expect(replace.mock.calls[0]?.[0]).toEqual({ name: 'two-de', params: { id: 'a b' }, query: {}, hash: '', force: true })
  })
})

describe('what <i18n-t> reads from the plugin', () => {
  test('$pluralFunc is the rule of the instance, $pluralLocale its tag', () => {
    const { provide } = makeApi('prefix')
    expect(provide.pluralFunc).toBe(defaultPlural)
    expect(provide.pluralLocale()).toBe('')
  })
})

describe('switchLocale history (#238)', () => {
  test('no_prefix replaces, prefixed strategies push, a superseded switch does nothing', async () => {
    // step 1: no_prefix → one forced replace to the same URL, no push (history.length does not grow)
    const noPrefix = makeApi('no_prefix')
    await noPrefix.provide.switchLocale('es')
    expect(noPrefix.replace).toHaveBeenCalledTimes(1)
    expect(noPrefix.push).not.toHaveBeenCalled()
    expect(noPrefix.replace.mock.calls[0]?.[0]).toEqual(expect.objectContaining({ force: true, name: 'index' }))
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

  test('the result says whether the dictionary applied', async () => {
    // step 1: a switch that applied
    expect(await makeApi('no_prefix').provide.switchLocale('es')).toBe(true)

    // step 2: its chunk failed or a newer switch won → false, nothing changed
    const failed = makeApi('no_prefix', false)
    expect(await failed.provide.switchLocale('es')).toBe(false)
    expect(failed.setLocale).not.toHaveBeenCalled()
  })
})

describe('links from the plugin', () => {
  test('$localePath and $localeRoute leave an external URL alone', () => {
    const { provide } = makeApi('prefix')
    // step 1: only an explicit scheme is a URL
    expect(provide.localePath('https://x.com/a', 'de')).toBe('https://x.com/a')
    expect(provide.localePath('mailto:a@x.com', 'de')).toBe('mailto:a@x.com')
    expect(provide.localePath('tel:+1', 'de')).toBe('tel:+1')
    // a request-shaped string or a dotted name is a path
    expect(provide.localePath('//x.com/a', 'de')).toBe('/de//x.com/a')
    expect(provide.localePath('about.html', 'de')).toBe('/deabout.html')
    // step 2: the route object carries the same URL
    expect(provide.localeRoute('https://x.com/a', 'de').fullPath).toBe('https://x.com/a')
  })

  test('$switchRoute never leaves the app for a string it was handed', async () => {
    for (const to of ['https://evil.example', '//evil.example', 'evil.example']) {
      const { provide, navigateTo } = makeApi('prefix', true, { switched: 'https://evil.example/x' as unknown as Record<string, unknown> })
      await provide.switchRoute(to)
      expect(navigateTo).not.toHaveBeenCalled()
    }
  })

  test('$switchRoute hands mailto: and tel: to the browser', async () => {
    for (const to of ['mailto:a@x.com', 'tel:+1']) {
      const { provide, navigateTo, push } = makeApi('prefix')
      await provide.switchRoute(to)
      expect(navigateTo).toHaveBeenCalledWith(to, expect.objectContaining({ external: true }))
      expect(push).not.toHaveBeenCalled()
    }
  })

  test("a switch to a locale's own domain is external", async () => {
    const { provide, navigateTo } = makeApi('prefix', true, { switched: 'https://es.example/x' as unknown as Record<string, unknown> })
    await provide.switchLocale('es')
    expect(navigateTo).toHaveBeenCalledWith('https://es.example/x', expect.objectContaining({ external: true }))
  })

  test('$switchLocaleRoute is a route object under a slash rule too', () => {
    const { provide } = makeApi('prefix', true, {
      trailingSlash: 'append',
      switched: { name: 'about', path: '/de/about', fullPath: '/de/about?q=1' },
    })
    expect(provide.switchLocaleRoute('es')).toEqual(expect.objectContaining({ path: '/de/about/', fullPath: '/de/about/?q=1' }))
    expect(provide.switchLocalePath('es')).toBe('/de/about/?q=1')
  })

  test('that route object is plain: its path, nothing hidden, the same after a copy', () => {
    const switched = { name: 'blog', params: { slug: 'a b' }, query: { q: '1' }, hash: '', path: '/de/a%20b', fullPath: '/de/a%20b?q=1' }
    const { provide } = makeApi('prefix', true, { trailingSlash: 'append', switched })
    const route = provide.switchLocaleRoute('es') as Record<string, unknown>
    expect(Object.getOwnPropertyNames(route).sort()).toEqual(['fullPath', 'hash', 'path', 'query'])
    expect(JSON.parse(JSON.stringify(route))).toEqual({ path: '/de/a%20b/', fullPath: '/de/a%20b/?q=1', query: { q: '1' }, hash: '' })
  })

  test('a push of that route object keeps the slash', async () => {
    const switched = { name: 'about', params: {}, query: { q: '1' }, hash: '', path: '/de/about', fullPath: '/de/about?q=1' }
    const { provide } = makeApi('prefix', true, { trailingSlash: 'append', switched })
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/de/about', name: 'about', component: {} }] })
    expect(router.resolve(provide.switchLocaleRoute('es') as RouteLocationRaw).fullPath).toBe('/de/about/?q=1')
  })

  test('while hydrating, links leave out a hash the server never saw', () => {
    const seen: (string | undefined)[] = []
    const { provide } = makeApi('prefix', true, {
      hash: '#h',
      isHydrating: () => true,
      onSwitch: (route) => {
        seen.push(route.hash)
        return route
      },
    })
    expect(provide.switchLocalePath('es')).toBe('/')
    provide.switchLocaleRoute('es')
    expect(seen).toEqual(['', ''])
  })
})
