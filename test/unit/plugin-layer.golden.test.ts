/**
 * Characterization of the plugin layer: the real plugins on a real router (plugin-harness.ts), one line per step. A change
 * in one of these files is either a fix named in the PR or a bug.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import plugin from '../../src/runtime/plugins/01.plugin'
import metaPlugin from '../../src/runtime/plugins/02.meta'
import { translationStorage } from '../../src/runtime/utils/storage'
import type { Strategy } from '../helpers/routing-matrix'
import { type App, type AppOptions, cookieState, createApp, hydrate, runPlugin, type Side, stateOf, stub } from './plugin-harness'

vi.mock('#imports', async () => (await import('./plugin-harness')).stub)

interface Variant {
  label: string
  strategy: Strategy
  hashMode?: boolean
}

const VARIANTS: Variant[] = [
  { label: 'prefix', strategy: 'prefix' },
  { label: 'prefix_except_default', strategy: 'prefix_except_default' },
  { label: 'prefix_and_default', strategy: 'prefix_and_default' },
  { label: 'no_prefix', strategy: 'no_prefix' },
  { label: 'hash', strategy: 'prefix', hashMode: true },
  { label: 'hash_no_prefix', strategy: 'no_prefix', hashMode: true },
]
const SIDES: Side[] = ['server', 'client', 'spa']

/** The URL of a page in a locale, under a variant. */
function urlOf({ strategy }: Variant, locale: string, page: string) {
  const tail = page === '/' ? '' : page
  if (strategy === 'no_prefix') return page
  if (strategy === 'prefix_except_default' && locale === 'en') return page
  return `/${locale}${tail}`
}

const LOCALE_IN_PATH = /^\/(en|de|fr)(?:\/|$)/

/** What the Nitro middleware leaves in the context: the URL's locale, else the cookie, else the default. */
const detect = (url: string, cookie?: string) => LOCALE_IN_PATH.exec(url)?.[1] ?? (cookie === 'de' ? cookie : 'en')

const silenced = () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
}

beforeEach(() => {
  silenced()
  translationStorage.clear()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const text = (a: App, key: string) => {
  const value = a.nuxtApp.$t(key)
  return typeof value === 'string' ? value : JSON.stringify(value)
}

/** The page's own key, whatever the page: `$t` answers from the dictionary on screen. */
function shown(a: App) {
  const route = String(a.nuxtApp.$getRouteName?.() ?? '')
  return text(a, `own_${route}`)
}

async function boot(options: AppOptions): Promise<string> {
  const a = await createApp(options)
  let failed = ''
  try {
    await runPlugin(plugin)
    await hydrate(a)
  } catch (error) {
    failed = ` throws=${(error as { statusCode?: number }).statusCode ?? (error as Error).message}`
  }
  const head = a.heads.length ? ` head=${a.heads.length}` : ''
  if (failed) return `state=${stateOf(a)} loads=[${a.loads}]${failed}`
  return `locale=${a.nuxtApp.$getLocale()} route=${a.nuxtApp.$getRouteName()} shown="${shown(a)}" state=${stateOf(a)} loads=[${a.loads}] cookies=${cookieState(a)} writes=[${a.cookieWrites}]${head}`
}

describe('boot', () => {
  test('url, cookie, state → locale, route, chunks, cookie', async () => {
    const lines: string[] = []
    for (const variant of VARIANTS)
      for (const side of SIDES)
        for (const url of ['/', '/about', '/de/about', '/fr', '/de/news/1', '/nope'])
          for (const cookie of [undefined, 'de', 'xx'])
            for (const state of [undefined, 'fr', 'xx']) {
              translationStorage.clear()
              const { strategy, hashMode } = variant
              const result = await boot({ side, strategy, hashMode, url, cookie, state, detected: detect(url, cookie) })
              lines.push(`${side} ${variant.label} ${url} cookie=${cookie ?? '-'} state=${state ?? '-'} → ${result}`)
            }
    await expect(lines.join('\n') + '\n').toMatchFileSnapshot('__golden__/plugin-boot.md')
  })

  test('the rest of the inputs', async () => {
    const cases: [string, AppOptions][] = [
      ['disablePageLocales', { side: 'server', strategy: 'prefix', url: '/de/about', detected: 'de', config: { disablePageLocales: true } }],
      ['disablePageLocales client', { side: 'client', strategy: 'prefix', url: '/de/about', config: { disablePageLocales: true } }],
      ['preload on index', { side: 'server', strategy: 'prefix', url: '/de', detected: 'de', preloaded: { own_index: 'seeded', shared: 'seeded' } }],
      ['preload on a page', { side: 'server', strategy: 'prefix', url: '/de/about', detected: 'de', preloaded: { own_index: 'seeded' } }],
      [
        'preload of another locale',
        { side: 'server', strategy: 'no_prefix', url: '/', detected: 'en', state: 'de', preloaded: { own_index: 'seeded' } },
      ],
      ['empty preload', { side: 'server', strategy: 'prefix', url: '/de', detected: 'de', preloaded: {} }],
      ['failed first load, server', { side: 'server', strategy: 'prefix', url: '/de/about', detected: 'de', failing: new Set(['de:about']) }],
      ['failed first load, client', { side: 'client', strategy: 'prefix', url: '/de/about', failing: new Set(['de:about']) }],
      ['failed first load and root', { side: 'client', strategy: 'prefix', url: '/de/about', failing: new Set(['de:about', 'de:__root']) }],
      ['hash, a detected shell', { side: 'spa', strategy: 'prefix', hashMode: true, url: '/', config: { autoDetectLanguage: true } }],
      [
        'hash, a shell with a cookie',
        { side: 'spa', strategy: 'prefix', hashMode: true, url: '/', cookie: 'fr', config: { autoDetectLanguage: true } },
      ],
      ['hash, the locale in the hash', { side: 'client', strategy: 'prefix', hashMode: true, url: '/de', state: 'en' }],
    ]
    vi.stubGlobal('navigator', { languages: ['fr', 'en'] })
    const lines: string[] = []
    for (const [label, options] of cases) {
      translationStorage.clear()
      lines.push(`${label} → ${await boot(options)}`)
    }
    await expect(lines.join('\n') + '\n').toMatchFileSnapshot('__golden__/plugin-boot-inputs.md')
  })

  test('an island takes the locale of its prop', async () => {
    const a = await createApp({ side: 'server', strategy: 'prefix', url: '/__nuxt_island/x', detected: 'en' })
    a.nuxtApp.ssrContext.islandContext = { props: { locale: 'de' } }
    await runPlugin(plugin)
    expect([a.nuxtApp.$getLocale(), a.nuxtApp.$t('shared')]).toEqual(['de', 'de shared'])
  })
})

interface Step {
  label: string
  run(a: App, variant: Variant): Promise<unknown>
}

const pushTo =
  (locale: string, page: string): Step['run'] =>
  (a, variant) =>
    a.router.push(urlOf(variant, locale, page))

const NAVIGATIONS: Step[] = [
  { label: 'another page', run: pushTo('en', '/') },
  { label: 'another locale', run: pushTo('de', '/about') },
  { label: 'same URL', run: pushTo('en', '/about') },
  { label: 'same path, a query', run: (a, variant) => a.router.push(`${urlOf(variant, 'en', '/about')}?q=1`) },
  { label: 'same route, another param', run: pushTo('en', '/news/2') },
  { label: 'no such page', run: (a) => a.router.push('/en/nope/nope') },
  {
    label: 'a later guard aborts',
    run: async (a, variant) => {
      const stop = a.router.beforeEach(() => false)
      const failure = await a.router.push(urlOf(variant, 'de', '/'))
      stop()
      return failure
    },
  },
  {
    label: 'a chunk fails',
    run: async (a, variant) => {
      a.options.failing = new Set(['de:index'])
      return a.router.push(urlOf(variant, 'de', '/'))
    },
  },
  { label: '$switchLocale', run: (a) => a.nuxtApp.$switchLocale('de') },
  {
    label: '$switchLocale, chunk fails',
    run: async (a) => {
      a.options.failing = new Set(['de:about'])
      return a.nuxtApp.$switchLocale('de')
    },
  },
  { label: '$switchLocale, unknown', run: (a) => a.nuxtApp.$switchLocale('xx') },
  {
    label: 'params, then a new page',
    run: async (a, variant) => {
      a.nuxtApp.$setI18nRouteParams({ de: { id: 'x' } })
      return a.router.push(urlOf(variant, 'en', '/'))
    },
  },
  {
    label: 'params, then a query',
    run: async (a, variant) => {
      a.nuxtApp.$setI18nRouteParams({ de: { id: 'x' } })
      return a.router.push(`${urlOf(variant, 'en', '/about')}?q=1`)
    },
  },
]

const describeResult = (value: unknown) => {
  if (value === undefined) return 'ok'
  if (value instanceof Error) return `failure ${(value as Error & { type?: number }).type}`
  return String(value)
}

describe('navigation', () => {
  test('from a hydrated page: what applied, what stays, what is stored', async () => {
    const lines: string[] = []
    for (const variant of VARIANTS)
      for (const side of ['client', 'spa'] as const)
        for (const step of NAVIGATIONS) {
          translationStorage.clear()
          const a = await createApp({ side, strategy: variant.strategy, hashMode: variant.hashMode, url: urlOf(variant, 'en', '/about') })
          await runPlugin(plugin)
          await hydrate(a)
          a.cookieWrites.length = 0
          a.loads.length = 0
          const result = await step.run(a, variant).catch((error: Error) => `threw ${error.message}`)
          const params = JSON.stringify(a.state.get('i18n-route-params')?.value)
          lines.push(
            `${side} ${variant.label} ${step.label} → ${describeResult(result)} url=${a.router.currentRoute.value.fullPath} locale=${a.nuxtApp.$getLocale()} active=${a.nuxtApp.$t('shared')} leaving=${a.nuxtApp.$has('own_about')} state=${stateOf(a)} params=${params} loads=[${a.loads}] writes=[${a.cookieWrites}]`,
          )
        }
    await expect(lines.join('\n') + '\n').toMatchFileSnapshot('__golden__/plugin-navigation.md')
  })
})

/** Boots with a subscriber logging each call. `registers` a key named after the locale it was told. */
async function subscribed(variant: Variant, url: string, late = false) {
  const a = await createApp({ side: 'client', strategy: variant.strategy, hashMode: variant.hashMode, url })
  const calls: string[] = []
  const subscribe = () =>
    a.nuxtApp.hook('i18n:register', (register: (translations: unknown, locale?: string) => void, locale: string) => {
      calls.push(locale)
      register({ reg: `reg ${locale}` })
    })
  if (!late) subscribe()
  await runPlugin(plugin)
  await hydrate(a)
  if (late) subscribe()
  return { a, calls }
}

describe('i18n:register', () => {
  test('locale and result per navigation, per strategy', async () => {
    const lines: string[] = []
    for (const variant of VARIANTS) {
      translationStorage.clear()
      const { a, calls } = await subscribed(variant, urlOf(variant, 'en', '/about'))
      const log = (label: string) => {
        lines.push(
          `${variant.label} ${label} → calls=[${calls}] locale=${a.nuxtApp.$getLocale()} route=${a.nuxtApp.$getRouteName()} reg="${a.nuxtApp.$t('reg')}"`,
        )
        calls.length = 0
      }
      log('start')
      await a.router.push(urlOf(variant, 'de', '/about'))
      log('to de')
      await a.router.push(urlOf(variant, 'de', '/'))
      log('to index')
      await a.router.push(`${urlOf(variant, 'de', '/')}?q=1`)
      log('a query')
      await a.nuxtApp.$switchLocale('de')
      log('$switchLocale')
      a.options.failing = new Set(['fr:about'])
      await a.router.push(urlOf(variant, 'fr', '/about'))
      log('a failed chunk')
    }
    await expect(lines.join('\n') + '\n').toMatchFileSnapshot('__golden__/plugin-register.md')
  })

  test('a late subscriber is called on the next navigation; server start awaits it', async () => {
    const variant = VARIANTS[0]!
    const { a, calls } = await subscribed(variant, '/en/about', true)
    expect(calls).toEqual([])
    await a.router.push('/en')
    expect(calls).toEqual(['en'])

    translationStorage.clear()
    const server = await createApp({ side: 'server', strategy: 'prefix', url: '/de/about', detected: 'de' })
    server.nuxtApp.hook('i18n:register', async (register: (translations: unknown, locale?: string) => void, locale: string) => {
      await Promise.resolve()
      register({ reg: `reg ${locale}` })
      register({ other: 'other' }, 'fr')
    })
    await runPlugin(plugin)
    await hydrate(server)
    expect(server.nuxtApp.$t('reg')).toBe('reg de')
    expect(server.loads).toEqual(['de:about', 'fr:about'])
    expect(server.nuxtApp.$t('shared')).toBe('de shared')
  })
})

/** Every key the app exposes, grouped, with what a function does not matter here: names are the contract. */
function surface(a: App) {
  const names = (object: object) => Object.keys(object).sort().join(' ')
  return [
    `nuxtApp: ${Object.keys(a.nuxtApp)
      .filter((key) => key.startsWith('$'))
      .sort()
      .join(' ')}`,
    `globalProperties: ${names(a.nuxtApp.vueApp.config.globalProperties)}`,
    `useI18n: ${names(a.nuxtApp.$i18n)}`,
  ].join('\n')
}

describe('i18n:register without a subscriber', () => {
  test('no call and no merge, on start and on navigation', async () => {
    const a = await createApp({ side: 'client', strategy: 'prefix', url: '/en/about' })
    const callHook = vi.spyOn(a.nuxtApp, 'callHook')
    await runPlugin(plugin)
    await hydrate(a)
    await a.router.push('/en')
    expect(callHook.mock.calls.map(([name]) => name)).not.toContain('i18n:register')
  })

  test('`hooks: false`: a subscriber is not called', async () => {
    stub.hooks = false
    try {
      const { a, calls } = await subscribed(VARIANTS[0]!, '/en/about')
      await a.router.push('/en')
      expect(calls).toEqual([])
    } finally {
      stub.hooks = true
    }
  })

  test('a subscriber that throws stops the navigation', async () => {
    const { a } = await subscribed(VARIANTS[0]!, '/en/about')
    a.nuxtApp.hook('i18n:register', () => {
      throw new Error('subscriber')
    })
    await expect(a.router.push('/en')).rejects.toThrow('subscriber')
    expect(a.router.currentRoute.value.path).toBe('/en/about')
  })
})

describe('$defineI18nRoute', () => {
  test('merges the translations of the locale, again on a switch; the build-time forms do nothing', async () => {
    const a = await createApp({ side: 'client', strategy: 'no_prefix', url: '/about' })
    await runPlugin(plugin)
    await hydrate(a)
    const { $defineI18nRoute } = a.nuxtApp
    await $defineI18nRoute({ locales: ['en', 'de'] })
    await $defineI18nRoute({})
    await $defineI18nRoute({ locales: { en: { page: 'en page' }, de: { page: 'de page' } } })
    expect(a.nuxtApp.$t('page')).toBe('en page')
    await a.nuxtApp.$switchLocale('de')
    await vi.waitFor(() => expect(a.nuxtApp.$t('page')).toBe('de page'))
  })

  test('`define: false` provides nothing', async () => {
    stub.defineRoute = false
    try {
      const a = await createApp({ side: 'client', strategy: 'prefix', url: '/en/about' })
      await runPlugin(plugin)
      expect(a.nuxtApp.$defineI18nRoute).toBeUndefined()
    } finally {
      stub.defineRoute = true
    }
  })
})

describe('provide', () => {
  test('the surface of the app', async () => {
    const a = await createApp({ side: 'client', strategy: 'prefix', url: '/en/about' })
    await runPlugin(plugin)
    await runPlugin(metaPlugin)
    await expect(surface(a) + '\n').toMatchFileSnapshot('__golden__/plugin-provide.md')
  })

  test('the plugin keeps its name: nuxt-site-config waits for it', () => {
    expect((plugin as unknown as { name: string }).name).toBe('i18n-plugin-loader')
  })
})

describe('head', () => {
  const LOCALES = [
    { code: 'en', iso: 'en-US' },
    { code: 'ar', iso: 'ar-SA' },
    { code: 'he' },
    { code: 'fa-IR' },
    { code: 'ur', iso: 'ur-PK' },
    { code: 'de', iso: 'de-DE', dir: 'ltr' },
    { code: 'ar-ltr', iso: 'ar', dir: 'ltr' },
    { code: 'x-rtl', dir: 'rtl' },
    { code: 'y-auto', dir: 'auto' },
    { code: 'az-Arab' },
    { code: 'az-Latn' },
    { code: 'tr' },
  ]

  test('<html> of every locale', async () => {
    const lines: string[] = []
    for (const locale of LOCALES) {
      const a = await createApp({
        side: 'server',
        strategy: 'no_prefix',
        url: '/',
        state: locale.code,
        unlocalized: true,
        config: { locales: LOCALES as never },
      })
      await runPlugin(plugin)
      await runPlugin(metaPlugin)
      const getter = a.heads.find((head) => typeof head === 'function') as () => { htmlAttrs: object }
      lines.push(`${JSON.stringify(locale)} → ${JSON.stringify(getter().htmlAttrs)}`)
    }
    await expect(lines.join('\n') + '\n').toMatchFileSnapshot('__golden__/plugin-head.md')
  })
})
