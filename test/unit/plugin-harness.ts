/**
 * Runs the real plugins of the module on a real vue-router and the real path strategy, without a Nuxt build: what Nuxt
 * hands a plugin is faked here, one app at a time. A test file mocks every Nuxt path with `stub`, see `plugin-layer.golden.test.ts`.
 * `import.meta.server` and `client` read `side`: `vitest.unit.config.ts` rewrites them under `src/runtime/`.
 */
import { I18nPathStrategy } from '@i18n-micro/path-strategy'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { createHooks } from 'hookable'
import type { NuxtPage } from '@nuxt/schema'
import { vi } from 'vitest'
import { computed, ref, shallowRef, type Ref } from 'vue'
import type { Router } from 'vue-router'
import { createAppRouter, generate, type Strategy } from '../helpers/routing-matrix'

export const PAGES = (): NuxtPage[] => [
  { path: '/', name: 'index', file: 'pages/index.vue' },
  { path: '/about', name: 'about', file: 'pages/about.vue' },
  { path: '/news/:id', name: 'news-id', file: 'pages/news/[id].vue' },
]

export type Side = 'server' | 'client' | 'spa'

export interface AppOptions {
  side: Side
  strategy: Strategy
  hashMode?: boolean
  url: string
  cookie?: string
  /** The `i18n-locale` state a user plugin or the payload set before ours. */
  state?: string
  /** What the Nitro middleware detected. */
  detected?: string
  config?: Partial<ModuleOptionsExtend>
  /** Chunks whose load fails, `locale:route`. */
  failing?: Set<string>
  /** Answers a chunk; `undefined` falls back to the default small dictionary. */
  chunk?: (locale: string, route: string) => Record<string, unknown> | undefined
  /** `event.context.i18n.translations`: the `serverTranslationPreload` chunk. */
  preloaded?: Record<string, unknown>
  /** Plain routes with no generated records: for locales the generated ones (en, de, fr) do not list. */
  unlocalized?: boolean
}

export interface App {
  options: AppOptions
  router: Router
  nuxtApp: Record<string, any>
  config: ModuleOptionsExtend
  state: Map<string, Ref>
  cookies: Record<string, string | null | undefined>
  /** Every cookie write, in order. */
  cookieWrites: string[]
  loads: string[]
  heads: unknown[]
  navigations: string[]
}

let current: App | null = null
export const app = (): App => current!

const flag = () => globalThis as unknown as { __i18nSide?: Side }

/** A chunk with one key of its own per locale and route, one of each shared across routes, and a nested node. */
export const smallChunk = (locale: string, route: string): Record<string, unknown> => ({
  [`own_${route}`]: `${locale} ${route}`,
  shared: `${locale} shared`,
  nested: { key: `${locale} nested ${route}` },
})

/** Every Nuxt path of the plugins. In unit tests they all alias to one module, so one mock answers them all. */
export const stub = {
  defineNuxtPlugin: (definition: unknown) => definition,
  useNuxtApp: () => app().nuxtApp,
  useRouter: () => app().router,
  useRoute: () => {
    const { router } = app()
    return new Proxy({}, { get: (_, key) => (router.currentRoute.value as unknown as Record<string | symbol, unknown>)[key] })
  },
  useRuntimeConfig: () => ({ app: { baseURL: '/' }, public: {} }),
  useRequestURL: () => new URL('https://example.com/'),
  useError: () => ({ value: null }),
  useState: (key: string, init?: () => unknown) => {
    const { state } = app()
    if (!state.has(key)) state.set(key, ref(init?.()))
    return state.get(key)
  },
  useCookie: (name: string) => {
    const { cookies, cookieWrites } = app()
    return {
      get value() {
        return cookies[name] ?? null
      },
      set value(next: string | null) {
        cookies[name] = next
        cookieWrites.push(`${name}=${next}`)
      },
    }
  },
  useHead: (input: unknown) => {
    app().heads.push(input)
  },
  injectHead: () => ({ hooks: { hook: () => () => {} } }),
  navigateTo: (to: string) => {
    app().navigations.push(to)
  },
  createError: (input: { statusCode: number; statusMessage: string }) => Object.assign(new Error(input.statusMessage), input),
  getI18nConfig: () => app().config,
  createI18nStrategy: (router: Router, config: ModuleOptionsExtend) =>
    new I18nPathStrategy({
      strategy: config.strategy,
      defaultLocale: config.defaultLocale,
      locales: config.locales,
      localizedRouteNamePrefix: config.localizedRouteNamePrefix,
      router,
      hashMode: config.hashMode,
      disablePageLocales: config.disablePageLocales,
    } as ConstructorParameters<typeof I18nPathStrategy>[0]),
  domains: false,
  cookies: true,
  plural: (_key: string, count: number, _params: unknown, _locale: string, t: (key: string) => unknown) => t(count === 1 ? 'one' : 'many'),
}

function fakeFetch(a: App) {
  return vi.fn(async (url: string) => {
    const [, route, locale] = /_locales\/([^/]+)\/([^/]+)\/data\.json/.exec(url) ?? []
    return load(a, locale!, route!)
  })
}

function load(a: App, locale: string, route: string) {
  const key = `${locale}:${route}`
  a.loads.push(key)
  if (a.options.failing?.has(key)) return Promise.reject(Object.assign(new Error('503'), { status: 503 }))
  return Promise.resolve(a.options.chunk?.(locale, route) ?? smallChunk(locale, route))
}

function fakeNuxtApp(a: App): Record<string, any> {
  const { options } = a
  const hooks = createHooks<Record<string, (...args: never[]) => unknown>>()
  const context = { locale: options.detected, translations: options.preloaded ?? {}, config: a.config, load: (l: string, r: string) => load(a, l, r) }
  const nuxtApp: Record<string, any> = {
    hooks,
    hook: hooks.hook,
    callHook: hooks.callHook,
    vueApp: { config: { globalProperties: {} } },
    payload: { serverRendered: options.side !== 'spa' },
    isHydrating: options.side === 'client',
    ssrContext: options.side === 'server' ? { event: { context: { i18n: context } } } : undefined,
    $config: { public: {} },
  }
  return nuxtApp
}

/** Nuxt's `provide`, and the `$` copy on the template side. */
export function provide(nuxtApp: Record<string, any>, provided: Record<string, unknown> | undefined) {
  for (const [key, value] of Object.entries(provided ?? {})) {
    Object.defineProperty(nuxtApp, `$${key}`, { get: () => value, configurable: true, enumerable: true })
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, `$${key}`, { get: () => value, configurable: true, enumerable: true })
  }
}

type Plugin = { setup?: (nuxtApp: unknown) => unknown } | ((nuxtApp: unknown) => unknown)

export async function runPlugin(plugin: unknown, nuxtApp = app().nuxtApp) {
  const result = await (typeof plugin === 'function' ? plugin(nuxtApp) : (plugin as Exclude<Plugin, Function>).setup?.(nuxtApp))
  provide(nuxtApp, (result as { provide?: Record<string, unknown> } | undefined)?.provide)
}

const LOCALES = [{ code: 'en', iso: 'en-US' }, { code: 'de', iso: 'de-DE' }, { code: 'fr', iso: 'fr-FR' }]

/** One app, routed to `url` as Nuxt's router plugin leaves it for ours: on the server pushed, in the browser ready. */
export async function createApp(options: AppOptions): Promise<App> {
  flag().__i18nSide = options.side
  const { strategy, hashMode = false } = options
  const config = {
    locales: LOCALES,
    defaultLocale: 'en',
    strategy,
    hashMode,
    localizedRouteNamePrefix: 'localized-',
    localeCookie: 'user-locale',
    apiBaseUrl: '_locales',
    missingWarn: false,
    autoDetectLanguage: false,
    routesLocaleLinks: {},
    ...options.config,
  } as ModuleOptionsExtend
  const router = createAppRouter(options.unlocalized ? PAGES() : generate(strategy, 'pages', {}, { pages: PAGES }))
  const a: App = {
    options,
    router,
    nuxtApp: {},
    config,
    state: new Map(),
    cookies: {},
    cookieWrites: [],
    loads: [],
    heads: [],
    navigations: [],
  }
  if (options.cookie) a.cookies[hashMode ? 'hash-locale' : 'user-locale'] = options.cookie
  if (options.state) a.state.set('i18n-locale', ref(options.state))
  a.nuxtApp = fakeNuxtApp(a)
  current = a
  vi.stubGlobal('$fetch', fakeFetch(a))
  await router.push(options.url)
  return a
}

/** Nuxt's `app:created`: on the client the first route is replaced, with no name, once the plugins ran. */
export async function hydrate(a: App = app()) {
  if (a.options.side === 'server') return
  const { fullPath } = a.router.currentRoute.value
  await a.router.replace({ path: fullPath, force: true })
  a.nuxtApp.isHydrating = false
  await a.nuxtApp.callHook('app:suspense:resolve')
}

export const cookieState = (a: App = app()) => JSON.stringify(a.cookies)
export const stateOf = (a: App = app()) => (a.state.get('i18n-locale')?.value as string | null | undefined) ?? '-'

export { computed, shallowRef }
